import { useEffect, useState } from "react";
import type { User } from "../../types/auth";
import type { RoomData } from "../../types/room";
import { database } from "../../auth/config";
import { doc, getDoc } from "firebase/firestore";
import "./Game.css";
import { UserPreview } from "./UserPreview";
import { DeckOfCards } from "./DeckOfCards";
import { CardRenderer } from "./CardRenderer";
import { Card } from "../../data/Card";
import { useAuth } from "../../providers/UserProvider";

type GameProps = {
  roomData: RoomData;
};

export default function Game({ roomData }: GameProps) {
  const { user } = useAuth();
  const [users, setUsers] = useState<Record<string, User>>({});

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

  async function takeCardFromDeck() {}

  async function throwCardAway() {}

  async function swapCardsInHand() {}

  async function takeCardFromThrowPile() {}

  async function placeSetOnBoard() {} //TODO - backend logic

  async function endTurn() {}

  async function replaceJokerOnBoard() {} //TODO - backend logic

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
            usersTurn={roomData.gameState.currentTurnPlayerId === userId}
          />
        ))}
      </div>
      <h2>Game Component</h2>
      <p>Room ID: {roomData.id}</p>
      <p>Number of Players: {roomData.currentPlayerIds.length}</p>
      <p>now is {roomData.gameState.currentTurnPlayerId} turn</p>
      <DeckOfCards numberOfCards={roomData.gameState.deck.length} />
      <div style={{ display: "flex", flexWrap: "wrap", flexDirection: "row" }}>
        {roomData.gameState.deck.map((card, index) => (
          <CardRenderer cardPath={card.imagePath} isHoverable key={index} />
        ))}
      </div>
      <p>players hands:</p>
      {Object.entries(roomData.gameState.hands).map(([playerId, hand]) => (
        <div key={playerId}>
          <h3>Player ID: {playerId}</h3>
          {hand.map((card) => (
            <CardRenderer cardPath={card.imagePath} isHoverable />
          ))}
        </div>
      ))}
    </div>
  );
}
