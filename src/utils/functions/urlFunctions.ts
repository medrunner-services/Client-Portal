export function clearURLParams() {
	const url = new URL(window.location.href);
	url.search = "";
	window.history.replaceState({}, document.title, url.toString());
}
