const url = require('url');
const path  = require('path');
const fs = require('fs');
const Datastore = require('nedb');
const getCover = require('epub-cover-extractor');
const dialog = remote.dialog;
const app = remote.app;
const db = new Datastore({ filename: path.join(app.getPath('userData'),'database.db') });
epub = new ePub();
LIBRARY = {};

db.loadDatabase();
db.find({}, function (err, count) {
    console.log(count);
});
coverDir = path.join(app.getPath('userData'),'covers');
if(!fs.existsSync(coverDir)){
    fs.mkdirSync(coverDir, { recursive: true }, (err) => {
        if (err) throw err;
    });
}
bookDir = path.join(app.getPath('userData'),'books');
if(!fs.existsSync(bookDir)){
    fs.mkdirSync(bookDir, { recursive: true }, (err) => {
        if (err) throw err;
    });
}

LIBRARY.addBook = function(files){

    files.forEach(file => {

        let book = {}
        //book.id = new Date().getTime();
        book.path = file;
        epub = new ePub(file);

        epub.loaded.metadata.then((metadata) => {
            book.title = metadata.title;
            book.author = metadata.creator
            book.publisher = metadata.publisher

            getCover.fromFilePath(file,coverDir,function(err, coverPath){
                if (err){
                    var newCoverPath = path.join(coverDir,'default.jpg')
                    console.error(err);
                }
                else{
                    var newCoverPath = path.join(coverDir,book.title.replace(/ /g,''));
                    fs.renameSync(coverPath,newCoverPath);
                }
                book.cover = newCoverPath;

                db.find( book, (err, result) => {
                    if (err) console.error(err);
                    if(result.length != 0){
                        console.log(book);
                    }
                    else {
                        console.log('New Book, adding to database');
                        db.insert(book, (err, newb) => {
                            if (err) console.error(err);
                            console.log('added' + newb);
                        })
                    }
                });
            });
        });
    });

    LIBRARY.loadBooks();
};

LIBRARY.loadBooks = function(){
    $('#lib').html('');

    db.find({}, (err, result) => {
        if (err) console.error(err);
        result.forEach(row => {
            let title = row.title;
            let cover = row.cover;

            if(title.length > 30){
                title = title.slice(0,30) + '...';
            }

            let address = url.format({
                slashes: true,
                protocol: 'file:',
                pathname: path.join(__dirname,'..','html','reader.html'),
                query: {
                    bookPath:row.path,
                }
            })
            $('#lib').append(`<a href = "${address}" ><img src = "${cover}">${title}</a>`)
        })
    })
};


$(document).ready(function(){
    LIBRARY.loadBooks();
    $('#add').on("click", function(){
        let files = dialog.showOpenDialog(
            {
                filters:[{ name: 'ePub', extensions: ['epub'] }],
                properties:['openFile','multiSelections'],
            }
        );
        if(!files){
            return;
        }
        LIBRARY.addBook(files);
    });

    $('.book').on("click", function(){
        console.log('click');
    })
});
