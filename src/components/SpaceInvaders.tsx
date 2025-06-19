import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from './GameCanvas';
import GameUI from './GameUI';
import PokemonImageGenerator from './PokemonImageGenerator';
import PokemonImageDownloader from './PokemonImageDownloader';
import { useGameLogic } from '../hooks/useGameLogic';

const SpaceInvaders = () => {
  const {
    gameState,
    player,
    bullets,
    enemies,
    pokemonImages,
    score,
    level,
    lives,
    gameStatus,
    startGame,
    resetGame,
    movePlayer,
    shoot,
    setPokemonImagesForGame,
    toggleSound,
    soundEnabled
  } = useGameLogic();

  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [showImageTools, setShowImageTools] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    setKeys(prev => new Set(prev).add(event.code));
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    setKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete(event.code);
      return newKeys;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const gameLoop = setInterval(() => {
      if (keys.has('ArrowLeft')) {
        movePlayer('left');
      }
      if (keys.has('ArrowRight')) {
        movePlayer('right');
      }
      if (keys.has('Space')) {
        shoot();
      }
    }, 16);

    return () => clearInterval(gameLoop);
  }, [keys, gameStatus, movePlayer, shoot]);

  const handleImagesGenerated = (images: Record<string, string>) => {
    console.log('Generated Pokemon images:', images);
    setPokemonImagesForGame(images);
  };

  const handleImagesDownloaded = (images: Record<string, string>) => {
    console.log('Downloaded Pokemon images:', images);
    setPokemonImagesForGame(images);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      {showImageTools && (
        <div className="space-y-4 mb-4">
          <PokemonImageGenerator onImagesGenerated={handleImagesGenerated} />
          <PokemonImageDownloader onImagesDownloaded={handleImagesDownloaded} />
        </div>
      )}
      
      <div className="relative">
        <GameCanvas
          player={player}
          bullets={bullets}
          enemies={enemies}
          gameStatus={gameStatus}
          pokemonImages={pokemonImages}
        />
        <GameUI
          score={score}
          level={level}
          lives={lives}
          gameStatus={gameStatus}
          onStart={startGame}
          onReset={resetGame}
        />
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>Use ← → arrows to move, SPACE to shoot</p>
        <div className="flex gap-2 mt-2 flex-wrap justify-center">
          <button
            onClick={() => setShowImageTools(!showImageTools)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs"
          >
            {showImageTools ? 'Hide' : 'Show'} Image Tools
          </button>
          <button
            onClick={toggleSound}
            className={`px-4 py-2 text-white rounded text-xs ${
              soundEnabled 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            Sound: {soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
        {Object.keys(pokemonImages).length > 0 && (
          <p className="mt-2 text-green-400">✅ Pokemon sprites loaded ({Object.keys(pokemonImages).length} images)!</p>
        )}
      </div>
    </div>
  );
};

export default SpaceInvaders;
