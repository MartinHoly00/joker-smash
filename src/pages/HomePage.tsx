import { useState } from "react";
import { useAuth } from "../providers/UserProvider";
import "./HomePage.css";
import { Link } from "react-router-dom";

export function HomePage() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [isOnlineOpen, setIsOnlineOpen] = useState(false);

  const [onlineGameId, setOnlineGameId] = useState("");

  return (
    <>
      <div>
        {user ? (
          <div>
            <p>Welcome, {user.displayName}!</p>
            <img src={user.photoURL || ""} alt="Profile" />
            <button onClick={signOut}>Sign Out</button>
          </div>
        ) : (
          <button onClick={signInWithGoogle}>Sign in with Google</button>
        )}
      </div>

      <h1>Jocker Smash</h1>
      <Link to="/local">Play solo</Link>
      <Link to="/info">Info</Link>

      <div className="buttons__container">
        <Link to="/local">Local Game</Link>
        <div>
          <button onClick={() => setIsOnlineOpen(!isOnlineOpen)}>
            Join Online game
          </button>
          {isOnlineOpen && (
            <div>
              <input
                type="text"
                placeholder="Enter game ID"
                value={onlineGameId}
                onChange={(e) => setOnlineGameId(e.target.value)}
              />
              <Link to={`/online/${onlineGameId}`}>Join Game</Link>
            </div>
          )}
        </div>
        <Link to="/create-online">Create Online Game</Link>
      </div>
    </>
  );
}
