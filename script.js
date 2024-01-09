 
      (function () {
        // Customize the message
        var scriptLoadedMessage = "Script loaded";
        var failedMessage = "Click event did not change the URL";
        var events = []; // Array to store events

        // Specify the target URLs
        var targetUrl1 = "http://localhost:2222/";
        var targetUrl2 = "https://staging.crowdapp.io/";

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

        // Define a function to check the origin and record events if it matches
        const recordScreen = () => {
          const allowedOrigin = "http://localhost:2222/"; // Replace with your allowed origin

          if (document.referrer.startsWith(allowedOrigin)) {
            recorder = rrweb.record({
              emit(event) {
                events.push(event); // Collect events in the array
              },
              recordCanvas: true,
              recordCrossOriginIframes: true,
            });
          }
        };

        // Call the recordScreen function
        recordScreen();

        // Function to send the entire array of events
        function sendEventsToOtherWebsite() {
          parent.postMessage(events, "http://localhost:2222/"); // Replace with the target website's URL
        }

        // Call this function when you want to send the events
        sendEventsToOtherWebsite();
      })();
    
