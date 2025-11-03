import { useEffect, useState } from "react";
import type { User } from "../../types/auth";
import type { RoomData } from "../../types/room";
import { database } from "../../auth/config";
import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import "./Game.css";
import { UserPreview } from "./UserPreview";
import { DeckOfCards } from "./DeckOfCards";
import { CardRenderer } from "./CardRenderer";
import { useAuth } from "../../providers/UserProvider";
import { deckUtils } from "../../utils/deck";
import { ThrowPile } from "./ThrowPile";
import type { Card } from "../../data/Card";
import { WinModal } from "./WinModal";
import { useNavigate } from "react-router-dom";
import { ImInfo } from "react-icons/im";

const getCardRank = (card: Card, aceHigh: boolean = true): number => {
  if (card.type === "joker") {
    return 0;
  }
  switch (card.value) {
    case "A":
      return aceHigh ? 14 : 1;
    case "K":
      return 13;
    case "Q":
      return 12;
    case "J":
      return 11;
    default:
      return Number(card.value);
  }
};

type GameProps = {
  roomData: RoomData;
};

export default function Game({ roomData }: GameProps) {
  const [showHelperTextJokerReplacement, setShowHelperTextJokerReplacement] =
    useState<boolean>(false);
  const [
    showHelperButtonsPlaceCardToBoard,
    setShowHelperButtonsPlaceCardToBoard,
  ] = useState<boolean>(false);
  const [showGameInfo, setShowGameInfo] = useState<boolean>(false);

  const { user } = useAuth();
  const [users, setUsers] = useState<Record<string, User>>({});
  const [localRoomData, setLocalRoomData] = useState<RoomData>(roomData);

  //game loop
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(false);

  const [didPlayerDrawCard, setDidPlayerDrawCard] = useState<boolean>(false);
  const [didPlayerPerformAction, setDidPlayerPerformAction] =
    useState<boolean>(false);
  const [turnPhase, setTurnPhase] = useState<"idle" | "draw" | "action">(
    "idle"
  );

  // per-phase timer (seconds) and current turn phase
  const [timeLeftSec, setTimeLeftSec] = useState<number>(
    localRoomData.timerForTurns
  );

  async function realtimeUpdate(roomId: string) {
    if (!roomId) return;
    const roomRef = doc(database, "rooms", roomId);
    const unsub = onSnapshot(
      roomRef,
      (snap) => {
        if (!snap.exists()) {
          return;
        }
        setLocalRoomData(snap.data() as RoomData);
      },
      (err) => {
        console.error("snapshot error:", err);
      }
    );
    return () => unsub();
  }

  //check for win
  const [showWinAlert, setShowWinAlert] = useState<boolean>(false);
  useEffect(() => {
    if (localRoomData.gameState.isFinished) {
      setShowWinAlert(true);
    }
  }, [localRoomData.gameState.isFinished]);

  useEffect(() => {
    if (roomData?.id) {
      realtimeUpdate(roomData.id);
    }
  }, [roomData?.id]);

  useEffect(() => {
    if (user) {
      setIsPlayerTurn(localRoomData.gameState.currentTurnPlayerId === user.uid);
    }
    const localDidPlayerDrawCard = localStorage.getItem(
      `${localRoomData.id}-didPlayerDrawCard`
    );
    const localDidPlayerPerformAction = localStorage.getItem(
      `${localRoomData.id}-didPlayerPerformAction`
    );

    const localTurnPhase = localStorage.getItem(
      `${localRoomData.id}-turnPhase`
    );
    setDidPlayerDrawCard(localDidPlayerDrawCard === "true");
    setDidPlayerPerformAction(localDidPlayerPerformAction === "true");
    if (
      localTurnPhase === "idle" ||
      localTurnPhase === "draw" ||
      localTurnPhase === "action"
    ) {
      setTurnPhase(localTurnPhase);
    }
  }, [localRoomData.gameState.currentTurnPlayerId, user]);

  useEffect(() => {
    if (!isPlayerTurn) {
      setTurnPhase("idle");
      localStorage.setItem(`${localRoomData.id}-turnPhase`, "idle");
      return;
    }
    // start with draw phase
    setTurnPhase("draw");
    localStorage.setItem(`${localRoomData.id}-turnPhase`, "draw");
    setTimeLeftSec(localRoomData.timerForTurns);
  }, [isPlayerTurn, localRoomData.timerForTurns]);

  useEffect(() => {
    if (!isPlayerTurn) return;
    if (didPlayerDrawCard) {
      setTurnPhase("action");
      localStorage.setItem(`${localRoomData.id}-turnPhase`, "action");
      setTimeLeftSec(localRoomData.timerForTurns);
    }
  }, [didPlayerDrawCard, isPlayerTurn, localRoomData.timerForTurns]);

  // when player finished action -> idle
  useEffect(() => {
    if (didPlayerPerformAction) {
      setTurnPhase("idle");
      localStorage.setItem(`${localRoomData.id}-turnPhase`, "idle");
    }
  }, [didPlayerPerformAction]);

  // timer that resets per phase and logs remaining seconds
  useEffect(() => {
    if (turnPhase === "idle") return;
    setTimeLeftSec(localRoomData.timerForTurns);
    const interval = setInterval(() => {
      setTimeLeftSec((prev) => {
        const next = Math.max(prev - 1, 0);
        console.log(`Time left [${turnPhase}]:`, next);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [turnPhase, localRoomData.timerForTurns]);

  useEffect(() => {
    if (
      isPlayerTurn &&
      didPlayerDrawCard &&
      !didPlayerPerformAction &&
      turnPhase === "action"
    ) {
      updateDatabaseAfterDraw();
    }

    if (
      isPlayerTurn &&
      didPlayerPerformAction &&
      turnPhase === "idle" &&
      didPlayerDrawCard
    ) {
      updateGameAfterAction();

      //check for win condition here
      if (localRoomData.gameState.hands[user!.uid].length === 0) {
        console.log("You have won the game!");
        try {
          const roomRef = doc(database, "rooms", roomData.id);
          updateDoc(roomRef, {
            gameState: {
              ...localRoomData.gameState,
              isFinished: true,
              winnerName: user?.displayName,
            },
          });
          return;
        } catch (err) {
          console.error("Failed to update game state to finished:", err);
        }
      } else if (localRoomData.gameState.hands[user!.uid].length > 0) {
        //if all remaining cards are jokers - win as well
        const allJokers = localRoomData.gameState.hands[user!.uid].every(
          (c) => c.type === "joker"
        );
        if (allJokers) {
          try {
            const roomRef = doc(database, "rooms", roomData.id);
            updateDoc(roomRef, {
              gameState: {
                ...localRoomData.gameState,
                isFinished: true,
                winnerName: user?.displayName,
              },
            });
            return;
          } catch (err) {
            console.error("Failed to update game state to finished:", err);
          }
        }
      }

      //end turn, reset states, change turn to next player
      try {
        //select next player from currentPlayerIds, select next, if the current player is last - select first
        const newPlayerTurnId = (() => {
          const currentIds = localRoomData.currentPlayerIds;
          const currentIndex = currentIds.indexOf(
            localRoomData.gameState.currentTurnPlayerId
          );
          if (currentIndex === -1) return currentIds[0];
          if (currentIndex === currentIds.length - 1) return currentIds[0];
          return currentIds[currentIndex + 1];
        })();

        const newGameState = {
          ...localRoomData.gameState,
          currentTurnPlayerId: newPlayerTurnId,
          turnNumber: localRoomData.gameState.turnNumber + 1,
        };

        const roomRef = doc(database, "rooms", roomData.id);
        updateDoc(roomRef, { gameState: newGameState });
      } catch (err) {
        console.error("Failed to determine next player turn:", err);
      }

      setDidPlayerDrawCard(false);
      setDidPlayerPerformAction(false);
      localStorage.setItem(`${localRoomData.id}-didPlayerDrawCard`, "false");
      localStorage.setItem(
        `${localRoomData.id}-didPlayerPerformAction`,
        "false"
      );

      setTurnPhase("idle");
      localStorage.setItem(`${localRoomData.id}-turnPhase`, "idle");
    }
  }, [turnPhase]);

  async function updateDatabaseAfterDraw() {
    const newGameState = { ...localRoomData.gameState };
    newGameState.hands[user!.uid] = localRoomData.gameState.hands[user!.uid];
    newGameState.deck = localRoomData.gameState.deck;
    try {
      const roomRef = doc(database, "rooms", roomData.id);
      await updateDoc(roomRef, { gameState: newGameState });
    } catch (err) {
      console.error("Failed to update game state after drawing card:", err);
    }
  }

  async function updateGameAfterAction() {
    const newGameState = { ...localRoomData.gameState };
    newGameState.hands[user!.uid] = localRoomData.gameState.hands[user!.uid];
    newGameState.throwPile = localRoomData.gameState.throwPile;
    newGameState.board = localRoomData.gameState.board;
    try {
      const roomRef = doc(database, "rooms", roomData.id);
      await updateDoc(roomRef, { gameState: newGameState });
    } catch (err) {
      console.error(
        "Failed to update game state after performing action:",
        err
      );
    }
  }

  //handle selected card state
  const [selectedCards, setSelectedCards] = useState<
    { playerId: string; cardIndex: number }[]
  >([]);

  //first if you want to interact with any card, you need to click on the card and than with second click you choose what to do with it (throw away, place on board, swap with hand card, replace joker on board)
  async function selectCard(cardIndex: number, playerId: string) {
    if (!user) return;
    if (user.uid !== playerId) return;

    const isAlreadySelected = selectedCards.find(
      (c) => c.cardIndex === cardIndex && c.playerId === playerId
    );
    if (isAlreadySelected) {
      //deselect
      setSelectedCards((prev) =>
        prev.filter(
          (c) => !(c.cardIndex === cardIndex && c.playerId === playerId)
        )
      );
    } else {
      //select
      setSelectedCards((prev) => [...prev, { playerId, cardIndex }]);
    }
  }

  async function fetchUsers() {
    const userIds = roomData.currentPlayerIds;
    const usersData: Record<string, User> = {};
    for (const userId of userIds) {
      const userDoc = doc(database, "users", userId);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        usersData[userId] = userSnapshot.data() as User;
      }
    }
    setUsers(usersData);
  }

  //functions for taking cards
  async function takeCardFromDeck() {
    if (!user) return;
    if (didPlayerDrawCard)
      return alert("You have already drawn a card this turn.");
    if (turnPhase !== "draw") return alert("You are not in the draw phase.");

    const { updatedDeck, updatedHand } = deckUtils.takeCard(
      roomData.gameState.deck,
      roomData.gameState.hands[user.uid] || []
    );
    setLocalRoomData((prev) => ({
      ...prev,
      gameState: {
        ...prev.gameState,
        deck: updatedDeck,
        hands: {
          ...prev.gameState.hands,
          [user.uid]: updatedHand,
        },
      },
    }));

    setDidPlayerDrawCard(true);
    localStorage.setItem(`${localRoomData.id}-didPlayerDrawCard`, "true");
    //after end of turn, sync with backend
  }

  async function takeCardFromThrowPile() {
    if (!user) return;
    if (didPlayerDrawCard)
      return alert("You have already drawn a card this turn.");
    if (
      localRoomData.gameState.turnNumber <
      4 * localRoomData.currentPlayerIds.length
    )
      return alert("You can draw from throw pile starting from turn 4.");
    if (turnPhase !== "draw") return alert("You are not in the draw phase.");

    const { updatedDeck, updatedHand } = deckUtils.takeTopCardFromThrowPile(
      localRoomData.gameState.throwPile,
      localRoomData.gameState.hands[user.uid]
    );
    setLocalRoomData((prev) => ({
      ...prev,
      gameState: {
        ...prev.gameState,
        throwPile: updatedDeck,
        hands: {
          ...prev.gameState.hands,
          [user.uid]: updatedHand,
        },
      },
    }));

    setDidPlayerDrawCard(true);
    localStorage.setItem(`${localRoomData.id}-didPlayerDrawCard`, "true");
    //after end of turn, sync with backend
  }

  //function will run on clicking on joker on board after selecting a card from hand
  async function replaceJokerOnBoard(
    playersBoardId: string,
    meldId: string, // <-- Changed from setIndex: number to meldId: string
    jokerCardIndex: number
  ) {
    if (!user) return;
    if (
      localRoomData.gameState.turnNumber <
      4 * localRoomData.currentPlayerIds.length
    )
      return alert("You can replace jokers on board starting from turn 4.");
    if (!didPlayerDrawCard) return alert("You need to draw a card first.");

    const playerBoardSets = localRoomData.gameState.board[playersBoardId];
    if (!playerBoardSets) return;

    // --- Use meldId (string key) to access the set ---
    const setOfCards = playerBoardSets[meldId];
    if (!setOfCards) return;

    const jokerCard = setOfCards[jokerCardIndex];
    if (jokerCard.type !== "joker") return;

    const selectedCard: Card =
      localRoomData.gameState.hands[user.uid][selectedCards[0].cardIndex];

    //replace joker with selected card (This is mutation, matching original style)
    setOfCards[jokerCardIndex] = selectedCard;

    const isReplacementValid = deckUtils.isPossibleSet(setOfCards);
    if (!isReplacementValid.isValid) {
      alert("Replacement would invalidate the set.");
      // Revert the mutation
      setOfCards[jokerCardIndex] = jokerCard;
      return;
    }

    //remove selected card from players hand
    const updatedHand = localRoomData.gameState.hands[user.uid].filter(
      (_, index) => index !== selectedCards[0].cardIndex
    );

    //add joker to player's hand
    updatedHand.push(jokerCard);

    // --- Create a new object for the player's board sets for immutable update ---
    const newPlayerBoardSets = {
      ...playerBoardSets,
      [meldId]: setOfCards, // Add the mutated (and validated) set
    };

    //update state
    setLocalRoomData((prev) => ({
      ...prev,
      gameState: {
        ...prev.gameState,
        hands: {
          ...prev.gameState.hands,
          [user.uid]: updatedHand,
        },
        board: {
          ...prev.gameState.board,
          [playersBoardId]: newPlayerBoardSets, // Use the new object
        },
      },
    }));

    //remove from selected cards
    setSelectedCards([]);
    /*     setDidPlayerDrawCard(true);
      localStorage.setItem(`${localRoomData.id}-didPlayerDrawCard`, "true"); */
  }

  //function for second player action
  async function throwCardAway(handCardIndex: number) {
    if (!user) return;
    if (!didPlayerDrawCard) return alert("You need to draw a card first.");
    if (didPlayerPerformAction)
      return alert("Wait for your next turn to perform another action.");

    const { updatedDeck, updatedHand } = deckUtils.throwCardAway(
      localRoomData.gameState.hands[user.uid],
      localRoomData.gameState.throwPile,
      handCardIndex
    );
    console.log("Throwing card away, updated deck:", updatedDeck);
    setLocalRoomData((prev) => ({
      ...prev,
      gameState: {
        ...prev.gameState,
        throwPile: updatedDeck,
        hands: {
          ...prev.gameState.hands,
          [user.uid]: updatedHand,
        },
      },
    }));

    //remove from selected cards
    setSelectedCards((prev) =>
      prev.filter(
        (c) => !(c.cardIndex === handCardIndex && c.playerId === user.uid)
      )
    );

    setDidPlayerPerformAction(true);
    localStorage.setItem(`${localRoomData.id}-didPlayerPerformAction`, "true");
  }

  async function placeSetOnBoard(userId: string) {
    if (!user) return;
    if (user.uid !== userId) return;
    if (!didPlayerDrawCard) return alert("You need to draw a card first.");
    if (didPlayerPerformAction)
      return alert("Wait for your next turn to perform another action.");
    if (
      localRoomData.gameState.turnNumber <
      4 * localRoomData.currentPlayerIds.length
    )
      return alert("You can place sets on board starting from turn 4.");
    //check that first set placed by each player must be "clean": 1,2,3 - no jokers, no sets like 5,5,5
    if (
      localRoomData.gameState.board[user.uid] === undefined ||
      Object.keys(localRoomData.gameState.board[user.uid] || {}).length === 0
    ) {
      const cardIndexesForSet: number[] = selectedCards
        .filter((c) => c.playerId === userId)
        .map((c) => c.cardIndex);
      const selectedCardsForInitialSet: Card[] = cardIndexesForSet.map(
        (index) => localRoomData.gameState.hands[user.uid][index]
      );
      const initialSetValidation = deckUtils.isPossibleSet(
        selectedCardsForInitialSet
      );
      if (!initialSetValidation.isValid) {
        alert("Your first set must be a clean set without jokers.");
        return;
      }
      //check if all cards dont have same value (no groups allowed)
      const allSameValue = selectedCardsForInitialSet.every(
        (c) => c.value === selectedCardsForInitialSet[0].value
      );
      if (allSameValue) {
        alert("Your first set must be a sequence, groups are not allowed.");
        return;
      }
    }

    const cardIndexes: number[] = selectedCards
      .filter((c) => c.playerId === userId)
      .map((c) => c.cardIndex);

    const selectedCardsForSet: Card[] = cardIndexes.map(
      (index) => localRoomData.gameState.hands[user.uid][index]
    );

    //validate set
    const validationResult = deckUtils.isPossibleSet(selectedCardsForSet);
    if (!validationResult.isValid) {
      alert(validationResult.error);
      return;
    }

    // --- Find the new meld ID after placing it ---
    const oldMeldIds = new Set(
      Object.keys(localRoomData.gameState.board[user.uid] || {})
    );

    const { updatedHand, updatedBoard } = deckUtils.putCardsOnBoard(
      localRoomData.gameState.hands[user.uid],
      cardIndexes,
      localRoomData.gameState.board,
      user.uid
    );

    const newMeldIds = Object.keys(updatedBoard[user.uid]);
    const newMeldId = newMeldIds.find((id) => !oldMeldIds.has(id));
    // --- End finding new meld ID ---

    //sort the newly placed set
    const playerMelds = updatedBoard[user.uid];

    // --- Check using newMeldId ---
    if (playerMelds && newMeldId && playerMelds[newMeldId]) {
      const newSet = playerMelds[newMeldId]; // Get the set using the string key

      const realCards = newSet.filter((c) => c.type !== "joker");
      const jokers = newSet.filter((c) => c.type === "joker");
      let finalSortedSet: Card[] = [];

      if (realCards.length === 0) {
        finalSortedSet = [...newSet];
      } else {
        const firstValue = realCards[0].value;
        const isGroup = realCards.every((c) => c.value === firstValue);

        const firstSuit = realCards[0].type;
        const isSequence = realCards.every((c) => c.type === firstSuit);

        if (isGroup) {
          finalSortedSet = [...newSet].sort((a, b) => {
            return getCardRank(a, true) - getCardRank(b, true);
          });
        } else if (isSequence) {
          const hasTwo = realCards.some((c) => c.value === 2);
          const hasAce = realCards.some((c) => c.value === "A");
          const isAceHigh = !(hasTwo && hasAce);

          const sortedRanks = realCards
            .map((c) => getCardRank(c, isAceHigh))
            .sort((a, b) => a - b);

          const cardsByRank = new Map<number, Card>();
          realCards.forEach((c) =>
            cardsByRank.set(getCardRank(c, isAceHigh), c)
          );

          const availableJokers = [...jokers];
          const minRank = sortedRanks[0];
          const maxRank = sortedRanks[sortedRanks.length - 1];

          for (let rank = minRank; rank <= maxRank; rank++) {
            if (cardsByRank.has(rank)) {
              finalSortedSet.push(cardsByRank.get(rank)!);
            } else if (availableJokers.length > 0) {
              finalSortedSet.push(availableJokers.pop()!);
            }
          }
          finalSortedSet.push(...availableJokers);
        } else {
          finalSortedSet = [...newSet];
        }
      }
      // Replace content of the set with the sorted version
      newSet.length = 0;
      newSet.push(...finalSortedSet);
    }

    setLocalRoomData((prev) => ({
      ...prev,
      gameState: {
        ...prev.gameState,
        hands: {
          ...prev.gameState.hands,
          [user.uid]: updatedHand,
        },
        board: updatedBoard,
      },
    }));

    //remove from selected cards
    setSelectedCards((prev) => prev.filter((c) => c.playerId !== userId));

    const serializeCard = (card: Card) => {
      return {
        name: card.name,
        value: card.value,
        type: card.type,
        imagePath: card.imagePath,
        backImagePath: card.backImagePath,
      };
    };

    // --- REFACTORED 'serialBoard' logic ---
    const serialBoard: Record<string, Record<string, any[]>> = {};
    for (const pid of Object.keys(updatedBoard)) {
      const playerMelds = updatedBoard[pid]; // This is Record<string, Card[]>
      serialBoard[pid] = {}; // Initialize inner object
      for (const meldId of Object.keys(playerMelds)) {
        const set = playerMelds[meldId]; // This is Card[]
        serialBoard[pid][meldId] = set.map((c) => serializeCard(c));
      }
    }

    const serialHands: Record<string, any[]> = {};
    for (const pid of Object.keys(localRoomData.gameState.hands)) {
      serialHands[pid] = (localRoomData.gameState.hands[pid] || []).map((c) =>
        serializeCard(c)
      );
    }

    try {
      const roomRef = doc(database, "rooms", roomData.id);
      await updateDoc(roomRef, {
        gameState: {
          ...localRoomData.gameState,
          hands: {
            ...serialHands,
            [user.uid]: updatedHand,
          },
          board: serialBoard, // Send the correct object structure
        },
      });
    } catch (err) {
      console.error(
        "Failed to update game state after placing set on board:",
        err
      );
    }
  }

  async function addCardToBoardSet(
    targetPlayerId: string,
    targetMeldId: string
  ) {
    if (!user) return;
    if (!didPlayerDrawCard) return alert("You need to draw a card first.");
    if (didPlayerPerformAction) {
      return alert("Wait for your next turn to perform another action.");
    }
    if (
      localRoomData.gameState.turnNumber <
      4 * localRoomData.currentPlayerIds.length
    ) {
      return alert("You can add cards to board sets starting from turn 4.");
    }
    if (selectedCards.length === 0) {
      return alert("You must select at least one card from your hand to add.");
    }
    if (selectedCards.some((c) => c.playerId !== user.uid)) {
      return alert("You can only add your own cards.");
    }

    const cardIndexes = selectedCards.map((c) => c.cardIndex);
    const cardsToAdd = cardIndexes.map(
      (index) => localRoomData.gameState.hands[user.uid][index]
    );

    const targetSet =
      localRoomData.gameState.board[targetPlayerId]?.[targetMeldId];
    if (!targetSet) {
      console.error("Target set not found:", targetPlayerId, targetMeldId);
      return alert("The set you are trying to add to does not exist.");
    }

    const newPotentialSet = [...targetSet, ...cardsToAdd];
    const validationResult = deckUtils.isPossibleSet(newPotentialSet);

    if (!validationResult.isValid) {
      return alert(`Invalid addition: ${validationResult.error}`);
    }

    const updatedHand = localRoomData.gameState.hands[user.uid].filter(
      (_, index) => !cardIndexes.includes(index)
    );

    const realCards = newPotentialSet.filter((c) => c.type !== "joker");
    const jokers = newPotentialSet.filter((c) => c.type === "joker");
    let finalSortedSet: Card[] = [];

    if (realCards.length === 0) {
      finalSortedSet = [...newPotentialSet]; // All jokers
    } else {
      const firstValue = realCards[0].value;
      const isGroup = realCards.every((c) => c.value === firstValue);

      const firstSuit = realCards[0].type;
      const isSequence = realCards.every((c) => c.type === firstSuit);

      if (isGroup) {
        finalSortedSet = [...newPotentialSet].sort((a, b) => {
          return getCardRank(a, true) - getCardRank(b, true);
        });
      } else if (isSequence) {
        const hasTwo = realCards.some((c) => c.value === 2);
        const hasAce = realCards.some((c) => c.value === "A");
        const isAceHigh = !(hasTwo && hasAce); // Ace is low if 2 is also present

        const sortedRanks = realCards
          .map((c) => getCardRank(c, isAceHigh))
          .sort((a, b) => a - b);

        const cardsByRank = new Map<number, Card>();
        realCards.forEach((c) => cardsByRank.set(getCardRank(c, isAceHigh), c));

        const availableJokers = [...jokers];
        const minRank = sortedRanks[0];
        const maxRank = sortedRanks[sortedRanks.length - 1];

        for (let rank = minRank; rank <= maxRank; rank++) {
          if (cardsByRank.has(rank)) {
            finalSortedSet.push(cardsByRank.get(rank)!);
          } else if (availableJokers.length > 0) {
            finalSortedSet.push(availableJokers.pop()!);
          }
        }
        // Add any remaining jokers (e.g., if they were at the ends)
        finalSortedSet.push(...availableJokers);
      } else {
        // Failsafe, though validation should prevent this
        finalSortedSet = [...newPotentialSet];
      }
    }

    // c. Set the new state immutably
    setLocalRoomData((prev) => ({
      ...prev,
      gameState: {
        ...prev.gameState,
        hands: {
          ...prev.gameState.hands,
          [user.uid]: updatedHand,
        },
        board: {
          ...prev.gameState.board,
          [targetPlayerId]: {
            ...prev.gameState.board[targetPlayerId],
            [targetMeldId]: finalSortedSet, // Update the specific meld
          },
        },
      },
    }));

    // 5. Cleanup
    setSelectedCards([]);

    // This action doesn't count as "performing an action" for the turn,
    // so the player still needs to throw a card away.
    // We also don't sync with the backend here, as that happens
    // after the player throws a card (updateGameAfterAction).
  }

  //you can swap cards in hand whenever you want
  async function swapCardsInHand(
    playerId: string,
    firstCardIndex: number,
    secondCardIndex: number
  ) {
    if (!user) return;
    if (user.uid !== playerId) return;

    const updatedHand = deckUtils.swapCardsInHand(
      localRoomData.gameState.hands[user.uid],
      firstCardIndex,
      secondCardIndex
    );
    setLocalRoomData((prev) => ({
      ...prev,
      gameState: {
        ...prev.gameState,
        hands: {
          ...prev.gameState.hands,
          [user.uid]: updatedHand,
        },
      },
    }));
    //remove from selected cards
    setSelectedCards((prev) =>
      prev.filter(
        (c) =>
          !(
            (c.cardIndex === firstCardIndex ||
              c.cardIndex === secondCardIndex) &&
            c.playerId === user.uid
          )
      )
    );

    try {
      const roomRef = doc(database, "rooms", roomData.id);
      await updateDoc(roomRef, {
        gameState: {
          ...localRoomData.gameState,
          hands: {
            ...localRoomData.gameState.hands,
            [user.uid]: updatedHand,
          },
        },
      });
    } catch (err) {
      console.error(
        "Failed to update game state after swapping cards in hand:",
        err
      );
    }
  }

  const navigate = useNavigate();
  async function handleCloseGame() {
    //delete room from database
    try {
      if (user?.uid === roomData.hostPlayerId) {
        const roomRef = doc(database, "rooms", roomData.id);
        await deleteDoc(roomRef);
      }
      navigate("/");
    } catch (err) {
      console.error("Failed to delete room:", err);
      navigate("/");
    }
  }

  //limit pro vyjetí

  useEffect(() => {
    fetchUsers();
  }, [roomData]);

  return (
    <div className="game-board">
      <div className="player-list__container">
        {Object.entries(users).map(([userId, user]) => (
          <UserPreview
            key={userId}
            userToDisplay={user}
            usersTurn={localRoomData.gameState.currentTurnPlayerId === userId}
            timer={
              localRoomData.gameState.currentTurnPlayerId === userId
                ? timeLeftSec
                : null
            }
          />
        ))}
      </div>

      <h2 className="game-title">{localRoomData.name}</h2>

      <div className="game-cards">
        <DeckOfCards
          numberOfCards={localRoomData.gameState.deck.length}
          pickCard={takeCardFromDeck}
        />

        {localRoomData.gameState.throwPile && (
          <ThrowPile
            cards={localRoomData.gameState.throwPile}
            takeCard={takeCardFromThrowPile}
          />
        )}
      </div>

      <div className="board-sets__container">
        {Object.entries(localRoomData.gameState.board).map(
          ([playerId, sets]) => (
            // 'sets' is now Record<string, Card[]>
            <div key={playerId} className="player-board-sets__container">
              <h4>
                {users[playerId]
                  ? users[playerId].displayName || "Unknown"
                  : "Unknown"}
                &nbsp;
                {user?.uid === playerId ? <strong>(You)</strong> : null}
              </h4>
              <div className="sets-container">
                {Object.entries(sets).map(([meldId, set]) => (
                  <div key={meldId} className="set-of-cards__container">
                    {set.map((card, cardIndex) => (
                      <CardRenderer
                        key={`${card.name}-${cardIndex}-${meldId}-${playerId}`}
                        cardPath={card.imagePath}
                        isHoverable
                        onClick={() => {
                          if (
                            card.type === "joker" &&
                            selectedCards.length === 1 &&
                            selectedCards[0].playerId === user?.uid
                          ) {
                            replaceJokerOnBoard(playerId, meldId, cardIndex);
                          }
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {Object.entries(localRoomData.gameState.hands).map(([playerId, hand]) => (
        <div key={`${playerId}-hand`}>
          <h3>
            {users[playerId]
              ? users[playerId].displayName || "Unknown"
              : "Unknown"}
            &nbsp;{user?.uid == playerId ? <strong>(You)</strong> : null}
          </h3>

          {hand.map((card, index) => (
            <CardRenderer
              cardPath={
                user?.uid === playerId ? card.imagePath : card.backImagePath
              }
              isHoverable
              onClick={
                user?.uid == playerId
                  ? () => selectCard(index, playerId)
                  : undefined
              }
              key={`${card.name}-${index}-${playerId}`}
              isSelected={
                !!selectedCards.find(
                  (c) => c.cardIndex === index && c.playerId === playerId
                )
              }
            />
          ))}
        </div>
      ))}
      <div className="player-actions">
        <h3 className="perform-action">Perform action:</h3>
        <div className="player-actions__buttons">
          {selectedCards && isPlayerTurn && (
            <>
              {isPlayerTurn && !didPlayerDrawCard && (
                <>
                  <button onClick={takeCardFromDeck}>
                    Draw Card from deck
                  </button>
                  <button onClick={takeCardFromThrowPile}>
                    Draw Card from Pile
                  </button>
                  <div>
                    <button
                      onClick={() =>
                        setShowHelperTextJokerReplacement(
                          !showHelperTextJokerReplacement
                        )
                      }
                    >
                      Switch joker on board for your card
                    </button>
                    {showHelperTextJokerReplacement && (
                      <p>
                        For swaping card for joker select one of your cards,
                        than click on the joker
                      </p>
                    )}
                  </div>
                </>
              )}

              {selectedCards.length == 0 &&
                didPlayerDrawCard &&
                !didPlayerPerformAction && (
                  <p>Select a card to perform an action.</p>
                )}

              {selectedCards.length == 1 &&
                didPlayerDrawCard &&
                !didPlayerPerformAction && (
                  <>
                    <button
                      onClick={() => throwCardAway(selectedCards[0].cardIndex)}
                    >
                      Throw Away Selected Card
                    </button>

                    <button
                      onClick={() =>
                        setShowHelperButtonsPlaceCardToBoard(
                          !showHelperButtonsPlaceCardToBoard
                        )
                      }
                    >
                      Place card to board
                    </button>
                    {showHelperButtonsPlaceCardToBoard && (
                      <div className="helper--place-to-board__container">
                        {Object.entries(localRoomData.gameState.board).map(
                          ([ownerId, ownerSets]) => (
                            <div key={ownerId} className="helper--player-sets">
                              <p>
                                {users[ownerId]?.displayName || "Unknown"}
                                {ownerId === user?.uid ? " (You)" : ""}
                              </p>
                              {Object.entries(ownerSets).map(
                                ([meldId, meldCards]) => (
                                  <button
                                    key={`${ownerId}-${meldId}`}
                                    onClick={() => {
                                      addCardToBoardSet(ownerId, meldId);
                                      setShowHelperButtonsPlaceCardToBoard(
                                        false
                                      );
                                    }}
                                    title="Add to this set"
                                  >
                                    <span>Add to set</span>
                                    <div>
                                      {meldCards.map((c, i) => (
                                        <img
                                          key={`${c.name}-${i}`}
                                          src={c.imagePath}
                                          alt={c.name}
                                          draggable={false}
                                        />
                                      ))}
                                    </div>
                                  </button>
                                )
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </>
                )}

              {selectedCards.length > 2 &&
                didPlayerDrawCard &&
                !didPlayerPerformAction && (
                  <button
                    onClick={() => placeSetOnBoard(selectedCards[0].playerId)}
                  >
                    Place set on board
                  </button>
                )}
            </>
          )}
          {selectedCards.length == 2 &&
            selectedCards[0].playerId === selectedCards[1].playerId && (
              <button
                onClick={() =>
                  swapCardsInHand(
                    selectedCards[0].playerId,
                    selectedCards[0].cardIndex,
                    selectedCards[1].cardIndex
                  )
                }
              >
                Swap Selected Cards in Hand
              </button>
            )}
          {!isPlayerTurn && (
            <p>Wait for your turn or select card to perform action</p>
          )}
        </div>
      </div>
      {showWinAlert && (
        <WinModal
          isOpen={showWinAlert}
          onClose={handleCloseGame}
          winnerName={localRoomData.gameState.winnerName ?? "Unknown"}
        />
      )}
      <button
        className="show-game-info"
        onClick={() => setShowGameInfo(!showGameInfo)}
        aria-label="Show game info"
      >
        <ImInfo />
      </button>
      {showGameInfo && (
        <div className="info-modal__container">
          <p>
            <span>Room id:</span>&nbsp;<span>{localRoomData.id}</span>
          </p>
          <p>
            <span>Name</span>&nbsp;<span>{localRoomData.name}</span>
          </p>
          <p>
            <span>Number of decks:</span>&nbsp;
            <span>{localRoomData.numberOfDecks}</span>
          </p>
          <p>
            <span>Current turn:</span>&nbsp;
            <span>
              {Math.floor(
                localRoomData.gameState.turnNumber /
                  localRoomData.currentPlayerIds.length
              )}
            </span>
          </p>
          {localRoomData.password && (
            <p>
              <span>Password:</span>&nbsp;<span>{localRoomData.password}</span>
            </p>
          )}
          <p>
            <span>Time for turn:</span>&nbsp;
            <span>{localRoomData.timerForTurns}</span>
          </p>
          <button onClick={handleCloseGame}>Leave game</button>
        </div>
      )}
    </div>
  );
}
