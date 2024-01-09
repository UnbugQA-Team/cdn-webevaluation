
(function () {
  // Customize the message
  var scriptLoadedMessage = "Script loaded";
  var failedMessage = "Click event did not change the URL";

  // Specify the target URLs
  var targetUrl1 = "http://localhost:2222/";
  var targetUrl2 = "https://app.crowdapp.io/";

  // Function to send a message
  function sendMessage(message) {
    parent.postMessage(message, targetUrl1);
    parent.postMessage(message, targetUrl2);
  }

  // Function to send the current URL
  function sendCurrentUrl() {
    var currentUrl = document.location.href;
    sendMessage(currentUrl);
  }

  // Initialize a mutation observer to watch for DOM changes
  var observer = new MutationObserver(function (mutationsList) {
    // DOM has changed, send the current URL
    sendCurrentUrl();
  });

  // Configuration of the mutation observer
  var observerConfig = { childList: true, subtree: true };

  // Start observing the document
  observer.observe(document, observerConfig);

  // Function to handle click events
  function handleClickEvent() {
    var previousUrl = document.location.href;

    // Delay sending the URL to check if the click event changes the URL
    setTimeout(function () {
      if (previousUrl === document.location.href) {
        // Click event did not change the URL, so send the "failed" message
        sendMessage(failedMessage);
      } else {
        // Click event changed the URL, so send the current URL
        sendCurrentUrl();
      }
    }, 0);
  }

  // Add a click event listener
  document.body.addEventListener("click", handleClickEvent);

  // Initial call to send the current URL when the script is loaded
  sendMessage(scriptLoadedMessage);
})();

    
