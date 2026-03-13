export interface Choice {
  id: string;
  text: string;
}

export interface GameState {
  affection: number; // 0 to 100
  mood: 'happy' | 'shy' | 'angry' | 'neutral' | 'sad';
  turnCount: number;
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];
  isGameOver: boolean;
  endingType?: 'win' | 'loss' | 'friendzone';
}

export interface SceneData {
  narrative: string;
  characterDialogue: string;
  characterEmotion: 'happy' | 'shy' | 'angry' | 'neutral' | 'sad';
  choices: Choice[];
  affectionChange: number;
  isGameOver: boolean;
  endingType?: 'win' | 'loss' | 'friendzone';
  backgroundKeywords: string; // Used to fetch a relevant background image
}

export const INITIAL_GAME_STATE: GameState = {
  affection: 40, // Starts neutral/slightly positive
  mood: 'neutral',
  turnCount: 0,
  history: [],
  isGameOver: false,
};
