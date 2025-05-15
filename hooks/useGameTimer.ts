import { useState, useEffect, useRef } from 'react';

export const useGameTimer = (initialSeconds: number) => {
  const [time, setTime] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  
  // Ensure timer continues to run even when app is in the background
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          if (prev <= 0) {
            stopTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);
  
  const startTimer = () => {
    setIsRunning(true);
  };
  
  const stopTimer = () => {
    setIsRunning(false);
  };
  
  const resetTimer = () => {
    stopTimer();
    setTime(initialSeconds);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return {
    time,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
  };
};