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

const{app,BrowserWindow} = electron

let win;

function createWindow(){
    win = new BrowserWindow({width:640,height:480});
    win.loadFile(path.join(__dirname,'html','reader.html'));
}

app.on('ready',createWindow)
