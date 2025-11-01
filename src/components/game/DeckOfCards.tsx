import { cardImages } from "../../assets/Cards";
import { CardRenderer } from "./CardRenderer";
import "./DeckOfCards.css";

type DeckOfCardsProps = {
  numberOfCards: number;
  width?: number;
  height?: number;
  pickCard: () => void;
};

export function DeckOfCards({ numberOfCards, pickCard }: DeckOfCardsProps) {
  return (
    <div className="deck-of-cards__container">
      {Array.from({ length: numberOfCards }).map((_, index) => (
        <>
          <CardRenderer
            cardPath={cardImages.back}
            style={{ left: index / 2, top: -index / 2, position: "absolute" }}
            //hover effect only on the top card
            isHoverable={index === numberOfCards - 1}
            key={index}
            onClick={index === numberOfCards - 1 ? pickCard : undefined}
          />
        </>
      ))}
    </div>
  );
}
