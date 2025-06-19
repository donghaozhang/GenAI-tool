
export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'player' | 'enemy';
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'pikachu' | 'squirtle' | 'charmander';
  health: number;
  points: number;
  pokemonName: string;
}

export type GameStatus = 'waiting' | 'playing' | 'paused' | 'gameOver' | 'victory';

export interface GameState {
  score: number;
  level: number;
  lives: number;
  status: GameStatus;
}
