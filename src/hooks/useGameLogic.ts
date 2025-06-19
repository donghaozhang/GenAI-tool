
import { useState, useEffect, useCallback } from 'react';
import { useGameState } from './useGameState';
import { usePlayer } from './usePlayer';
import { useBullets } from './useBullets';
import { useEnemies } from './useEnemies';
import { useSoundEffects } from './useSoundEffects';
import { checkBulletEnemyCollision, checkBulletPlayerCollision, checkEnemyPlayerCollision } from '../utils/collisionDetection';

export const useGameLogic = () => {
  const [pokemonImages, setPokemonImages] = useState<Record<string, string>>({});
  const [lastEnemyShot, setLastEnemyShot] = useState(0);

  const gameStateHook = useGameState();
  const playerHook = usePlayer();
  const bulletsHook = useBullets();
  const enemiesHook = useEnemies();
  const { playSound, toggleSound, soundEnabled } = useSoundEffects();

  const { gameState } = gameStateHook;
  const { player } = playerHook;
  const { bullets } = bulletsHook;
  const { enemies } = enemiesHook;

  const setPokemonImagesForGame = useCallback((images: Record<string, string>) => {
    setPokemonImages(images);
    console.log('Pokemon images loaded into game:', images);
  }, []);

  const startGame = useCallback(() => {
    gameStateHook.startGame();
    enemiesHook.setEnemies(enemiesHook.createEnemies(gameState.level));
  }, [gameState.level, gameStateHook, enemiesHook]);

  const resetGame = useCallback(() => {
    gameStateHook.resetGameState();
    playerHook.resetPlayer();
    bulletsHook.resetBullets();
    enemiesHook.resetEnemies();
  }, [gameStateHook, playerHook, bulletsHook, enemiesHook]);

  const movePlayer = useCallback((direction: 'left' | 'right') => {
    if (gameState.status !== 'playing') return;
    playerHook.movePlayer(direction);
  }, [gameState.status, playerHook]);

  const shoot = useCallback(() => {
    if (gameState.status !== 'playing') return;
    const shot = bulletsHook.shoot(player);
    if (shot) {
      playSound('shoot', 0.2);
    }
  }, [gameState.status, bulletsHook, player, playSound]);

  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const gameLoop = setInterval(() => {
      bulletsHook.updateBullets();
      enemiesHook.updateEnemyPositions();

      // Enemy shooting logic
      const now = Date.now();
      if (now - lastEnemyShot > 1000 + Math.random() * 2000 && enemies.length > 0) {
        const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
        bulletsHook.addEnemyBullet(
          randomEnemy.x + randomEnemy.width / 2,
          randomEnemy.y + randomEnemy.height
        );
        playSound('enemyShoot', 0.15);
        setLastEnemyShot(now);
      }

      // Collision detection
      bulletsHook.setBullets(prevBullets => {
        const remainingBullets = [...prevBullets];
        
        remainingBullets.forEach((bullet, bulletIndex) => {
          if (bullet.type === 'player') {
            enemies.forEach((enemy) => {
              if (checkBulletEnemyCollision(bullet, enemy)) {
                remainingBullets.splice(bulletIndex, 1);
                playSound('explosion', 0.3);
                
                if (enemy.health <= 1) {
                  gameStateHook.updateScore(enemy.points);
                }
                enemiesHook.damageEnemy(enemy.id);
              }
            });
          } else if (bullet.type === 'enemy') {
            if (checkBulletPlayerCollision(bullet, player)) {
              remainingBullets.splice(bulletIndex, 1);
              gameStateHook.decrementLives();
            }
          }
        });
        
        return remainingBullets;
      });

      // Check game end conditions
      if (checkEnemyPlayerCollision(enemies, player)) {
        playSound('gameOver', 0.4);
        gameStateHook.setGameStatus('gameOver');
      }
      
      if (enemies.length === 0 && gameState.status === 'playing') {
        playSound('levelUp', 0.4);
        gameStateHook.nextLevel();
        
        setTimeout(() => {
          enemiesHook.setEnemies(enemiesHook.createEnemies(gameState.level + 1));
          gameStateHook.setGameStatus('playing');
        }, 2000);
      }
      
      if (gameState.lives <= 0) {
        playSound('gameOver', 0.4);
        gameStateHook.setGameStatus('gameOver');
      }
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameState, player, enemies, lastEnemyShot, gameStateHook, playerHook, bulletsHook, enemiesHook, playSound]);

  return {
    gameState,
    player,
    bullets,
    enemies,
    pokemonImages,
    score: gameState.score,
    level: gameState.level,
    lives: gameState.lives,
    gameStatus: gameState.status,
    startGame,
    resetGame,
    movePlayer,
    shoot,
    setPokemonImagesForGame,
    toggleSound,
    soundEnabled
  };
};
