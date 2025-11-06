import { useState } from "react";
import { useAuth } from "../providers/UserProvider";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import { MenuBackground } from "../components/MenuBackground";
import { Title } from "../components/game/Title";

export function HomePage() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [isOnlineOpen, setIsOnlineOpen] = useState(false);
  const [onlineGameId, setOnlineGameId] = useState("");

  const navigate = useNavigate();
  return (
    <MenuBackground>
      <div className="home-container">
        <div className="user-info">
          {user ? (
            <>
              <img src={user.photoURL || ""} alt="Profile" />
              <p>Welcome, {user.displayName}!</p>
              <button onClick={signOut}>Sign Out</button>
            </>
          ) : (
            <button onClick={signInWithGoogle}>Sign in with Google</button>
          )}
        </div>

        <Title text="JOKER SMASH" />
        <div className="buttons-container">
          <button
            onClick={() => navigate("/create-online")}
            className="pixel-button"
          >
            Create Online Game
          </button>
          <button
            className="pixel-button"
            onClick={() => setIsOnlineOpen(!isOnlineOpen)}
          >
            {isOnlineOpen ? "Close" : "Join Online Game with code"}
          </button>

          {isOnlineOpen && (
            <div className="join-online-form">
              <input
                type="text"
                placeholder="Enter game ID"
                value={onlineGameId}
                onChange={(e) => setOnlineGameId(e.target.value)}
              />
              <button
                onClick={() => navigate(`/online/${onlineGameId}`)}
                className="pixel-button"
              >
                Join Game
              </button>
            </div>
          )}

          <button onClick={() => navigate("/rooms")} className="pixel-button">
            Find game
          </button>
          <button onClick={() => navigate("/info")} className="pixel-button">
            Info
          </button>
        </div>
      </div>
    </MenuBackground>
  );
}
