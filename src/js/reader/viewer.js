const path  = require('path');
const db = remote.getGlobal('db');

Viewer = {};
Viewer.Controller = {}
Viewer.history = []


Viewer.init = function(){
    let bookPath = (new URL(document.location)).searchParams.get('bookPath');

    Viewer.metadata = {}
    Viewer.metadata._id = id = (new URL(document.location)).searchParams.get('id');

    Viewer.openBook(bookPath);
}

Viewer.openBook = function(bookPath){
    Viewer.book = book = new ePub(bookPath, {});
    Viewer.rendition = rendition = book.renderTo('viewer',{
        width: "100%",
        height: "100%"
    });
    rendition.display();
    
    rendition.back = function(){
        Viewer.history.pop(); //current location
        prevCfi = Viewer.history.pop(); //prev location
        Viewer.rendition.display(prevCfi);
    }

    book.ready.then(() => {
        db.find({_id:Viewer.metadata._id}, (err,result) => {
            if(err) console.error(err);
            Viewer.metadata.bookmark = result[0].bookmark;
        });
        
        let meta = book.package.metadata; // Metadata from the package json
	    let toc = book.navigation.toc; // Table of Contents

        $('#book-title').html(`${book.package.metadata.title}`);
        Viewer.rendition.themes.fontSize('100%');
    }).then(()=>{
        $('#loader').remove();
    })
    
}

Viewer.onBookReady = function(){
    console.log(Viewer.book.package.title);
}

Viewer.isbookmark = function(cfi){
    return Viewer.metadata.bookmark.find(cfi) > 0;
}

Viewer.addBookmark = function(cfi){
    Viewer.metadata.bookmark.push(cfi);
    db.update({_id:Viewer.metadata._id},{$pull : {bookmark:cfi}},{}, err => {
        if (err) console.error(err);
    });
}

Viewer.removeBookmark = function(cfi){
    let index = Viewer.metadata.bookmark.find(cfi)
    Viewer.metadata.bookmark.splice(index,1);

    db.update({_id:Viewer.metadata._id},{$push : {bookmark:cfi}},{}, err => {
        if (err) console.error(err);
    });
}

Viewer.search = function(){}

$(document).ready(()=>{

    Viewer.init();
    Viewer.Controller.onClick();
    Viewer.Controller.onKey();
    Viewer.Controller.rendition();
})