/* ============================================================
   Scoremoro — Platform Layer Barrel Export
   ============================================================ */

export type { IAudioPlayer, IShortcutManager, IStorage, IThemeProvider, IWindowManager } from './interfaces';
export { detectPlatform, isElectron, isMacOS, isWindows } from './detect';
export type { Platform } from './detect';
