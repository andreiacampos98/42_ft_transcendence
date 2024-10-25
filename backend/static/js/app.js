// const scrollContainer_meu = document.querySelector('.main');

// scrollContainer_meu.addEventListener('wheel', (event) => {
//     // Check if the content requires horizontal scrolling
//     const canScrollHorizontally = scrollContainer_meu.scrollWidth > scrollContainer_meu.clientWidth;
//     // Check if the content requires vertical scrolling
//     const canScrollVertically = scrollContainer_meu.scrollHeight > scrollContainer_meu.clientHeight;

//     if (canScrollHorizontally && !event.shiftKey) {
//         // If horizontal scrolling is needed and Shift is not held down, scroll horizontally
//         event.preventDefault(); // Prevent vertical scrolling
//         scrollContainer_meu.scrollLeft += event.deltaY; // Scroll horizontally by deltaY amount
//     } else if (canScrollVertically && (event.shiftKey || !canScrollHorizontally)) {
//         // If vertical scrolling is needed and Shift is held down or horizontal scrolling isn't needed
//         scrollContainer_meu.scrollTop += event.deltaY; // Scroll vertically
//     }
// });

const callback = (mutations) => {
	// console.log(mutations);
	mutations.forEach((mutation) => {
		mutation.addedNodes.forEach((node) => {
			// if (node.nodeType === 1 && !node["htmx-internal-data"]) {
				htmx.process(node);
			// }
		})
	});
};

const observer = new MutationObserver(callback);

observer.observe(document, {childList: true, subtree: true});