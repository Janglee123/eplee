const url = require('url');
const path  = require('path');
const fs = require('fs');
const getCover = require('epub-cover-extractor');
const dialog = remote.dialog;
const app = remote.app;
LIBRARY = {};
epub = new ePub();

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
        book.id = new Date().getTime();
        book.path = file;
        book.title = '';
        epub = new ePub(file);

        epub.loaded.metadata.then((metadata) => {
            book.title = metadata.title;
            book.author = metadata.creator
            book.publisher = metadata.publisher

            getCover.fromFilePath(file,coverDir,function(err, coverPath){
                if (err){
                    coverPath = path.join(coverDir,'default.jpg')
                    console.error(err);
                }
                let newCoverPath = path.join(coverDir,book.id.toString());
                book.cover = newCoverPath;
                fs.renameSync(coverPath,newCoverPath);
                let bookJson = JSON.stringify(book);
                fs.writeFile(path.join(bookDir,book.id.toString()+'.json'), JSON.stringify(book), { flag: 'w' },(err)=>{
                    if (err) throw err;
                });
            });
        });
    });

    LIBRARY.loadBooks();
};

LIBRARY.loadBooks = function(){
    $('#lib').html('');
    fs.readdir(bookDir, (err, files) => {
        if (err) throw err;
        files.forEach(file => {
            let book = require(path.join(bookDir,file));
            let title = book.title;
            let cover = book.cover;
            let len = title.length
            if(title.length > 30){
                title = title.slice(0,30) + '...';
            }

            let address = url.format({
                slashes: true,
                protocol: 'file:',
                pathname: path.join(__dirname,'..','html','reader.html'),
                query: {
                    bookPath:book.path,
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
