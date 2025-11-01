import type { Card } from "../../data/Card";
import { useAuth } from "../../providers/UserProvider";
import { CardRenderer } from "./CardRenderer";

type HandProps = {
  playersHand: Record<string, Card[]>;
  throwCardAway: (playerId: string, handCardIndex: number) => void;
};

export function Hand({ playersHand, throwCardAway }: HandProps) {
  const { user } = useAuth();
  return (
    <>
      {Object.entries(playersHand).map(([playerId, hand]) => (
        <div key={playerId}>
          <h3>Player ID: {playerId}</h3>
          <h4>{user?.uid === playerId ? <strong>(You)</strong> : null}</h4>
          {hand.map((card, index) => (
            <CardRenderer
              key={card.name ?? `${playerId}-${index}`}
              cardPath={card.imagePath}
              isHoverable
              // pass playerId so you know which player's card was clicked
              onClick={() => throwCardAway(user ? user.uid : playerId, index)}
            />
          ))}
        </div>
      ))}
    </>
  );
}
