import React, { createContext, useContext, useMemo, useState } from "react";
import { Deck } from "../data/Deck";
import { Card } from "../data/Card";

export type DeckContextType = {
  cards: Card[];
  drawCard: () => Card | undefined;
  shuffle: () => void;
  reset: (numberOfDecks?: number) => void;
  remaining: number;
};

const DeckContext = createContext<DeckContextType | undefined>(undefined);

type DeckProviderProps = {
  children: React.ReactNode;
  numberOfDecks?: number;
};

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const DeckProvider: React.FC<DeckProviderProps> = ({
  children,
  numberOfDecks = 1,
}) => {
  const initialDeck = useMemo(
    () => new Deck(numberOfDecks).cards.slice(),
    [numberOfDecks]
  );
  const [cards, setCards] = useState<Card[]>(() =>
    fisherYatesShuffle(initialDeck)
  );

  const shuffle = () => setCards((c) => fisherYatesShuffle(c));

  const draw = (): Card | undefined => {
    let drawn: Card | undefined;
    setCards((prev) => {
      const next = prev.slice();
      drawn = next.shift();
      return next;
    });
    return drawn;
  };

  const reset = (n: number = numberOfDecks) =>
    setCards(fisherYatesShuffle(new Deck(n).cards.slice()));

  const value: DeckContextType = {
    cards,
    drawCard: draw,
    shuffle,
    reset,
    remaining: cards.length,
  };

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
};

export const useDeck = (): DeckContextType => {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error("useDeck must be used within a DeckProvider");
  return ctx;
};
