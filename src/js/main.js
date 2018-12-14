const electron = require('electron');
const electronLocalshortcut = require('electron-localshortcut');
const path  = require('path');
const url = require('url')

const{app, BrowserWindow, dialog, Menu, MenuItem} = electron;
menu = new Menu();
let win;

function createWindow(){
    win = new BrowserWindow({
        width:1042,
        height:640,
        frame: false,
        webSecurity: false,
        useContentSize: true,
            transparent: true,
        icon: path.join(__dirname,'..','img','icons','64x64.png')
    });

    electronLocalshortcut.register(win, 'Ctrl+O', () => {
        console.log('openDialog open');
        let pathtoepub = dialog.showOpenDialog(
            {
                filters:[{ name: 'ePub', extensions: ['epub'] }],
                properties:['openFile'],
            }
        );
        if(!pathtoepub){
            return;
        }
        pathtoepub = pathtoepub[0];

        win.loadURL(url.format({
            slashes: true,
            protocol: 'file:',
            pathname: path.join(__dirname,'..','html','reader.html'),
            query: {
                bookPath:pathtoepub
            }
        }));

    });
    win.loadFile(path.join(__dirname,'..','html','library.html'));
}

app.on('ready',createWindow);

console.log(app.getPath('userData'));
