import { useState } from "react";
import "./CreateOnlineGame.css"; // Import the new CSS file
import { useAuth } from "../providers/UserProvider";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { database } from "../auth/config";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import type { RoomData, RoomInput } from "../types/room";
import { toast } from "sonner";
import { MenuBackground } from "../components/MenuBackground";
import { Title } from "../components/game/Title";

export function CreateOnlineGame() {
  const navigate = useNavigate();

  const { user, signInWithGoogle } = useAuth();
  const [inputs, setInputs] = useState<RoomInput>({
    name: "",
    playerLimit: 2,
    password: "",
    timerForTurns: 60,
    numberOfDecks: 2,
    cardsInHand: 13,
  });

  async function createGame(e?: React.FormEvent) {
    e?.preventDefault();
    if (!user) return toast.error("You must be signed in to create a game.");
    const newRoom: RoomData = {
      id: Math.random().toString(36).substring(2, 10), //p1vga674
      name: inputs.name ?? "Unnamed secret room",
      playerLimit: inputs.playerLimit ?? 2,
      password: inputs.password ?? undefined,
      currentPlayerIds: [user.uid],
      hostPlayerId: user.uid,
      timerForTurns: inputs.timerForTurns ?? 60,
      numberOfDecks: inputs.numberOfDecks ?? 2,
      cardsInHand: inputs.cardsInHand ?? 13,
      gameState: {
        deck: [],
        hands: {},
        currentTurnPlayerId: "",
        turnNumber: 0,
        isRunning: false,
        isFinished: false,
        throwPile: [],
        board: {},
        winnerName: "",
      },
    };

    console.log("Creating room: ", newRoom);

    try {
      const roomsColRef = collection(database, "rooms");
      const q = query(
        roomsColRef,
        where("currentPlayerIds", "array-contains", user.uid)
      );
      const roomsSnapshot = await getDocs(q);
      for (const docSnap of roomsSnapshot.docs) {
        const id = docSnap.id;
        // If you prefer to be extra safe, skip deleting the newRoom id:
        if (id === newRoom.id) continue;
        await deleteDoc(doc(database, "rooms", id));
        console.log("Deleted room:", id);
      }
    } catch (err) {
      console.error("Error cleaning up old rooms:", err);
    }

    try {
      const roomDoc = doc(database, "rooms", newRoom.id);
      const docSnapshot = await getDoc(roomDoc);
      if (docSnapshot.exists()) {
        return toast.error(
          "A room with this ID already exists. Please try again."
        );
      } else {
        await setDoc(roomDoc, newRoom);
      }

      await navigate(`/online/${newRoom.id}`);
    } catch (error) {
      console.error("Error creating game room: ", error);
      toast.error("Error creating game room. Please try again.");
    }
  }

  return (
    <MenuBackground>
      <div className="create-game-container">
        {user ? (
          <>
            <Title text="CREATE GAME" />
            <form onSubmit={createGame} className="create-game-form">
              <label className="form-group">
                <span>Game Name:</span>
                <input
                  type="text"
                  name="gameName"
                  required
                  className="form-input"
                  value={inputs.name}
                  onChange={(e) =>
                    setInputs({ ...inputs, name: e.target.value })
                  }
                />
              </label>
              <label className="form-group">
                <span>Player Limit:</span>
                <input
                  type="number"
                  name="playerLimit"
                  min={2}
                  max={8}
                  required
                  className="form-input"
                  value={inputs.playerLimit}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      playerLimit: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label className="form-group">
                <span>Timer for Turns (seconds):</span>
                <input
                  type="number"
                  name="timerForTurns"
                  min={10}
                  max={300}
                  required
                  className="form-input"
                  value={inputs.timerForTurns}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      timerForTurns: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label className="form-group">
                <span>Password (optional):</span>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  value={inputs.password}
                  onChange={(e) =>
                    setInputs({ ...inputs, password: e.target.value })
                  }
                />
              </label>
              <label className="form-group">
                <span>Number of Decks:</span>
                <input
                  type="number"
                  name="numberOfDecks"
                  min={1}
                  max={5}
                  required
                  className="form-input"
                  value={inputs.numberOfDecks}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      numberOfDecks: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label className="form-group">
                <span>Cards in Hand:</span>
                <input
                  type="number"
                  name="cardsInHand"
                  min={1}
                  max={20}
                  required
                  className="form-input"
                  value={inputs.cardsInHand}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      cardsInHand: Number(e.target.value),
                    })
                  }
                />
              </label>
              <button type="submit" className="pixel-button form-submit-button">
                Create game
              </button>
            </form>
            <Link
              to="/"
              className="pixel-button secondary-button margin-bottom"
            >
              Back to Menu
            </Link>
          </>
        ) : (
          <div className="signed-out-container">
            <Title text="CREATE GAME" />
            <p>Please sign in to create an online game.</p>
            <button onClick={signInWithGoogle} className="pixel-button">
              Sign in with Google
            </button>
            <Link to="/" className="pixel-button secondary-button">
              Back to Menu
            </Link>
          </div>
        )}
      </div>
    </MenuBackground>
  );
}
