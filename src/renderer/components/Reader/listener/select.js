/**
 * @param {Document} document - The document object to add event
 * @param {Object} rendition - The EPUBJS rendition
 * @param {Function} fb - The listener function
 */
export default function selectListener(document, rendition, fn){ 
	
	
	document.addEventListener('mousedown', () => {
		document.getSelection().removeAllRanges();
		fn('cleared');
	});
	
	document.addEventListener('mouseup', e => {
		
		if (e.ignore) return;
		e.ignore = true;

		const selection = document.getSelection();
		const text = selection.toString(); 
		
		if (text === '') return;
		const range = selection.getRangeAt(0);
		
		const [contents] = rendition.getContents();
		const cfiRange = contents.cfiFromRange(range);
		
		const SelectionReact = range.getBoundingClientRect();
		const viewRect = rendition.manager.container.getBoundingClientRect();

		let react = {
			left: `${viewRect.x + SelectionReact.x}px`,
			top: `${viewRect.y + SelectionReact.y}px`,
			width: `${SelectionReact.width}px`,
			height: `${SelectionReact.height}px`,
		}
		fn('selected', react, text, cfiRange);
	});

}