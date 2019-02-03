const {app, BrowserWindow, dialog} = require('electron');
const electronLocalshortcut = require('electron-localshortcut');
const path  = require('path');
const url = require('url');
const fs = require('fs');
const Datastore = require('nedb');
const coverDir = path.join(app.getPath('userData'),'covers');

global.path = {
    library : path.join(__dirname, '..', 'html', 'library.html'),
    viewer : path.join(__dirname, '..', 'html', 'viewer.html'),
    db: path.join(app.getPath('userData'), 'database.db'),
    theme : path.join(__dirname,'..','css','theme.css'),
};
global.db = new Datastore({ filename: global.path.db });

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

    win.loadFile(global.path.library);

    win.once('ready-to-show', () => {
        win.show();
    });

    win.on('close', () => {
        win = null;
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
            pathname: global.path.viewer,
            query: {
                bookPath:file
            }
        }));
    });

    electronLocalshortcut.register(win, 'Ctrl+I', () =>{
        win.webContents.toggleDevTools();
    });

}


app.on('window-all-closed', () => {
    app.quit()
});

app.on('ready',() => {
    //load database
    global.db.loadDatabase();

    //
    if(!fs.existsSync(coverDir)){
        fs.mkdirSync(coverDir, { recursive: true }, (err) => {
            if (err) throw err;
        });
    }

    //hack to make tranparent window in linux 
    setTimeout(createWindow,100)
});
app.disableHardwareAcceleration();
