const url = require('url');
const path  = require('path');
var fs = require('fs');
var epubParser = require('epub-metadata-parser');
const dialog = remote.dialog;
const app = remote.app;

LIBRARY = LIBRARY || {};

LIBRARY.addBook = function(bookPath){
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

    files.forEach(function(file){
        book = {}
        book.path = file
        console.log(file);

    });
}


$(document).ready(function(){
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


	});
});
