export interface Asset {
  id: string;
  type: string;
  name: string;
  value: number;
  isOwned: boolean;
}

export interface StoryEntry {
  roundNumber: number;
  title: string;
  text: string;
  videoUrl?: string | null;
  createdAt?: string;
}

export interface Card {
  rank: string;
  suit: string;
}

export interface HandOutcome {
  result: string;
  message: string;
  bet: number;
  cashDelta: number;
  playerValue: number;
  dealerValue: number;
}

export interface BlackjackHand {
  status: 'in_progress' | 'completed';
  bet: number;
  playerCards: Card[];
  dealerCards: Card[];
  playerValue: number;
  dealerValue: number | null;
  outcome?: HandOutcome | null;
}

export interface PlayerCharacter {
  id: string;
  name: string;
  faceImageUrl: string;
  cash: number;
  assets: Asset[];
  roundsPlayed: number;
  stories: StoryEntry[];
  currentHand: BlackjackHand | null;
  netWorth: number;
  initialNetWorth: number;
  isBroke: boolean;
}
