import { useState } from "react";
import type { RoomData } from "../../types/room";
import "./InfoModal.css";
import { ImInfo } from "react-icons/im";

type InfoModalProps = {
  roomData: RoomData;
  handleCloseGame: () => void;
};

export function InfoModal({ roomData, handleCloseGame }: InfoModalProps) {
  const [showGameInfo, setShowGameInfo] = useState<boolean>(false);
  return (
    <>
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
            <span>Room id:</span>&nbsp;<span>{roomData.id}</span>
          </p>
          <p>
            <span>Name</span>&nbsp;<span>{roomData.name}</span>
          </p>
          <p>
            <span>Number of decks:</span>&nbsp;
            <span>{roomData.numberOfDecks}</span>
          </p>
          <p>
            <span>Current turn:</span>&nbsp;
            <span>
              {Math.floor(
                roomData.gameState.turnNumber / roomData.currentPlayerIds.length
              )}
            </span>
          </p>
          {roomData.password && (
            <p>
              <span>Password:</span>&nbsp;<span>{roomData.password}</span>
            </p>
          )}
          <p>
            <span>Time for turn:</span>&nbsp;
            <span>{roomData.timerForTurns}</span>
          </p>
          <button onClick={handleCloseGame}>Leave game</button>
        </div>
      )}
    </>
  );
}
