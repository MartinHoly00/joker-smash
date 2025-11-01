import { arrayShuffle } from "array-shuffle";
import { Card } from "../data/Card";

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

  throwCardAway(hand: Card[], deckToThrowInto: Card[], cardIndex: number) {
    const cardToThrow = hand[cardIndex];

    deckToThrowInto.push(cardToThrow);
    hand.splice(cardIndex, 1);

    return { updatedDeck: deckToThrowInto, updatedHand: hand };
  },

  swapCardsInHand(
    playerHand: Card[],
    otherPlayerHand: Card[],
    playerCardIndex: number,
    otherPlayerCardIndex: number
  ) {
    const playerCard = playerHand[playerCardIndex];
    const otherPlayerCard = otherPlayerHand[otherPlayerCardIndex];

    playerHand[playerCardIndex] = otherPlayerCard;
    otherPlayerHand[otherPlayerCardIndex] = playerCard;

    return {
      updatedPlayerHand: playerHand,
      updatedOtherPlayerHand: otherPlayerHand,
    };
  },
};
