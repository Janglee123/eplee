const mousetrap = require('mousetrap');
let Controller = Viewer.Controller || {};

Controller.onClick = function(){

    $('#prev').on('click',()=>{
        Viewer.rendition.prev();
    });
    
    $('#next').on('click', ()=> {
        Viewer.rendition.next();
    });
    $('#back').on('click', () => {
       Viewer.rendition.back();
    });

    $('#library').on('click', () => {
        //todo :: save current location
        win.loadFile(remote.getGlobal('path').library);
    });

    $('#theme').on('click', () => {
        
    });

    $('#bookmark').on('click', () => {
        let cfi = Viewer.rendition.currentLocation().start.cfi;
        let isBookmark = false;//Viewer.isBookmark(cfi);

        if(isBookmark){
            Viewer.addBookmark(cfi);
        }
        else{
            Viewer.removeBookmark(cfi);
        }
    });

    $('#search').on('click', () => {
        
    });
}

Controller.onKey = function(){

    let keyUp = function(event){

        let key = event.keyCode || event.which;
        let next = (key == 39);
        let prev = (key == 37);
        
        if (prev) Viewer.rendition.prev();
        if (next) Viewer.rendition.next();
        if (back) Viewer.rendition.back();
   };

   let keyDown = function(event){
        let interval = 2;
        let key = event.keyCode || event.which;
        let plus = (key == 187 || key == 107);
        let minus = (key == 189 || key == 109);
        let ctr = event.ctrlKey || event.metaKey;

        fontSize = parseInt(Viewer.rendition.themes._overrides['font-size'].value.slice(0,-1));
        event.preventDefault();
        
        if (plus && ctr) Viewer.rendition.themes.fontSize((fontSize + interval) + "%");
        if (minus && ctr) Viewer.rendition.themes.fontSize((fontSize - interval) + "%");
        
   }
    
   Viewer.rendition.on('keyup', keyUp);
   Viewer.rendition.on('keydown', keyDown);
   document.addEventListener('keyup', keyUp, false);
   document.addEventListener('keydown', keyDown, false);
}

Controller.rendition = function(){
    Viewer.rendition.on('relocated', (location) => {
        Viewer.history.push(location.start.cfi);
    });
}

Controller.theme = function(){
}