import { useState, useCallback } from 'react';
import { Bullet, Player } from '../types/game';
import { BULLET_SPEED, CANVAS_HEIGHT } from '../constants/gameConstants';

export const useBullets = () => {
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [lastShot, setLastShot] = useState(0);

  const shoot = useCallback((player: Player) => {
    const now = Date.now();
    if (now - lastShot < 200) return false;
    
    setBullets(prev => [...prev, {
      id: now,
      x: player.x + player.width / 2,
      y: player.y,
      width: 4,
      height: 16,
      speed: BULLET_SPEED,
      type: 'player'
    }]);
    setLastShot(now);
    return true;
  }, [lastShot]);

  const addEnemyBullet = useCallback((x: number, y: number) => {
    const now = Date.now();
    setBullets(prev => [...prev, {
      id: now + 1000000,
      x,
      y,
      width: 4,
      height: 16,
      speed: BULLET_SPEED * 0.6,
      type: 'enemy'
    }]);
  }, []);

  const updateBullets = useCallback(() => {
    setBullets(prev => prev
      .map(bullet => ({
        ...bullet,
        y: bullet.type === 'player' ? bullet.y - bullet.speed : bullet.y + bullet.speed
      }))
      .filter(bullet => bullet.y > -bullet.height && bullet.y < CANVAS_HEIGHT)
    );
  }, []);

  const removeBullet = useCallback((bulletId: number) => {
    setBullets(prev => prev.filter(bullet => bullet.id !== bulletId));
  }, []);

  const resetBullets = useCallback(() => {
    setBullets([]);
  }, []);

  return {
    bullets,
    shoot,
    addEnemyBullet,
    updateBullets,
    removeBullet,
    resetBullets,
    setBullets
  };
};
