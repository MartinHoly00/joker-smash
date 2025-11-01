import { useEffect, useState } from "react";
import type { User } from "../../types/auth";
import type { RoomData } from "../../types/room";
import { database } from "../../auth/config";
import { doc, getDoc } from "firebase/firestore";
import "./Game.css";
import { UserPreview } from "./UserPreview";
import { DeckOfCards } from "./DeckOfCards";
import { CardRenderer } from "./CardRenderer";
import { useAuth } from "../../providers/UserProvider";
import { deckUtils } from "../../utils/deck";
import { ThrowPile } from "./ThrowPile";
import type { Card, CardType, CardValue } from "../../data/Card";

const getCardRank = (card: Card, aceHigh: boolean = true): number => {
  if (card.type === "joker") {
    // Žolíci jsou vždy první (nejnižší)
    return 0;
  }
  switch (card.value) {
    case "A":
      // Eso je buď 1 (v A-2-3) nebo 14 (v Q-K-A)
      return aceHigh ? 14 : 1;
    case "K":
      return 13;
    case "Q":
      return 12;
    case "J":
      return 11;
    // Tímto se zpracují číselné hodnoty 2-10
    default:
      return Number(card.value);
  }
};

type GameProps = {
  roomData: RoomData;
};

export default function Game({ roomData }: GameProps) {
  const { user } = useAuth();
  const [users, setUsers] = useState<Record<string, User>>({});
  const [localRoomData, setLocalRoomData] = useState<RoomData>(roomData);

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

  useEffect(() => {
    console.log("Selected cards: ", selectedCards);
  }, [selectedCards]);

  /*   const [hand, setHand] = useState<Card[]>([]);
  useEffect(() => {
    let playerHand = roomData.gameState.hands[user ? user.uid : "no-user"];
    if (!playerHand) return;

    setHand(playerHand);
    console.log("Player hand set to: ", playerHand);
  }, [roomData, user]); */

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

  async function takeCardFromDeck() {
    if (!user) return;
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

    //after end of turn, sync with backend
  }

  async function throwCardAway(handCardIndex: number) {
    if (!user) return;
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

    console.log(localRoomData);
  }

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
  }

  async function takeCardFromThrowPile() {
    if (!user) return;
    const { updatedDeck, updatedHand } = deckUtils.takeCard(
      localRoomData.gameState.throwPile,
      localRoomData.gameState.hands[user.uid] || []
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

    //after end of turn, sync with backend
  }

  async function placeSetOnBoard(userId: string) {
    if (!user) return;
    if (user.uid !== userId) return;

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

    const { updatedHand, updatedBoard } = deckUtils.putCardsOnBoard(
      localRoomData.gameState.hands[user.uid],
      cardIndexes,
      localRoomData.gameState.board,
      user.uid
    );

    //sort the newly placed set
    const playerSets = updatedBoard[user.uid];
    if (playerSets && playerSets.length > 0) {
      const newSet = playerSets[playerSets.length - 1];

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
  }

  async function endTurn() {}

  //function will run on clicking on joker on board after selecting a card from hand
  async function replaceJokerOnBoard(
    playersBoardId: string,
    setIndex: number,
    jokerCardIndex: number
  ) {
    if (!user) return;

    const playerBoardSets = localRoomData.gameState.board[playersBoardId];
    if (!playerBoardSets) return;
    const setOfCards = playerBoardSets[setIndex];
    if (!setOfCards) return;
    const jokerCard = setOfCards[jokerCardIndex];
    if (jokerCard.type !== "joker") return;

    const selectedCard: Card =
      localRoomData.gameState.hands[user.uid][selectedCards[0].cardIndex];

    //replace joker with selected card
    setOfCards[jokerCardIndex] = selectedCard;

    const isReplacementValid = deckUtils.isPossibleSet(setOfCards);
    if (!isReplacementValid.isValid) {
      alert("Replacement would invalidate the set.");
      setOfCards[jokerCardIndex] = jokerCard;
      return;
    }

    //remove selected card from players hand
    const updatedHand = localRoomData.gameState.hands[user.uid].filter(
      (_, index) => index !== selectedCards[0].cardIndex
    );

    //add joker to player's hand
    updatedHand.push(jokerCard);

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
          [playersBoardId]: playerBoardSets,
        },
      },
    }));

    //remove from selected cards
    setSelectedCards([]);
  }

  async function declareWin() {} //TODO - backend logic

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
          />
        ))}
      </div>

      <h2>Game Component</h2>
      <p>Room ID: {localRoomData.id}</p>
      <p>Number of Players: {localRoomData.currentPlayerIds.length}</p>
      <p>now is {localRoomData.gameState.currentTurnPlayerId} turn</p>

      <DeckOfCards
        numberOfCards={localRoomData.gameState.deck.length}
        pickCard={takeCardFromDeck}
      />

      <h3>Throw Pile:</h3>
      {localRoomData.gameState.throwPile && (
        <ThrowPile
          cards={localRoomData.gameState.throwPile}
          takeCard={takeCardFromThrowPile}
        />
      )}

      {/* render all sets for each player */}
      <div className="board-sets__container">
        {Object.entries(localRoomData.gameState.board).map(
          ([playerId, sets]) => (
            <div key={playerId} className="player-board-sets__container">
              <h4>
                Player ID: {playerId}{" "}
                {user?.uid === playerId ? <strong>(You)</strong> : null}
              </h4>
              <div className="sets-container">
                {sets.map((set, setIndex) => (
                  <div key={setIndex} className="set-of-cards__container">
                    {set.map((card, cardIndex) => (
                      <CardRenderer
                        key={`${card.name}-${cardIndex}-${setIndex}-${playerId}`}
                        cardPath={card.imagePath}
                        isHoverable
                        onClick={() => {
                          //only allow replacing joker if exactly one card is selected from hand
                          if (
                            card.type === "joker" &&
                            selectedCards.length === 1 &&
                            selectedCards[0].playerId === user?.uid
                          ) {
                            replaceJokerOnBoard(playerId, setIndex, cardIndex);
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

      <p>players hands:</p>
      {Object.entries(localRoomData.gameState.hands).map(([playerId, hand]) => (
        <div key={playerId}>
          <h3>Player ID: {playerId}</h3>
          <h4>{user?.uid == playerId ? <strong>(You)</strong> : null}</h4>

          {hand.map((card, index) => (
            <CardRenderer
              cardPath={card.imagePath}
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
      {selectedCards && (
        <div className="card-actions">
          <h3>Selected Cards Actions:</h3>
          {selectedCards.length == 1 && (
            <button onClick={() => throwCardAway(selectedCards[0].cardIndex)}>
              Throw Away Selected Card
            </button>
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
          {selectedCards.length > 2 && (
            <button onClick={() => placeSetOnBoard(selectedCards[0].playerId)}>
              Place set on board
            </button>
          )}
        </div>
      )}
    </div>
  );
}
