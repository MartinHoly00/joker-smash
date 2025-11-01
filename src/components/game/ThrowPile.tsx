import { useMemo } from "react";
import type { Card } from "../../data/Card";
import { CardRenderer } from "./CardRenderer";
import "./ThrowPile.css";

export type ThrowPileProps = {
  cards: Card[];
  takeCard: () => void;
};

export function ThrowPile({ cards, takeCard }: ThrowPileProps) {
  const { top, left } = useMemo(() => {
    return Math.random() * 10 > 5 ? { top: 5, left: -5 } : { top: -5, left: 5 };
  }, []);
  return (
    <div className="throw-pile__container">
      {cards.length > 0 ? (
        <>
          {cards.map((card, index) => (
            <CardRenderer
              cardPath={card.imagePath}
              alt="alt"
              key={index}
              style={{
                left: index / 4 + left,
                top: -index / 4 - top,
                position: "absolute",
                rotate: `${index * 40}deg`,
              }}
              isHoverable={card === cards[cards.length - 1]}
              onClick={card === cards[cards.length - 1] ? takeCard : undefined}
            />
          ))}
        </>
      ) : (
        <span>The throw pile is empty.</span>
      )}
    </div>
  );
}
