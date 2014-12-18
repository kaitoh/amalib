/* content script */
chrome.extension.sendRequest(
        {asin: document.getElementById("ASIN").value, 
            location: location, 
            title: document.getElementById("productTitle").textContent }, 
            function(response) { });
