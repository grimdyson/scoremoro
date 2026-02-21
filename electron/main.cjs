const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 468,
    height: 240,
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    transparent: false,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:1420');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Auto-start on login (production only)
  if (!isDev) {
    app.setLoginItemSettings({ openAtLogin: true });
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

// IPC: window controls
ipcMain.on('window-minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize();
});

ipcMain.on('window-close', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close();
});

ipcMain.on('window-restore', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  }
});
