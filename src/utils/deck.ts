import { arrayShuffle } from "array-shuffle";
import { Card, type CardType, type CardValue } from "../data/Card";

export type SetValidationResult =
  | { isValid: true; error: null }
  | { isValid: false; error: string };

export const deckUtils = {
  takeCardWithShuffle(deckToTakeFrom: Card[], hand: Card[]) {
    const shuffledDeck = arrayShuffle(deckToTakeFrom);
    const cardToTake = shuffledDeck[0];

    hand.push(cardToTake);
    shuffledDeck.splice(0, 1);

    return { updatedDeck: shuffledDeck, updatedHand: hand };
  },

  takeCard(deckToTakeFrom: Card[], hand: Card[]) {
    const cardToTake = deckToTakeFrom[0];

    hand.push(cardToTake);
    deckToTakeFrom.splice(0, 1);

    return { updatedDeck: deckToTakeFrom, updatedHand: hand };
  },

  takeRandomCard(deckToTakeFrom: Card[], hand: Card[]) {
    const randomIndex = Math.floor(Math.random() * deckToTakeFrom.length);
    const cardToTake = deckToTakeFrom[randomIndex];

    hand.push(cardToTake);
    deckToTakeFrom.splice(randomIndex, 1);

    return { updatedDeck: deckToTakeFrom, updatedHand: hand };
  },

  throwCardAway(hand: Card[], deckToThrowInto: Card[], cardIndex: number) {
    const cardToThrow = hand[cardIndex];

    deckToThrowInto.push(cardToThrow);
    hand.splice(cardIndex, 1);

    return { updatedDeck: deckToThrowInto, updatedHand: hand };
  },

  swapCardsInHand(
    playerHand: Card[],
    cardToSwapIndex: number,
    otherCardToSwapIndex: number
  ) {
    //swap cards in hand
    const newHand = playerHand.slice();

    const temp = newHand[cardToSwapIndex];
    newHand[cardToSwapIndex] = newHand[otherCardToSwapIndex];
    newHand[otherCardToSwapIndex] = temp;

    return newHand;
  },

  putCardsOnBoard(
    playerHand: Card[],
    handIndexes: number[],
    board: Record<string, Card[][]>,
    playerId: string
  ) {
    const newHand = playerHand.slice();
    //pick cards to place on board, remove from hand
    const cardsToPlace: Card[] = [];
    handIndexes
      .sort((a, b) => b - a)
      .forEach((index) => {
        cardsToPlace.push(newHand[index]);
        newHand.splice(index, 1);
      });

    const newBoard = { ...board };
    //board[playerId][cardSetIndex] = array of cards in set
    newBoard[playerId] = newBoard[playerId] || [];
    newBoard[playerId].push(cardsToPlace);

    return { updatedHand: newHand, updatedBoard: newBoard };
  },

  isPossibleSet(cards: Card[]): SetValidationResult {
    if (cards.length < 3) {
      return { isValid: false, error: "Sada musí mít alespoň 3 karty." };
    }

    const jokers = cards.filter((c) => c.type === "joker");
    const realCards = cards.filter((c) => c.type !== "joker");
    const jokerCount = jokers.length;

    // --- Pomocná funkce pro kontrolu SKUPINY (stejná hodnota) ---
    const isPossibleGroup = (
      cards: Card[],
      jokers: number
    ): SetValidationResult => {
      if (cards.length === 0) {
        // Toto není chyba, jen to není skupina (může to být postupka žolíků)
        return {
          isValid: false,
          error: "Interní: Nelze ověřit skupinu bez reálných karet.",
        };
      }

      const firstValue = cards[0].value;
      if (!cards.every((c) => c.value === firstValue)) {
        return {
          isValid: false,
          error: "Neplatná skupina: Všechny karty musí mít stejnou hodnotu.",
        };
      }

      const suitCounts = cards.reduce((acc, card) => {
        acc[card.type] = (acc[card.type] || 0) + 1;
        return acc;
      }, {} as Record<CardType, number>);

      if (Object.values(suitCounts).some((count) => count > 2)) {
        return {
          isValid: false,
          error:
            "Neplatná skupina: Sada obsahuje více než 2 karty stejné barvy (např. 3x srdcová sedma).",
        };
      }

      // Kontrola celkové délky (měla by být již pokryta vnější funkcí, ale pro jistotu)
      if (cards.length + jokers < 3) {
        return { isValid: false, error: "Sada musí mít alespoň 3 karty." };
      }

      return { isValid: true, error: null };
    };

    // --- Pomocná funkce pro kontrolu POSTUPKY (stejná barva) ---
    const isPossibleSequence = (
      cards: Card[],
      jokers: number
    ): SetValidationResult => {
      // Případ, kdy sada obsahuje POUZE žolíky
      if (cards.length === 0) {
        return jokers >= 3
          ? { isValid: true, error: null }
          : { isValid: false, error: "Sada musí mít alespoň 3 karty." };
      }

      const firstSuit = cards[0].type;
      if (!cards.every((c) => c.type === firstSuit)) {
        return {
          isValid: false,
          error: "Neplatná postupka: Všechny karty musí mít stejnou barvu.",
        };
      }

      const rankMap = new Map<CardValue, number>([
        [2, 2],
        [3, 3],
        [4, 4],
        [5, 5],
        [6, 6],
        [7, 7],
        [8, 8],
        [9, 9],
        [10, 10],
        ["J", 11],
        ["Q", 12],
        ["K", 13],
        ["A", 14], // Eso jako vysoké
      ]);

      // Pomocná funkce pro kontrolu mezer v sekvenci
      const checkGaps = (
        ranks: number[],
        jokerCount: number
      ): SetValidationResult => {
        const uniqueRanks = new Set(ranks);
        if (uniqueRanks.size !== ranks.length) {
          return {
            isValid: false,
            error:
              "Neplatná postupka: Sada obsahuje duplicitní karty (např. 2x srdcová sedma).",
          };
        }

        const sortedRanks = [...uniqueRanks].sort((a, b) => a - b);
        let gaps = 0;
        for (let i = 0; i < sortedRanks.length - 1; i++) {
          const gap = sortedRanks[i + 1] - sortedRanks[i] - 1;
          if (gap < 0) {
            // Toto by se nemělo stát díky kontrole uniqueRanks, ale pro jistotu
            return {
              isValid: false,
              error: "Neplatná postupka: Chyba při řazení karet.",
            };
          }
          gaps += gap;
        }

        if (gaps > jokerCount) {
          return {
            isValid: false,
            error: `Neplatná postupka: Na vyplnění mezer je potřeba ${gaps} žolíků, ale máte jen ${jokerCount}.`,
          };
        }

        return { isValid: true, error: null };
      };

      const highAceRanks = cards
        .map((c) => rankMap.get(c.value)!)
        .filter(Boolean);
      const lowAceRanks = highAceRanks.map((r) => (r === 14 ? 1 : r));

      const highAceResult = checkGaps(highAceRanks, jokers);
      const lowAceResult = checkGaps(lowAceRanks, jokers);

      if (highAceResult.isValid || lowAceResult.isValid) {
        return { isValid: true, error: null };
      }

      // Pokud obě selhaly, vrátíme konkrétnější chybu (obvykle je relevantnější ta z highAce)
      return highAceResult.error ? highAceResult : lowAceResult;
    };

    // --- Hlavní logika isPossibleSet ---

    // 1. Zkusíme ověřit jako skupinu
    const groupResult = isPossibleGroup(realCards, jokerCount);
    if (groupResult.isValid) {
      return { isValid: true, error: null };
    }

    // 2. Zkusíme ověřit jako postupku
    const sequenceResult = isPossibleSequence(realCards, jokerCount);
    if (sequenceResult.isValid) {
      return { isValid: true, error: null };
    }

    // 3. Selhaly obě. Vrátíme nejrelevantnější chybu.
    // Pokud se uživatel zjevně snažil o skupinu (všechny reálné karty stejná hodnota)
    const firstValue = realCards[0]?.value;
    if (realCards.every((c) => c.value === firstValue)) {
      return groupResult; // Vrací chybu z kontroly skupiny (např. "moc stejných barev")
    }

    // Pokud se uživatel zjevně snažil o postupku (všechny reálné karty stejná barva)
    const firstSuit = realCards[0]?.type;
    if (realCards.every((c) => c.type === firstSuit)) {
      return sequenceResult; // Vrací chybu z kontroly postupky (např. "málo žolíků")
    }

    // 4. Je to nesmyslný mix (např. 7h, 7s, 8d)
    return {
      isValid: false,
      error:
        "Neplatná sada: Karty netvoří ani platnou skupinu (stejné hodnoty), ani postupku (stejná barva).",
    };
  },

  getCardRank(card: Card, aceHigh: boolean = true): number {
    if (card.type === "joker") return 0; // Žolík má pro řazení skupin hodnotu 0
    switch (card.value) {
      case "A":
        return aceHigh ? 14 : 1;
      case "K":
        return 13;
      case "Q":
        return 12;
      case "J":
        return 11;
      default:
        return Number(card.value);
    }
  },
};
