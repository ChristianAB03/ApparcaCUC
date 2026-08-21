import { useEffect, type RefObject } from 'react';

export function useClickAway(ref: RefObject<HTMLElement | null>, onAway: () => void): void {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onAway();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onAway]);
}
