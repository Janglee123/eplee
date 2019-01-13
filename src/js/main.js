const electron = require('electron');
const electronLocalshortcut = require('electron-localshortcut');
const path  = require('path');
const url = require('url')

const{app, BrowserWindow, dialog} = electron;
let win;

let createWindow = function(){
    let win = new BrowserWindow({
        width:1042,
        height:640,
        frame: false,
        devtools: true,
        webSecurity: true,
        useContentSize: true,
        transparent: true,
        show: false,
        webPreferences: {
            nodeIntegration: true,
        },
        icon: path.join(__dirname,'..','img','icons','64x64.png')
    });

    win.loadFile(path.join(__dirname,'..','html','library.html'));

    win.once('ready-to-show', () => {
        win.show();
    });

    electronLocalshortcut.register(win, 'Ctrl+O', () => {
        
        let file = dialog.showOpenDialog(
            {
                filters:[{ name: 'ePub', extensions: ['epub'] }],
                properties:['openFile'],
            }
        );
        if(!file){
            return;
        }
        
        Library.addBook(file);

        win.loadURL(url.format({
            slashes: true,
            protocol: 'file:',
            pathname: path.join(__dirname,'..','html','reader.html'),
            query: {
                bookPath:file
            }
        }));
    });

    electronLocalshortcut.register(win, 'Ctrl+I', () =>{
        win.webContents.toggleDevTools();
    });
}

app.on('ready',() => setTimeout(createWindow,100));
app.disableHardwareAcceleration();
