import type { ReactNode } from 'react';
import {
  CloseWindowIcon,
  EditIcon,
  LogoIcon,
  MinimizeIcon,
  VolumeIcon,
  VolumeMutedIcon,
} from './icons';
import './WindowFrame.css';

interface WindowFrameProps {
  isMuted: boolean;
  onToggleMute: () => void;
  /** Show the edit (pencil) icon in the header controls */
  showEdit?: boolean;
  /** Called when the edit icon is clicked (returns to idle) */
  onEdit?: () => void;
  children: ReactNode;
}

export function WindowFrame({
  isMuted,
  onToggleMute,
  showEdit = false,
  onEdit,
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

        <div className="window-frame__controls">
          <button
            className={`window-frame__control window-frame__control--mute${isMuted ? ' window-frame__control--muted' : ''}`}
            onClick={onToggleMute}
            type="button"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeMutedIcon size={20} /> : <VolumeIcon size={20} />}
          </button>

          {showEdit && (
            <button
              className="window-frame__control"
              onClick={onEdit}
              type="button"
              aria-label="Edit"
            >
              <EditIcon size={20} />
            </button>
          )}

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
