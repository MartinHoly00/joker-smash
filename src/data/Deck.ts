import { cardImages } from "../assets/Cards";
import { Card } from "./Card";

export class Deck {
  public cards: Card[];

  public constructor(numberOfDecks: number = 1) {
    const allCards: Card[] = [
      new Card("2 of clubs", "clubs", 2, cardImages.clubs[2]),
      new Card("3 of clubs", "clubs", 3, cardImages.clubs[3]),
      new Card("4 of clubs", "clubs", 4, cardImages.clubs[4]),
      new Card("5 of clubs", "clubs", 5, cardImages.clubs[5]),
      new Card("6 of clubs", "clubs", 6, cardImages.clubs[6]),
      new Card("7 of clubs", "clubs", 7, cardImages.clubs[7]),
      new Card("8 of clubs", "clubs", 8, cardImages.clubs[8]),
      new Card("9 of clubs", "clubs", 9, cardImages.clubs[9]),
      new Card("10 of clubs", "clubs", 10, cardImages.clubs[10]),
      new Card("Jake of clubs", "clubs", "J", cardImages.clubs.J),
      new Card("Queen of clubs", "clubs", "Q", cardImages.clubs.Q),
      new Card("King of clubs", "clubs", "K", cardImages.clubs.K),
      new Card("Ace of clubs", "clubs", "A", cardImages.clubs.A),

      new Card("2 of diamonds", "diamonds", 2, cardImages.diamonds[2]),
      new Card("3 of diamonds", "diamonds", 3, cardImages.diamonds[3]),
      new Card("4 of diamonds", "diamonds", 4, cardImages.diamonds[4]),
      new Card("5 of diamonds", "diamonds", 5, cardImages.diamonds[5]),
      new Card("6 of diamonds", "diamonds", 6, cardImages.diamonds[6]),
      new Card("7 of diamonds", "diamonds", 7, cardImages.diamonds[7]),
      new Card("8 of diamonds", "diamonds", 8, cardImages.diamonds[8]),
      new Card("9 of diamonds", "diamonds", 9, cardImages.diamonds[9]),
      new Card("10 of diamonds", "diamonds", 10, cardImages.diamonds[10]),
      new Card("Jake of diamonds", "diamonds", "J", cardImages.diamonds.J),
      new Card("Queen of diamonds", "diamonds", "Q", cardImages.diamonds.Q),
      new Card("King of diamonds", "diamonds", "K", cardImages.diamonds.K),
      new Card("Ace of diamonds", "diamonds", "A", cardImages.diamonds.A),

      new Card("2 of hearts", "hearts", 2, cardImages.hearts[2]),
      new Card("3 of hearts", "hearts", 3, cardImages.hearts[3]),
      new Card("4 of hearts", "hearts", 4, cardImages.hearts[4]),
      new Card("5 of hearts", "hearts", 5, cardImages.hearts[5]),
      new Card("6 of hearts", "hearts", 6, cardImages.hearts[6]),
      new Card("7 of hearts", "hearts", 7, cardImages.hearts[7]),
      new Card("8 of hearts", "hearts", 8, cardImages.hearts[8]),
      new Card("9 of hearts", "hearts", 9, cardImages.hearts[9]),
      new Card("10 of hearts", "hearts", 10, cardImages.hearts[10]),
      new Card("Jake of hearts", "hearts", "J", cardImages.hearts.J),
      new Card("Queen of hearts", "hearts", "Q", cardImages.hearts.Q),
      new Card("King of hearts", "hearts", "K", cardImages.hearts.K),
      new Card("Ace of hearts", "hearts", "A", cardImages.hearts.A),

      new Card("2 od spades", "spades", 2, cardImages.spades[2]),
      new Card("2 od spades", "spades", 3, cardImages.spades[3]),
      new Card("2 od spades", "spades", 4, cardImages.spades[4]),
      new Card("2 od spades", "spades", 5, cardImages.spades[5]),
      new Card("2 od spades", "spades", 6, cardImages.spades[6]),
      new Card("2 od spades", "spades", 7, cardImages.spades[7]),
      new Card("2 od spades", "spades", 8, cardImages.spades[8]),
      new Card("2 od spades", "spades", 9, cardImages.spades[9]),
      new Card("2 od spades", "spades", 10, cardImages.spades[10]),
      new Card("2 od spades", "spades", "J", cardImages.spades.J),
      new Card("2 od spades", "spades", "Q", cardImages.spades.Q),
      new Card("2 od spades", "spades", "K", cardImages.spades.K),
      new Card("2 od spades", "spades", "A", cardImages.spades.A),

      new Card("Black Joker", "joker", "black", cardImages.joker.black),
      new Card("Red joker", "joker", "red", cardImages.joker.red),
    ];
    for (let i = 1; i < numberOfDecks; i++) {
      allCards.push(...allCards);
    }
    this.cards = allCards;
  }
}
