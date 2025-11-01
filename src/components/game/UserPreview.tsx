import { useAuth } from "../../providers/UserProvider";
import type { User } from "../../types/auth";
import "./UserPreview.css";

type UserPreviewProps = {
  userToDisplay: User;
  usersTurn: boolean;
  timer?: number | null;
};

export function UserPreview({
  userToDisplay,
  usersTurn,
  timer,
}: UserPreviewProps) {
  const { user } = useAuth();
  return (
    <div
      className={
        "user-preview__container " +
        (usersTurn ? "user-preview__container--active" : "")
      }
    >
      <img
        src={userToDisplay.photoURL ?? "error"}
        alt={userToDisplay.displayName ?? userToDisplay.uid}
      />
      <span className="user-preview">{userToDisplay.displayName}</span>
      {user && user.uid === userToDisplay.uid && usersTurn && (
        <>
          <span className="user-preview__desc">Your time to shine.</span>
          {timer !== null && timer !== undefined && (
            <span className="user-preview__timer">Time left: {timer}s</span>
          )}
        </>
      )}
    </div>
  );
}
