const win = require('electron');

var book = ePub("../book.epub");
let rendition = book.renderTo(document.getElementById("viewer"), {width:"100%", height:"auto"});
var page_no = 0
var displayed = rendition.display();

let contents = win.webContents
console.log(contents)

var keyListener = function(e){
    // Left Key
    if ((e.keyCode || e.which) == 37) {
        rendition.prev();
        console.log('prev');
    }

    // Right Key
    if ((e.keyCode || e.which) == 39) {
        rendition.next();
        console.log('next');
    }

};
