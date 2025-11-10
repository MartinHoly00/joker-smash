import React from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "@uidotdev/usehooks";

// Import the CSS file
import "./WinModal.css";
import { useAuth } from "../../providers/UserProvider";

type WinModalProps = {
  isOpen: boolean;
  winnerName: string;
  onClose: () => void; // Function to close the modal (e.g., play again)
};

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  winnerName,
  onClose,
}) => {
  // Get window size for fullscreen confetti
  const { width, height } = useWindowSize();

  if (!isOpen) {
    return null;
  }
  const { user } = useAuth();

  return (
    <div className={`modal-backdrop ${isOpen ? "open" : ""}`} onClick={onClose}>
      <Confetti
        width={width ?? 0}
        height={height ?? 0}
        numberOfPieces={500}
        recycle={false}
        gravity={0.15}
      />

      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>

        <h1>
          {winnerName === user?.displayName
            ? "Congratulations!"
            : "Womp womp.."}
        </h1>

        <span className="modal-winner-name">
          <b>{winnerName}</b>&nbsp;
          <span className="modal-winner-text">Wins!</span>
        </span>

        <p>
          {winnerName === user?.displayName
            ? "You are the GOAT"
            : "Mby skill issue?"}
        </p>

        <button className="modal-cta-button" onClick={onClose}>
          Play Again
        </button>
      </div>
    </div>
  );
};
