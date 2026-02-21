import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTimerSoundOptions {
  /** When true the sound will not play */
  muted?: boolean;
  /** Volume 0–1 (default 1) */
  volume?: number;
}

interface UseTimerSoundReturn {
  /** Trigger playback (respects muted state, loops until stopped) */
  play: () => void;
  /** Stop playback and reset to the beginning */
  stop: () => void;
  /** Whether audio is currently playing */
  isPlaying: boolean;
}

/**
 * Lightweight hook that wraps an HTML5 Audio element for a single sound
 * effect. The audio file is lazily loaded on first mount and recycled
 * across plays.
 *
 * Usage:
 * ```ts
 * const { play } = useTimerSound('/sounds/timer-finish.mp3', { muted });
 * ```
 *
 * Drop your `.mp3` / `.ogg` / `.wav` file into `public/sounds/`.
 */
export function useTimerSound(
  src: string,
  options: UseTimerSoundOptions = {},
): UseTimerSoundReturn {
  const { muted = false, volume = 1 } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  /* Create or update the Audio element */
  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = volume;
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [src, volume]);

  /* Pause / resume when muted changes while audio is playing */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted && !audio.paused) {
      audio.pause();
    } else if (!muted && audio.paused && audio.currentTime > 0) {
      audio.play().catch(() => {
        /* noop */
      });
    }
  }, [muted]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || muted) return;

    audio.currentTime = 0;
    audio.play().catch(() => {
      /* Autoplay may be blocked in browser contexts; Tauri allows it. */
    });
    setIsPlaying(true);
  }, [muted]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  }, []);

  return { play, stop, isPlaying };
}
