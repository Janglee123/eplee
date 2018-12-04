var book = ePub("../book.epub");
let rendition = book.renderTo(document.getElementById("viewer"), {width:"100%", height:"auto"});
var displayed = rendition.display(0);

document.addEventListener('keyup', e => {
  if(e.key == 'ArrowRight'){
      console.log('Right');
      rendition.next();
  }
  else if(e.key == 'ArrowLeft'){
      console.log('Left');
      rendition.prev();
  }
});
