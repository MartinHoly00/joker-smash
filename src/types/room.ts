import type { Card } from "../data/Card";

export type RoomData = {
  id: string;
  name: string;
  playerLimit: number;
  password?: string;
  currentPlayerIds: string[];
  hostPlayerId: string;
  timerForTurns: number;
  gameState: RoomGameState;
  emptyAt?: any;
  numberOfDecks: number;
  cardsInHand: number;
};

export type RoomGameState = {
  deck: Card[];
  hands: Record<string, Card[]>;
  currentTurnPlayerId: string;
  turnNumber: number;
  isRunning: boolean;
  isFinished: boolean;
  throwPile: Card[];
  board: Record<string, Record<string, Card[]>>;
  winnerName: string;
};

export type RoomInput = {
  name: string;
  playerLimit: number;
  password?: string;
  timerForTurns: number;
  numberOfDecks: number;
  cardsInHand: number;
};
