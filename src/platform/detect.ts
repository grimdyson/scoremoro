/* ============================================================
   Scoremoro — Platform Detection (Renderer)
   ============================================================
   Runtime detection of the host platform from the renderer
   process. Used to adapt UI behaviour (e.g. window controls
   placement, keyboard shortcut labels).
   ============================================================ */

export type Platform = 'windows' | 'macos' | 'linux' | 'web';

/** Detect the current platform from the renderer process */
export function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes('macintosh') || ua.includes('mac os')) return 'macos';
  if (ua.includes('windows')) return 'windows';
  if (ua.includes('linux')) return 'linux';

  return 'web';
}

/** Whether we're running inside Electron */
export function isElectron(): boolean {
  return typeof window !== 'undefined' && 'electronAPI' in window;
}

/** Whether the host is macOS */
export function isMacOS(): boolean {
  return detectPlatform() === 'macos';
}

/** Whether the host is Windows */
export function isWindows(): boolean {
  return detectPlatform() === 'windows';
}
