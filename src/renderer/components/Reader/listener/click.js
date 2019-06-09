/**
 * Thanks to Xyfir
 * https://github.com/Xyfir/xyfir-reader
 */

/**
 * Listen for clicks and convert them to actions based on the location of the
 * click on the page.
 * @param {Document} document - The document to add event listeners to.
 * @param {Object} rendition - EPUBJS rendition 
 * @param {function} fn - The listener function.
 */

export default function mouseListener(document, rendition, fn) {
  
  document.addEventListener('click', event => {
    if (event.ignore) return;
    event.ignore = true;
    
    // User selected text
    if (document.getSelection().toString()) return;

    // Get book iframe window's size
    const wX = document.body.clientWidth;
    // const wY = document.body.clientHeight;

    // Get click location
    const cX = event.clientX  - (rendition.manager.scrollLeft || 0);
    // const cY = event.clientY;

    // Click was in left 20% of page
    if (cX < wX * 0.2) fn('prev');
    // Click was in right 20% of page
    else if (cX > wX - wX * 0.2) fn('next');
  
  }, false);
}