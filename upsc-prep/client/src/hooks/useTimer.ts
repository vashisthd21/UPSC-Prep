import { useCallback, useEffect, useRef, useState } from "react";

interface UseTimerOptions {
  onExpire?: () => void;
}

// A countdown timer anchored to a fixed end timestamp (not a tick counter),
// so it survives re-renders and a page refresh (the caller persists
// `endsAt` and restores it) without losing accuracy.
export function useTimer(endsAt: number, options: UseTimerOptions = {}) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.round((endsAt - Date.now()) / 1000))
  );
  const expiredRef = useRef(false);
  const onExpireRef = useRef(options.onExpire);
  onExpireRef.current = options.onExpire;

  useEffect(() => {
    expiredRef.current = false;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current?.();
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const format = useCallback((totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }, []);

  return { secondsLeft, formatted: format(secondsLeft), isLow: secondsLeft <= 300 && secondsLeft > 0 };
}
