const url = require('url');
const path  = require('path');
const fs = require('fs');
const Datastore = require('nedb');
const getCover = require('epub-cover-extractor');
const dialog = remote.dialog;
const app = remote.app;
const db = new Datastore({ filename: path.join(app.getPath('userData'),'database.db') });
const coverDir = path.join(app.getPath('userData'),'covers');

let Library = {};

Library.init = function(){
    console.log('Library init');
    db.loadDatabase();
    if(!fs.existsSync(coverDir)){
        fs.mkdirSync(coverDir, { recursive: true }, (err) => {
            if (err) throw err;
        });
    }
}

Library.addBook = function(files){
    console.log('Library addbook');
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
    console.log('Library load');
    db.find({}, (err, result) => {
        if (err) console.error(err);
        console.log(result);
        result.forEach(row => {
            if(fs.existsSync(row.path)){
                Library.loadBook(row);
                console.log('Book Loaded');
                console.log(row);
            }
            else{
                console.log('Book not found');
                console.log(row);
                /*db.remove({_id:row._id},{}, err =>{
                    if(err) console.error(err);
                });*/
            }
        });
    });
};

Library.loadBook = function(book){
    console.log('Library loadBook');
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
            bookPath:book.newCoverPath
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

Library.controller = function(){

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
    });

   /* document.addEventListener('keyDonw',(e)=>{
        let search = e.keyWhich == 83;
        console.log(e);
        
        if(search){
            $('#search-box')
            .show()
            .focus();
        }
    },false);*/
}

Library.init();

file = remote.process.argv[1];
if(file && file != '.' && file != ''){
    console.log('opening file : ' + file);
    if( file.endsWith('.epub') && fs.existsSync(file)){
        Library.addBook([file]);

        let address = url.format({
            slashes: true,
            protocol: 'file:',
            pathname: path.join(__dirname,'..','html','reader.html'),
            query: {
                bookPath:file,
            }
        })
        win.loadURL(address);
    }
}
Library.load();

$(document).ready(function(){
    Library.controller();
});
