export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'hell';

export interface SudokuCell {
  row: number;
  col: number;
  value: number; // 0 if empty
  isInitial: boolean; // Pre-filled clue
  notes: number[]; // Pencil draft marks
  isError: boolean; // Marked as containing an error
}

export type SudokuBoard = SudokuCell[][];

export interface RecentGame {
  id: string;
  difficulty: string;
  isCompleted: boolean;
  timeSpent: string;
  date: string;
  hintsUsed: number;
  errorsCount: number;
  xpGained: number;
}

export interface PlayerProfile {
  name: string;
  level: number;
  xp: number;
  maxXp: number;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  totalHintsUsed: number;
  bestTimeExpert: string;
  goldCoins: number;
  avatarUrl: string;
}

export interface LeaderboardRecord {
  rank: number;
  name: string;
  time: string;
  date: string;
  avatarUrl: string;
}
