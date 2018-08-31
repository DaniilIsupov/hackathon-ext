$(document).ready(() => {
	chrome.extension.sendMessage({ type: 'hello' }, (response) => {
		console.log(response);
	});
});