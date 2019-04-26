const url = require('url');
const path = require('path');
const fs = require('fs');
const getCover = require('epub-cover-extractor');
const db = remote.getGlobal('db');
const coverDir = remote.getGlobal('path').coverDir;
let Library = {};
Library.init = function () {
    console.log('Library init');
}

Library.addBook = function (files) {
    console.log('Library addbook');
    files.forEach(file => {
        epub = new ePub(file);

        epub.loaded.metadata.then((metadata) => {
            getCover.fromFilePath(file, coverDir, (err, coverPath) => {
                
                console.log(coverDir);
                let newCoverPath;
                if (err) {
                    newCoverPath = path.join('..', 'img', 'default-cover.jpg');
                    console.log(err, newCoverPath);                    
                }
                else {
                    newCoverPath = path.join(coverDir, metadata.title.replace(/ /g, ''));
                    fs.renameSync(coverPath, newCoverPath);
                    console.log(newCoverPath);
                }

                let book = {}
                book.title = metadata.title;
                book.author = metadata.creator
                book.publisher = metadata.publisher
                book.path = file;
                book.cover = newCoverPath;
                book.bookmark = [];
                db.find(book, (err, result) => {
                    if (err) console.error(err);
                    if (result.length == 0) {
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

Library.load = function () {
    console.log('Library load');
    db.find({}, (err, result) => {
        if (err) console.error(err);
        console.log(result);
        result.forEach(row => {
            if (fs.existsSync(row.path)) {
                Library.loadBook(row);
                console.log('Book Loaded');
                console.log(row);
                console.log(row.path);
            }
            else {
                console.log('Book not found');
                console.log(row);
            }
        });
    });
};

Library.loadBook = function (book) {
    console.log('Library loadBook');
    let title = book.title;
    let cover = book.cover;

    if (title.length > 28) {
        title = title.slice(0, 25) + '...';
    }

    let address = url.format({
        slashes: true,
        protocol: 'file:',
        pathname: remote.getGlobal('path').viewer,
        query: {
            bookPath: book.path,
            id: book._id,
        }
    });

    $('#lib').append(`<a href = "${address}" title = "${book.title}" ><img src = "${cover}">${title}</a>`);
}

Library.searchBook = function (name) {
    query = new RegExp(name, 'i');
    console.log({query});
    db.find({ title: { $regex: query } }, (err, result) => {
        console.log({result});
        if (err){
            console.error(err);
            return;
        }
        result.forEach(row => {
            Library.loadBook(row);
        });
    });
};

Library.controller = function () {

    $('#add').on("click", () => {
        let files = dialog.showOpenDialog(
            {
                filters: [{ name: 'ePub', extensions: ['epub'] }],
                properties: ['openFile', 'multiSelections'],
            }
        );
        if (!files) {
            return;
        }
        Library.addBook(files);
    });

    $('#search').on("click", () => {
        $('#search-box')
            .toggle()
            .focus();
    });

    $('#search-box').on('change past keyup', function () {
        $('#lib').empty();
        Library.searchBook($(this).val());
    });

    $('#search-box').on('blur', function () {
        if ($(this).val() == '') {
            $(this).toggle();
        }
    });
}

Library.init();
Library.load();

$(document).ready(function () {
    Library.controller();
});
