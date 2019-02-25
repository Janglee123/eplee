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

Controller.onTocItemClick = function(herf){
    console.log(herf);
    Viewer.rendition.display(herf);
}

Controller.onKey = function(){

    let keyUp = function(event){

        let ctr = event.ctrlKey || event.metaKey;
        let key = event.keyCode || event.which;
        let next = (key == 39);
        let prev = (key == 37);
        let back = (key == 8);
        let d = (key == 68);
        if (prev) Viewer.rendition.prev();
        if (next) Viewer.rendition.next();
        if (back) Viewer.rendition.back();
        if(d && ctr) Controller.theme();
    };

   let keyDown = function(event){
        let interval = 2;
        let key = event.keyCode || event.which;
        let plus = (key == 187 || key == 107);
        let minus = (key == 189 || key == 109);
        let ctr = event.ctrlKey || event.metaKey;

        fontSize = parseInt(Viewer.rendition.themes._overrides['font-size'].value.slice(0,-1));
        event.preventDefault();

        if (plus && ctr) Viewer.rendition.themes.fontSize((fontSize + interval) + "px");
        if (minus && ctr) Viewer.rendition.themes.fontSize((fontSize - interval) + "px");
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

Controller.theme = function(theme){
    if(Viewer.currentTheme === 'dark'){
        $('#main').removeClass('dark').addClass('light');
        Viewer.currentTheme = 'light';
        rendition.themes.select('light');
    }
    else{
        $('#main').removeClass('light').addClass('dark');
        Viewer.currentTheme = 'dark';
        rendition.themes.select('dark');
    }
}
