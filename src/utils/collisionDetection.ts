
import { Bullet, Enemy, Player } from '../types/game';

export const checkBulletEnemyCollision = (bullet: Bullet, enemy: Enemy): boolean => {
  return bullet.x < enemy.x + enemy.width &&
         bullet.x + bullet.width > enemy.x &&
         bullet.y < enemy.y + enemy.height &&
         bullet.y + bullet.height > enemy.y;
};

export const checkBulletPlayerCollision = (bullet: Bullet, player: Player): boolean => {
  return bullet.x < player.x + player.width &&
         bullet.x + bullet.width > player.x &&
         bullet.y < player.y + player.height &&
         bullet.y + bullet.height > player.y;
};

export const checkEnemyPlayerCollision = (enemies: Enemy[], player: Player): boolean => {
  if (enemies.length === 0) return false;
  const bottomEnemy = Math.max(...enemies.map(e => e.y + e.height), 0);
  return bottomEnemy >= player.y;
};
