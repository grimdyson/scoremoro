/* ============================================================
   Scoremoro — Electron Main Process
   ============================================================
   Cross-platform entry point.
   - Windows: standard always-on-top frameless window, taskbar icon
   - macOS:   menubar (tray) app with 🔥 emoji, no dock icon,
              window appears as popover anchored to the tray
   ============================================================ */

const { app, BrowserWindow, ipcMain, Tray, nativeImage } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;
const isMac = process.platform === 'darwin';

/** @type {BrowserWindow | null} */
let mainWindow = null;
/** @type {Tray | null} */
let tray = null;
/** Set to true just before quit so macOS close-to-hide can be bypassed */
let isQuitting = false;

/* ------------------------------------------------------------------ */
/*  Window                                                             */
/* ------------------------------------------------------------------ */

function createWindow() {
  /** @type {Electron.BrowserWindowConstructorOptions} */
  const opts = {
    width: 468,
    height: 240,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    transparent: false,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };

  if (isMac) {
    /* macOS menubar mode ------------------------------------------------- */
    opts.skipTaskbar = true;
    opts.show = false; // shown on tray click
    opts.fullscreenable = false;
    opts.type = 'panel'; // stays above normal windows
  } else {
    /* Windows mode ------------------------------------------------------- */
    opts.icon = path.join(__dirname, '..', 'build', 'icon.ico');
    opts.skipTaskbar = false;
  }

  mainWindow = new BrowserWindow(opts);

  if (isDev) {
    mainWindow.loadURL('http://localhost:1420');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  /* macOS: hide on blur (standard menubar-app popover behaviour) */
  if (isMac) {
    mainWindow.on('blur', () => {
      if (!mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.hide();
      }
    });

    /* Intercept close → hide (keep process alive in tray) */
    mainWindow.on('close', (event) => {
      if (!isQuitting) {
        event.preventDefault();
        mainWindow.hide();
      }
    });
  }

  // Auto-start on login (production only)
  if (!isDev) {
    app.setLoginItemSettings({ openAtLogin: true });
  }
}

/* ------------------------------------------------------------------ */
/*  macOS Tray (menubar)                                               */
/* ------------------------------------------------------------------ */

function createTray() {
  // 1×1 transparent PNG so macOS accepts the Tray; the fire emoji is
  // rendered by setTitle() which appears *instead of* the icon in the
  // menu bar.
  const transparentIcon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAABJRU5ErkJggg=='
  );
  transparentIcon.setTemplateImage(true);

  tray = new Tray(transparentIcon);
  tray.setTitle('🔥');
  tray.setToolTip('Scoremoro');

  tray.on('click', (_event, bounds) => {
    toggleWindow(bounds);
  });
}

/**
 * Show/hide the window anchored below the tray icon.
 * @param {Electron.Rectangle} trayBounds
 */
function toggleWindow(trayBounds) {
  if (!mainWindow) return;

  if (mainWindow.isVisible()) {
    mainWindow.hide();
    return;
  }

  positionWindowBelowTray(trayBounds);
  mainWindow.show();
  mainWindow.focus();
}

/**
 * Centre the window horizontally beneath the tray icon.
 * @param {Electron.Rectangle} trayBounds
 */
function positionWindowBelowTray(trayBounds) {
  if (!mainWindow) return;
  const winBounds = mainWindow.getBounds();
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - winBounds.width / 2);
  const y = Math.round(trayBounds.y + trayBounds.height + 4);
  mainWindow.setPosition(x, y, false);
}

/* ------------------------------------------------------------------ */
/*  App lifecycle                                                      */
/* ------------------------------------------------------------------ */

app.whenReady().then(() => {
  createWindow();

  if (isMac) {
    // Hide dock icon — this app lives in the menu bar only
    if (app.dock) app.dock.hide();
    createTray();
  }
});

app.on('window-all-closed', () => {
  // On macOS the tray keeps the process alive; only quit on explicit exit
  if (!isMac) app.quit();
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('activate', () => {
  // macOS: re-create window if somehow destroyed
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else if (mainWindow && !mainWindow.isVisible()) {
    mainWindow.show();
  }
});

/* ------------------------------------------------------------------ */
/*  IPC: window controls                                               */
/* ------------------------------------------------------------------ */

ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (isMac) {
    win?.hide(); // menubar app: minimize = hide back to tray
  } else {
    win?.minimize();
  }
});

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (isMac) {
    win?.hide(); // menubar app: close = hide back to tray
  } else {
    win?.close();
  }
});

ipcMain.on('window-restore', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  }
});
