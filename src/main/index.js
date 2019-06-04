// eslint-disable-next-line import/no-extraneous-dependencies
import { app, BrowserWindow, shell } from 'electron';
import fs from 'fs';
import path from 'path';

const pkg = require('../../package.json');
const { productName } = pkg.build;
const isDev = process.env.NODE_ENV === 'development';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

let mainWindow;

if (isDev) {
  // eslint-disable-next-line
  require('electron-debug')();
}

if (!fs.existsSync(path.join(app.getPath('appData'), 'eplee'))) {
  fs.mkdirSync(path.join(app.getPath('appData'), 'eplee'), { recursive: true });
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
      additionalArguments: [...process.argv],
    },
    show: false,
    frame: false,
    transparent: true,
    icon: path.join(__dirname, '..', '..', 'build', 'icons', '128x128.png'),
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:9080');
  } else {
    mainWindow.loadURL(
      `file://${__dirname}/index.html?path=${process.argv[1]}`
    );

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
