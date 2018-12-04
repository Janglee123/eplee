const electron = require('electron');
const path  = require('path');

/*const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    dialog,
    powerSaveBlocker
} = electron;*/

const{app,BrowserWindow,icpMain} = electron

let win;

function createWindow(){
    win = new BrowserWindow({
        width:640,
        height:480,
        //kiosk:true,
        //frame: false,
        webSecurity: false,
        titleBarStyle: 'hiddenInset',
        //backgroundColor: '#2e2c29',
        useContentSize: true
    });
    win.setMenu(null)
    win.loadFile(path.join(__dirname,'..','html','reader.html'));
}

app.on('ready',createWindow)
