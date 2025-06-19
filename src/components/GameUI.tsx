
import React from 'react';
import { GameStatus } from '../types/game';

interface GameUIProps {
  score: number;
  level: number;
  lives: number;
  gameStatus: GameStatus;
  onStart: () => void;
  onReset: () => void;
}

const GameUI: React.FC<GameUIProps> = ({ 
  score, 
  level, 
  lives, 
  gameStatus, 
  onStart, 
  onReset 
}) => {
  return (
    <div className="flex justify-between items-center mt-4 text-white">
      <div className="flex space-x-8 text-lg">
        <div className="text-yellow-400">
          SCORE: <span className="font-mono font-bold">{score.toLocaleString()}</span>
        </div>
        <div className="text-blue-400">
          LEVEL: <span className="font-mono font-bold">{level}</span>
        </div>
        <div className="text-green-400">
          LIVES: <span className="font-mono font-bold">{lives}</span>
        </div>
      </div>
      
      <div className="flex space-x-4">
        {gameStatus === 'waiting' && (
          <button
            onClick={onStart}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors"
          >
            START GAME
          </button>
        )}
        
        {(gameStatus === 'gameOver' || gameStatus === 'playing') && (
          <button
            onClick={onReset}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors"
          >
            RESET
          </button>
        )}
      </div>
    </div>
  );
};

export default GameUI;
