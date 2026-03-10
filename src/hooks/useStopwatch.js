// src/hooks/useStopwatch.js
import { useState, useEffect, useRef } from 'react';

export function useStopwatch(initialSeconds = 0, running = false) {
  const [elapsed, setElapsed] = useState(initialSeconds);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const baseElapsedRef = useRef(initialSeconds);

  useEffect(() => {
    baseElapsedRef.current = initialSeconds;
    setElapsed(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setElapsed(baseElapsedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        baseElapsedRef.current = elapsed;
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  return elapsed;
}
