var book = ePub("../book.epub");
var rendition = book.renderTo("viewer", {width:"100%", height:"auto"});
var page_no = 0
var displayed = rendition.display();

var next = document.getElementById("next");
next.addEventListener("click", function(){
    rendition.next();
    console.log('next');
}, false);

var prev = document.getElementById("prev");
prev.addEventListener("click", function(){
    rendition.prev();
    console.log('prev');
}, false);

var keyListener = function(e){

    // Left Key
    if ((e.keyCode || e.which) == 37) {
        rendition.prev();
    }

    // Right Key
    if ((e.keyCode || e.which) == 39) {
        rendition.next();
    }

};
