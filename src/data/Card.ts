import { cardImages } from "../assets/Cards";

export type CardType = "clubs" | "diamonds" | "hearts" | "spades" | "joker";
export type CardValue =
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | "J"
  | "Q"
  | "K"
  | "A"
  | "black"
  | "red";
export type CardColor = "black" | "red";

export function getCardNumericValues(value: CardValue): number[] {
  if (typeof value === "number") return [value];

  switch (value) {
    case "J":
    case "Q":
    case "K":
      return [10];
    case "A":
      return [1, 10]; // Ace can be treated as 1 or 10 in your rules
    case "black":
    case "red":
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // joker-like wildcard values
    default:
      return [];
  }
}

export class Card {
  public name: string;
  public type: CardType;
  public value: CardValue;
  public color: CardColor;
  public imagePath: string;
  public backImagePath: string = cardImages.back;

  public constructor(
    name: string,
    type: CardType,
    value: CardValue,
    imagePath: string
  ) {
    this.name = name;
    this.type = type;
    this.value = value;
    if (type === "clubs" || type === "spades") {
      this.color = "black";
    } else if (type === "diamonds" || type === "hearts") {
      this.color = "red";
    } else {
      this.color = value === "black" ? "black" : "red";
    }
    this.imagePath = imagePath;
  }
}
