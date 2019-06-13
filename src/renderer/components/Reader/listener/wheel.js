
/**
* Listen for wheel and convert them to next or prev action based on direction.
* @param {HTMLElement} el - The element to add event listeners to.
* @param {function} fn - The listener function.
*/

export default function wheelListener(el, fn) {

	// Required min distance traveled to be considered swipe
	const threshold = 750;
	// Maximum time allowed to travel that distance
	const allowedTime = 50;

	let dist = 0;
	let isScrolling;

	el.addEventListener('wheel', e => {
		if (e.ignore) return;
		e.ignore = true;

		clearTimeout(isScrolling);
		
		dist += e.deltaY;


		isScrolling = setTimeout(() => {
			if (Math.abs(dist) >= threshold) {

				// If wheel scrolled down it indicates left
				let direction = Math.sign(dist) > 0 ? 'next' : 'prev';
				fn(direction);
				dist = 0;
			}
			
			dist = 0;
		}, allowedTime);

	});

}
