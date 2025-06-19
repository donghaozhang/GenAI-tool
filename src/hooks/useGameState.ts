
import { useState, useCallback } from 'react';
import { GameState } from '../types/game';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    lives: 3,
    status: 'waiting'
  });

  const updateScore = useCallback((points: number) => {
    setGameState(prev => ({ ...prev, score: prev.score + points }));
  }, []);

  const decrementLives = useCallback(() => {
    setGameState(prev => ({ ...prev, lives: prev.lives - 1 }));
  }, []);

  const nextLevel = useCallback(() => {
    setGameState(prev => ({ 
      ...prev, 
      level: prev.level + 1,
      status: 'victory'
    }));
  }, []);

  const setGameStatus = useCallback((status: GameState['status']) => {
    setGameState(prev => ({ ...prev, status }));
  }, []);

  const resetGameState = useCallback(() => {
    setGameState({
      score: 0,
      level: 1,
      lives: 3,
      status: 'waiting'
    });
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
  }, []);

  return {
    gameState,
    updateScore,
    decrementLives,
    nextLevel,
    setGameStatus,
    resetGameState,
    startGame
  };
};
