//example of using a message handler from the content scripts
chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log(request);
    sendResponse({ msg: 'hello' });
  });