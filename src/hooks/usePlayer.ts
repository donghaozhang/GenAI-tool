
import { useState, useCallback } from 'react';
import { Player } from '../types/game';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SPEED } from '../constants/gameConstants';

export const usePlayer = () => {
  const [player, setPlayer] = useState<Player>({
    x: CANVAS_WIDTH / 2 - 16,
    y: CANVAS_HEIGHT - 60,
    width: 32,
    height: 32,
    speed: PLAYER_SPEED
  });

  const movePlayer = useCallback((direction: 'left' | 'right') => {
    setPlayer(prev => ({
      ...prev,
      x: Math.max(0, Math.min(CANVAS_WIDTH - prev.width, 
        prev.x + (direction === 'left' ? -prev.speed : prev.speed)))
    }));
  }, []);

  const resetPlayer = useCallback(() => {
    setPlayer({
      x: CANVAS_WIDTH / 2 - 16,
      y: CANVAS_HEIGHT - 60,
      width: 32,
      height: 32,
      speed: PLAYER_SPEED
    });
  }, []);

  return {
    player,
    movePlayer,
    resetPlayer
  };
};
