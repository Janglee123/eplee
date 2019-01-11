const url = require('url');
const path  = require('path');
const fs = require('fs');
const Datastore = require('nedb');
const getCover = require('epub-cover-extractor');
const dialog = remote.dialog;
const app = remote.app;
const db = new Datastore({ filename: path.join(app.getPath('userData'),'database.db') });
epub = new ePub();
Library = {};


Library.init = function(){
    db.loadDatabase();

    const coverDir = path.join(app.getPath('userData'),'covers');
    if(!fs.existsSync(coverDir)){
        fs.mkdirSync(coverDir, { recursive: true }, (err) => {
            if (err) throw err;
        });
    }
}

Library.addBook = function(files){
    files.forEach(file => {
        epub = new ePub(file);

        epub.loaded.metadata.then((metadata) => {
            getCover.fromFilePath(file, coverDir, (err, coverPath) => {
                if (err){
                     newCoverPath = path.join('..','img','default-cover.jpg');
                }
                else{
                    var newCoverPath = path.join(coverDir, metadata.title.replace(/ /g,''));
                    fs.renameSync(coverPath,newCoverPath);
                }

                let book = {}
                book.title = metadata.title;
                book.author = metadata.creator
                book.publisher = metadata.publisher
                book.path = file;
                book.cover = newCoverPath;

                db.find( book, (err, result) => {
                    if (err) console.error(err);
                    if(result.length == 0){
                        console.log('New Book, adding to database');
                        db.insert(book, (err, newb) => {
                            if (err) console.error(err);
                            Library.loadBook(book);
                        });
                    }
                });
            });
        });
    });
};

Library.load = function(){
    db.find({}, (err, result) => {
        if (err) console.error(err);
        result.forEach(row => {
            Library.loadBook(row);
        });
    });
};

Library.loadBook = function(book){
    let title = book.title;
    let cover = book.cover;

    if(title.length > 28){
        title = title.slice(0,25) + '...';
    }

    let address = url.format({
        slashes: true,
        protocol: 'file:',
        pathname: path.join(__dirname,'..','html','reader.html'),
        query: {
            bookPath:book.path,
        }
    })
    $('#lib').append(`<a href = "${address}" title = "${book.title}" ><img src = "${cover}">${title}</a>`);

}

Library.searchBook = function(name){
    query = new RegExp(name,'i');
    db.find({ title: { $regex: query }},(err, result) => {
        if (err) console.error(err);
        result.forEach(row => {
            Library.loadBook(row);
        });
    });
};

$(document).ready(function(){

    Library.init();

    if( remote.process.argv[1].endsWith('.epub') && fs.existsSync(remote.process.argv[1])){
        Library.addBook([remote.process.argv[1]]);

        let address = url.format({
            slashes: true,
            protocol: 'file:',
            pathname: path.join(__dirname,'..','html','reader.html'),
            query: {
                bookPath:remote.process.argv[1],
            }
        })
        win.loadURL(address);
    }

    Library.load();
    
    $('#add').on("click",()=>{
        let files = dialog.showOpenDialog(
            {
                filters:[{ name: 'ePub', extensions: ['epub'] }],
                properties:['openFile','multiSelections'],
            }
        );
        if(!files){
            return;
        }
        Library.addBook(files);
    });

    $('#search').on("click", ()=>{
        $('#search-box')
            .toggle()
            .focus();
    });

    $('#search-box').on('change past keyup', function(){
        $('#lib').empty();
        Library.searchBook($(this).val());
    });

    $('#search-box').on('blur', function(){
        if($(this).val()==''){
            $(this).toggle();
        }
    })
});
