/* ============================================================
   Scoremoro — Platform Abstraction Interfaces
   ============================================================
   Each capability is defined as a TypeScript interface.
   Implementations live in platform-specific subdirectories
   (e.g. src/platform/windows/, src/platform/macos/).
   The app layer imports only these interfaces.
   ============================================================ */

/** Window management abstraction */
export interface IWindowManager {
  /** Minimize / hide the window */
  minimize(): void;
  /** Close / hide-to-tray the window */
  close(): void;
  /** Restore, show, and focus the window */
  restore(): void;
}

/** Audio playback abstraction */
export interface IAudioPlayer {
  /** Play a bundled sound file (loops until stopped) */
  play(src: string): void;
  /** Stop current playback */
  stop(): void;
  /** Whether audio is currently playing */
  readonly isPlaying: boolean;
}

/** Persistent storage abstraction */
export interface IStorage {
  /** Read a value by key */
  get<T>(key: string): T | null;
  /** Write a value by key */
  set<T>(key: string, value: T): void;
  /** Remove a key */
  remove(key: string): void;
}

/** System theme detection */
export interface IThemeProvider {
  /** Current system theme */
  readonly systemTheme: 'dark' | 'light';
  /** Listen for system theme changes */
  onChange(callback: (theme: 'dark' | 'light') => void): () => void;
}

/** Global keyboard shortcuts */
export interface IShortcutManager {
  /** Register a global shortcut */
  register(accelerator: string, callback: () => void): void;
  /** Unregister a global shortcut */
  unregister(accelerator: string): void;
  /** Unregister all shortcuts */
  unregisterAll(): void;
}
