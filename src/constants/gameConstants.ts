
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const PLAYER_SPEED = 5;
export const BULLET_SPEED = 7;
export const ENEMY_SPEED = 1;

export const POKEMON_TYPES = ['pikachu', 'squirtle', 'charmander'] as const;
export const POKEMON_NAMES = {
  pikachu: 'Pikachu',
  squirtle: 'Squirtle', 
  charmander: 'Charmander'
} as const;

export const POKEMON_STATS = {
  pikachu: { health: 1, points: 20 },
  squirtle: { health: 1, points: 10 },
  charmander: { health: 2, points: 30 }
} as const;
