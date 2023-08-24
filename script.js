// Function to send a message to the parent window
function sendMessageToParent(data) {
  parent.postMessage(data, "https://staging.crowdapp.io");
}

// Send a message to the parent window when the iframe is loaded
sendMessageToParent("Iframe loaded");

// Store the current URL
var currentHref = document.location.href;

// MutationObserver to handle URL changes
new MutationObserver(function(mutationsList) {
  var newHref = document.location.href;

  if (currentHref !== newHref) {
    currentHref = newHref;
    sendMessageToParent("URL changed: " + newHref);
  }
}).observe(document.querySelector("body"), { childList: true, subtree: true });
