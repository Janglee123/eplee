
/**
* Listen for key press
* @param {HTMLElement} el - The element to add event listeners to.
* @param {function} fn - The listener function.
*/

export default function keyListener(el, fn) {
	el.addEventListener('keyup', e => {
		
		// Right or up arrow key indicates next 
		if (e.keyCode === 39 || e.keyCode === 38) { 
			fn('next');
		}
		// left or down arrow key indicates next 
		else if (e.keyCode === 37 || e.keyCode === 40 ){ 
			fn('prev')
		}
	}, false);

}
