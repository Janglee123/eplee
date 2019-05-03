// eslint-disable-next-line import/no-extraneous-dependencies
import { app, BrowserWindow, shell } from 'electron';

const pkg = require('../../package.json');
const { productName } = pkg.build;
const isDev = process.env.NODE_ENV === 'development';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

let mainWindow;

if (isDev) {
  // eslint-disable-next-line
  require('electron-debug')();
}

async function installDevTools() {
  try {
    // eslint-disable-next-line
    require('devtron').install();
    // eslint-disable-next-line
    require('vue-devtools').install();
  } catch (err) {
    // eslint-disable-next-line
    console.error(err);
  }
}

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    // useContentSize: true,
    width: 960,
    height: 640,
    minWidth: 480,
    minHeight: 320,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: false,
      webSecurity: false,
      experimentalFeatures: true,
    },
    show: false,
    frame: false,
    transparent: true,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:9080');
  } else {
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    global.__static = require('path')
      .join(__dirname, '/static')
      .replace(/\\/g, '\\\\');
  }

  // Show when loaded
  mainWindow.on('ready-to-show', () => {
    mainWindow.setTitle(productName);
    mainWindow.show();
    mainWindow.focus();

    if (isDev || process.argv.indexOf('--debug') !== -1) {
      mainWindow.webContents.openDevTools();
    }
  });

  // const { webContents } = mainWindow;
  // webContents.on('did-finish-load', () => {
  //   webContents.setZoomFactor(1);
  //   webContents.setVisualZoomLevelLimits(1, 1);
  //   webContents.setLayoutZoomLevelLimits(0, 0);
  // });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url, { active: true });
  });
}

app.on('ready', () => {
  app.setName(productName);
  // hack to make tranparent window in linux
  setTimeout(createWindow, 500);

  if (isDev) {
    installDevTools();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// disable it for transparency
app.disableHardwareAcceleration();

// disable zooming
app.commandLine.appendSwitch('disable-pinch');
