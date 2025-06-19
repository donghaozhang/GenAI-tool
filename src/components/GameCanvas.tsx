
import React from 'react';
import { Player, Bullet, Enemy, GameStatus } from '../types/game';

interface GameCanvasProps {
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  gameStatus: GameStatus;
  pokemonImages?: Record<string, string>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  player, 
  bullets, 
  enemies, 
  gameStatus, 
  pokemonImages = {} 
}) => {
  const getPokemonEmoji = (type: string) => {
    switch (type) {
      case 'pikachu': return '⚡';
      case 'squirtle': return '💧';
      case 'charmander': return '🔥';
      default: return '👾';
    }
  };

  const getPokemonColor = (type: string) => {
    switch (type) {
      case 'pikachu': return 'bg-yellow-400';
      case 'squirtle': return 'bg-blue-400';
      case 'charmander': return 'bg-red-400';
      default: return 'bg-purple-500';
    }
  };

  return (
    <div className="relative bg-black border-2 border-green-500 overflow-hidden" 
         style={{ width: '800px', height: '600px' }}>
      
      {/* Stars background */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Player */}
      <div
        className="absolute w-8 h-8 bg-green-500 transition-all duration-75"
        style={{
          left: `${player.x}px`,
          top: `${player.y}px`,
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
        }}
      />

      {/* Player bullets */}
      {bullets
        .filter(bullet => bullet.type === 'player')
        .map(bullet => (
          <div
            key={bullet.id}
            className="absolute w-1 h-4 bg-yellow-400 rounded-full"
            style={{
              left: `${bullet.x}px`,
              top: `${bullet.y}px`
            }}
          />
        ))}

      {/* Enemy bullets */}
      {bullets
        .filter(bullet => bullet.type === 'enemy')
        .map(bullet => (
          <div
            key={bullet.id}
            className="absolute w-1 h-4 bg-red-400 rounded-full"
            style={{
              left: `${bullet.x}px`,
              top: `${bullet.y}px`
            }}
          />
        ))}

      {/* Pokemon Enemies */}
      {enemies.map(enemy => (
        <div
          key={enemy.id}
          className="absolute transition-all duration-200"
          style={{
            left: `${enemy.x}px`,
            top: `${enemy.y}px`,
            width: '32px',
            height: '32px',
          }}
        >
          {pokemonImages[enemy.type] ? (
            <img
              src={pokemonImages[enemy.type]}
              alt={enemy.pokemonName}
              className="w-full h-full object-cover rounded border border-white"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className={`w-full h-full ${getPokemonColor(enemy.type)} rounded-full flex items-center justify-center text-lg border-2 border-white shadow-lg`}>
              <span className="text-white font-bold text-xs">
                {getPokemonEmoji(enemy.type)}
              </span>
            </div>
          )}
          {enemy.health > 1 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <span className="text-xs text-black font-bold">{enemy.health}</span>
            </div>
          )}
        </div>
      ))}

      {/* Game Over overlay */}
      {gameStatus === 'gameOver' && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-red-500 mb-4">GAME OVER</h2>
            <p className="text-xl text-white">The Pokemon got away!</p>
            <p className="text-lg text-gray-400 mt-2">Press R to restart</p>
          </div>
        </div>
      )}

      {/* Victory overlay */}
      {gameStatus === 'victory' && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-green-500 mb-4">VICTORY! 🎉</h2>
            <p className="text-xl text-white">You caught all the Pokemon!</p>
            <p className="text-lg text-gray-400 mt-2">Preparing next wave...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
