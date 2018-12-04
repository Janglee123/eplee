const electron = require('electron');
const electronLocalshortcut = require('electron-localshortcut');
const path  = require('path');
const url = require('url')

const{app, BrowserWindow, dialog, Menu, MenuItem} = electron;
menu = new Menu();
let win;

function createWindow(){
    win = new BrowserWindow({
        width:960,
        height:640,
        //frame: false,
        webSecurity: false,
        useContentSize: true
    });

    electronLocalshortcut.register('Ctrl+O', () => {
        console.log('openDialog open');
        let pathtoepub = dialog.showOpenDialog(
            {
                filters:[{ name: 'ePub', extensions: 'epub' }],
                properties:['openFile'],
            }
        )[0];
        console.log(pathtoepub);

        if(!pathtoepub){
            return;
        }
        if(!pathtoepub.endsWith('.epub')){
            dialog.showMessageBox({message:'Please select ePub file'});
            return;
        }

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

app.on('ready',createWindow)
