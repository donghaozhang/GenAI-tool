
import { useState, useCallback } from 'react';
import { Enemy } from '../types/game';
import { CANVAS_WIDTH, ENEMY_SPEED, POKEMON_TYPES, POKEMON_NAMES, POKEMON_STATS } from '../constants/gameConstants';

export const useEnemies = () => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [enemyDirection, setEnemyDirection] = useState(1);

  const createEnemies = useCallback((level: number) => {
    const newEnemies: Enemy[] = [];
    const rows = Math.min(5, 2 + Math.floor(level / 2));
    const cols = Math.min(10, 6 + Math.floor(level / 3));
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const pokemonType = POKEMON_TYPES[row % 3];
        const stats = POKEMON_STATS[pokemonType];
        
        newEnemies.push({
          id: row * cols + col,
          x: 100 + col * 60,
          y: 50 + row * 50,
          width: 32,
          height: 32,
          speed: ENEMY_SPEED + level * 0.2,
          type: pokemonType,
          health: stats.health,
          points: stats.points,
          pokemonName: POKEMON_NAMES[pokemonType]
        });
      }
    }
    return newEnemies;
  }, []);

  const updateEnemyPositions = useCallback(() => {
    setEnemies(prev => {
      if (prev.length === 0) return prev;
      
      const rightmost = Math.max(...prev.map(e => e.x + e.width));
      const leftmost = Math.min(...prev.map(e => e.x));
      
      let newDirection = enemyDirection;
      let shouldMoveDown = false;
      
      if (rightmost >= CANVAS_WIDTH && enemyDirection === 1) {
        newDirection = -1;
        shouldMoveDown = true;
      } else if (leftmost <= 0 && enemyDirection === -1) {
        newDirection = 1;
        shouldMoveDown = true;
      }
      
      if (newDirection !== enemyDirection) {
        setEnemyDirection(newDirection);
      }
      
      return prev.map(enemy => ({
        ...enemy,
        x: enemy.x + (shouldMoveDown ? 0 : enemy.speed * enemyDirection),
        y: enemy.y + (shouldMoveDown ? 30 : 0)
      }));
    });
  }, [enemyDirection]);

  const damageEnemy = useCallback((enemyId: number) => {
    setEnemies(prev => {
      const newEnemies = [...prev];
      const enemyIndex = newEnemies.findIndex(e => e.id === enemyId);
      
      if (enemyIndex === -1) return prev;
      
      const enemy = newEnemies[enemyIndex];
      if (enemy.health > 1) {
        newEnemies[enemyIndex] = { ...enemy, health: enemy.health - 1 };
        return newEnemies;
      } else {
        newEnemies.splice(enemyIndex, 1);
        return newEnemies;
      }
    });
  }, []);

  const resetEnemies = useCallback(() => {
    setEnemies([]);
    setEnemyDirection(1);
  }, []);

  return {
    enemies,
    enemyDirection,
    createEnemies,
    updateEnemyPositions,
    damageEnemy,
    resetEnemies,
    setEnemies
  };
};
