import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { database } from "../auth/config";
import type { RoomData, RoomGameState } from "../types/room";
import { MagnifyingGlass } from "react-loader-spinner";
import { useAuth } from "../providers/UserProvider";
import { Deck } from "../data/Deck";
import { deckUtils } from "../utils/deck";
import type { Card } from "../data/Card";
import Game from "../components/game/Game";

export function OnlineGame() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const { user } = useAuth();

  //password
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [tryCount, setTryCount] = useState(0);
  const maxTries = 3;

  //check room full or user not logged in - fetch room data
  useEffect(() => {
    if (id) {
      fetchRoomData(id);
    }
    realtimeUpdate();
  }, [id]);

  /*   useEffect(() => {
    if (roomData?.playerLimit === roomData?.currentPlayerIds.length) {
      navigate("/");
    }
    if (!user) {
      navigate("/");
    }
  }, [roomData]); */

  useEffect(() => {
    if (!roomData || !user) return;
    if (roomData && user && !showPasswordPrompt) {
      if (
        !roomData.currentPlayerIds.includes(user.uid) &&
        roomData.currentPlayerIds.length < roomData.playerLimit
      ) {
        joinRoom();
      }
    }
    if (
      roomData.password &&
      roomData.hostPlayerId !== user?.uid &&
      !roomData.currentPlayerIds.includes(user.uid)
    ) {
      setShowPasswordPrompt(true);
    } else {
      setShowPasswordPrompt(false);
    }
  }, [roomData, user]);

  async function realtimeUpdate() {
    if (!id) return;
    const roomRef = doc(database, "rooms", id);
    const unsub = onSnapshot(
      roomRef,
      (snap) => {
        if (!snap.exists()) {
          navigate("/");
          return;
        }
        setRoomData(snap.data() as RoomData);
      },
      (err) => {
        console.error("snapshot error:", err);
      }
    );
    return () => unsub();
  }

  async function fetchRoomData(roomId: string) {
    const roomDoc = doc(database, "rooms", roomId);
    const roomSnapshot = await getDoc(roomDoc);

    if (roomSnapshot.exists()) {
      const data = roomSnapshot.data() as RoomData;
      setRoomData(data);
    } else {
      navigate("/");
    }
  }

  async function joinRoom() {
    if (!roomData || !user) return;
    const roomRef = doc(database, "rooms", roomData.id);
    try {
      await updateDoc(roomRef, {
        currentPlayerIds: arrayUnion(user.uid),
      });
      await fetchRoomData(roomData.id);
    } catch (err) {
      console.error("Failed to join room:", err);
    }
  }

  async function leaveRoom() {
    if (!roomData || !user) return;
    const roomRef = doc(database, "rooms", roomData.id);

    try {
      await runTransaction(database, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) return;
        const data = snap.data() as any;
        const ids: string[] = data.currentPlayerIds || [];
        const newIds = ids.filter((id) => id !== user.uid);
        tx.update(roomRef, { currentPlayerIds: newIds });
        if (newIds.length === 0) {
          tx.update(roomRef, { emptyAt: serverTimestamp() });
        }
      });
      await navigate("/");
    } catch (err) {
      console.error("Failed to leave room (transaction):", err);
    }
  }

  async function startGame() {
    if (!roomData || !user) return;
    if (roomData.hostPlayerId !== user.uid) return;
    if (roomData.currentPlayerIds.length < 2) {
      return alert("At least 2 players are required to start the game.");
    }
    const roomRef = doc(database, "rooms", roomData.id);

    let newDeck = new Deck(roomData.numberOfDecks ?? 2).cards;
    const playerHands: Record<string, Card[]> = {};

    for (const playerId of roomData.currentPlayerIds) {
      playerHands[playerId] = playerHands[playerId] || [];
      for (let i = 0; i < roomData.cardsInHand; i++) {
        const { updatedDeck, updatedHand } = deckUtils.takeCardWithShuffle(
          newDeck,
          playerHands[playerId] || []
        );
        playerHands[playerId] = updatedHand;
        newDeck = updatedDeck;
      }
    }

    //throw pile - init card for throw pile
    let newThrowPile: Card[] = [];
    const { updatedDeck, updatedHand } = deckUtils.takeRandomCard(
      newDeck,
      newThrowPile
    );
    newDeck = updatedDeck;
    newThrowPile = updatedHand;

    const serialDeck = newDeck.map((c) => ({
      name: c.name,
      type: c.type,
      value: c.value,
      color: c.color,
      imagePath: c.imagePath,
      backImagePath: c.backImagePath,
    }));
    const serialHands: Record<string, any[]> = {};
    for (const pid of Object.keys(playerHands)) {
      serialHands[pid] = (playerHands[pid] || []).map((c) => ({
        value: c.value,
        type: c.type,
        imagePath: c.imagePath,
        name: c.name,
        color: c.color,
        backImagePath: c.backImagePath,
      }));
    }

    const serialPile: any[] = newThrowPile.map((c) => ({
      value: c.value,
      type: c.type,
      imagePath: c.imagePath,
      name: c.name,
      color: c.color,
      backImagePath: c.backImagePath,
    }));

    const gameState: RoomGameState = {
      currentTurnPlayerId: roomData.currentPlayerIds[0],
      deck: serialDeck,
      hands: serialHands,
      isFinished: false,
      isRunning: true,
      turnNumber: 1,
      throwPile: serialPile,
      board: {},
    };

    try {
      await updateDoc(roomRef, { gameState });
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  }

  async function closeRoom() {
    if (!roomData || !user) return;
    if (roomData.hostPlayerId !== user.uid) return;

    const roomRef = doc(database, "rooms", roomData.id);

    try {
      await runTransaction(database, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) return;
        tx.delete(roomRef);
      });
      await navigate("/");
    } catch (err) {
      console.error("Failed to close room (transaction):", err);
    }
  }

  function checkPasswordInput() {
    if (passwordInput === roomData?.password) {
      setShowPasswordPrompt(false);
    } else {
      setTryCount(tryCount + 1);
      if (tryCount + 1 >= maxTries) {
        leaveRoom();
      }
    }
  }

  return (
    <>
      {showPasswordPrompt ? (
        <div>
          <label>
            Enter password to enter:
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
          </label>
          <button onClick={checkPasswordInput}>Submit</button>
          <p>
            tries {tryCount}/{maxTries}
          </p>
        </div>
      ) : (
        <>
          {roomData && roomData.gameState.isRunning ? (
            <Game roomData={roomData} />
          ) : (
            <>
              <h1>Online Game Room: {roomData?.name}</h1>
              <h2>id: {roomData?.id}</h2>
              <MagnifyingGlass
                visible={true}
                height="80"
                width="80"
                ariaLabel="magnifying-glass-loading"
                wrapperStyle={{}}
                wrapperClass="magnifying-glass-wrapper"
                glassColor="#c0efff"
                color="#e15b64"
              />
              <p>
                {roomData?.playerLimit == roomData?.currentPlayerIds.length
                  ? "Waiting for host to start the game"
                  : "Waiting for players to join"}{" "}
                {roomData?.currentPlayerIds.length}/{roomData?.playerLimit}
              </p>
              <button onClick={leaveRoom}>Leave Room</button>
              {roomData?.hostPlayerId === user?.uid && (
                <>
                  <button onClick={startGame}>Start Game</button>
                  <button onClick={closeRoom}>Close Room</button>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
