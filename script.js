(function () {
  // Customize the message
  var scriptLoadedMessage = "Script loaded";
  var failedMessage = "Click event did not change the URL";

  // Specify the target URLs
  var targetUrl1 = "http://localhost:2222/";
  var targetUrl2 = "https://staging.crowdapp.io/";

  // Send a message when the script is loaded to both URLs
  parent.postMessage(scriptLoadedMessage, targetUrl1);
  parent.postMessage(scriptLoadedMessage, targetUrl2);

  // Function to send the current URL to both target URLs
  function sendCurrentUrl() {
    var currentUrl = document.location.href;
    parent.postMessage(currentUrl, targetUrl1);
    parent.postMessage(currentUrl, targetUrl2);
  }

  // Click event listener
  document.body.addEventListener("click", function () {
    var previousUrl = document.location.href;

    // Delay sending the URL to check if the click event changes the URL
    setTimeout(function () {
      if (previousUrl === document.location.href) {
        // Click event did not change the URL, so send the "failed" message
        parent.postMessage(failedMessage, targetUrl1);
        parent.postMessage(failedMessage, targetUrl2);
      } else {
        // Click event changed the URL, so send the current URL
        sendCurrentUrl();
      }
    }, 0);
  });

  // Popstate event listener for URL changes
  window.addEventListener("popstate", sendCurrentUrl);

  // Initial call to send the current URL
  sendCurrentUrl();
})();
