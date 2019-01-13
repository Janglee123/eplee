const path  = require('path');
const Datastore = require('nedb');
const remote = require('electron').remote;
const app = remote.app;
const db = new Datastore({ filename: path.join(app.getPath('userData'),'database.db') });

let Viewer = {};

Viewer.openBook = function(url, options){
    console.log('opening book',url,options);
    this.book = ePub(url,options);
    this.rendition = this.book.renderTo("viewer");
    this.rendition.display();
}

Viewer.Load = function(){
    db.loadDatabase();
    let id = location.search.replace('?id=','');
    
    console.log(id);
    
    db.find({_id:id},(err, file)=>{
        if (err) console.error(err);
        console.log(Viewer.file);
        Viewer.file = file;
        Viewer.openBook(Viewer.file.path,{})
    });
    
}


$(document).ready(()=>{
    Viewer.Load();
});