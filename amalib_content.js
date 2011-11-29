/* content script */
chrome.extension.sendRequest({asin: document.getElementById("ASIN").value}, function(response) { });
