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
