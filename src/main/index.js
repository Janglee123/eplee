/* eslint-disable */
import { app, BrowserWindow } from 'electron'
/* eslint-enable */
const pkg = require('../../package.json')
const { productName } = pkg.build

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true

const isDev = process.env.NODE_ENV === 'development'

let mainWindow

if (isDev) {
  // eslint-disable-next-line
  require('electron-debug')()
}

async function installDevTools() {
  try {
    // eslint-disable-next-line
    require('devtron').install()
    // eslint-disable-next-line
    require('vue-devtools').install()
  } catch (err) {
    // eslint-disable-next-line
    console.error(err)
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
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: false,
      webSecurity: false,
    },
    show: false,
    // frame: false,
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:9080')
  } else {
    mainWindow.loadURL(`file://${__dirname}/index.html`)

    global.__static = require('path')
      .join(__dirname, '/static')
      .replace(/\\/g, '\\\\')
  }

  // Show when loaded
  mainWindow.on('ready-to-show', () => {
    mainWindow.setTitle(productName)
    mainWindow.show()
    mainWindow.focus()

    if (isDev || process.argv.indexOf('--debug') !== -1) {
      mainWindow.webContents.openDevTools()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  app.setName(productName)
  createWindow()

  if (isDev) {
    installDevTools()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
