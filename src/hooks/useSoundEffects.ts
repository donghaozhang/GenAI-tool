
import { useCallback, useEffect, useState } from 'react';
import { soundManager } from '../utils/soundManager';

export const useSoundEffects = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setSoundEnabled(soundManager.isEnabled());
  }, []);

  const playSound = useCallback((soundName: string, volume?: number) => {
    soundManager.play(soundName, volume);
  }, []);

  const toggleSound = useCallback(() => {
    const newState = soundManager.toggle();
    setSoundEnabled(newState);
    return newState;
  }, []);

  return {
    playSound,
    toggleSound,
    soundEnabled
  };
};
