import type { AccentMode } from '@core/types';
import type { Theme } from '@core/useTheme';
import type { ReactNode } from 'react';
import {
  CloseWindowIcon,
  LogoIcon,
  MinimizeIcon,
  MoonIcon,
  SunIcon,
  VolumeIcon,
  VolumeMutedIcon,
} from './icons';
import './WindowFrame.css';

interface WindowFrameProps {
  isMuted: boolean;
  onToggleMute: () => void;
  /** Current theme */
  theme: Theme;
  /** Toggle between dark/light */
  onToggleTheme: () => void;
  /** Finish time to display centred in the header (e.g. "13:00") */
  finishTime?: string;
  /** Accent colour for the finish time text */
  finishTimeAccent?: AccentMode;
  children: ReactNode;
}

export function WindowFrame({
  isMuted,
  onToggleMute,
  theme,
  onToggleTheme,
  finishTime,
  finishTimeAccent,
  children,
}: WindowFrameProps): ReactNode {
  const handleMinimize = () => {
    (
      window as unknown as { electronAPI?: { minimizeWindow: () => void } }
    ).electronAPI?.minimizeWindow();
  };
  const handleCloseWindow = () => {
    (window as unknown as { electronAPI?: { closeWindow: () => void } }).electronAPI?.closeWindow();
  };

  return (
    <div className="window-frame">
      <div className="window-frame__header" data-tauri-drag-region>
        <div className="window-frame__logo">
          <LogoIcon />
        </div>

        {finishTime && (
          <div className="window-frame__finish-time">
            <span className={`window-frame__finish-value window-frame__finish-value--${finishTimeAccent ?? 'work'}`}>
              {finishTime}
            </span>
            <span className="window-frame__finish-label">Finish</span>
          </div>
        )}

        <div className="window-frame__controls">
          <button
            className={`window-frame__control window-frame__control--mute${isMuted ? ' window-frame__control--muted' : ''}`}
            onClick={onToggleMute}
            type="button"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeMutedIcon size={20} /> : <VolumeIcon size={20} />}
          </button>

          <button
            className="window-frame__control"
            onClick={onToggleTheme}
            type="button"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
          </button>

          <button
            className="window-frame__control"
            onClick={handleMinimize}
            type="button"
            aria-label="Minimize"
          >
            <MinimizeIcon size={20} />
          </button>
          <button
            className="window-frame__control"
            onClick={handleCloseWindow}
            type="button"
            aria-label="Close"
          >
            <CloseWindowIcon size={20} />
          </button>
        </div>
      </div>

      <div className="window-frame__panel">{children}</div>
    </div>
  );
}
