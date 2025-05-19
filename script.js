(function () {
  // Customize the messages
  var scriptLoadedMessage = "Script loaded";
  var failedMessage = "Click event did not change the URL";
  var events = []; // Array to store events
  var recorder; // Declare the recorder variable
  
  // Specify the target URLs
  var targetUrls = [
    "http://localhost:2222/",
    "https://app.crowdapp.io/",
    "https://version2.crowdapp.io/"
  ];
  
  // Function to send a message to all target URLs
  function sendMessage(message) {
    for (var i = 0; i < targetUrls.length; i++) {
      try {
        parent.postMessage(message, targetUrls[i]);
      } catch (e) {
        console.error("Error sending message to " + targetUrls[i], e);
      }
    }
  }
  
  // Function to send the current URL
  function sendCurrentUrl() {
    var currentUrl = document.location.href;
    sendMessage({ type: "navigation", url: currentUrl });
  }
  
  // Check if rrweb is available and define a function to load it if it's not
  function ensureRrwebLoaded(callback) {
    if (typeof rrweb !== 'undefined') {
      callback();
      return;
    }
    
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js';
    script.onload = callback;
    script.onerror = function() {
      console.error("Failed to load rrweb library");
    };
    document.head.appendChild(script);
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
    // Increased timeout to better detect SPA navigation
    setTimeout(function () {
      if (previousUrl === document.location.href) {
        // Click event did not change the URL, so send the "failed" message
        sendMessage({ type: "click_no_nav", message: failedMessage });
      } else {
        // Click event changed the URL, so send the current URL
        sendCurrentUrl();
      }
    }, 100); // Increased from 0 to 100ms for better SPA detection
  }
  
  // Add a click event listener
  document.addEventListener("click", handleClickEvent, true);
  
  // Define a function to check the origin and record events if it matches
  const startRecording = function() {
    // Check if current page is being loaded from one of our target URLs
    const isAllowedReferrer = targetUrls.some(url => document.referrer.startsWith(url));
    
    // Also check if we're in an iframe, which is likely if we're using parent.postMessage
    const isInIframe = window.self !== window.top;
    
    if (isAllowedReferrer || isInIframe) {
      ensureRrwebLoaded(function() {
        try {
          if (recorder) {
            // Stop any existing recording
            recorder();
          }
          
          // Clear existing events
          events = [];
          
          // Start recording
          recorder = rrweb.record({
            emit(event) {
              events.push(event); // Collect events in the array
              
              // Send every 50 events to avoid large payloads
              if (events.length % 50 === 0) {
                sendEventsToTargets();
              }
            },
            recordCanvas: true,
            recordCrossOriginIframes: true,
          });
          
          console.log("Recording started");
          sendMessage({ type: "recording_started" });
        } catch (e) {
          console.error("Error starting recording:", e);
          sendMessage({ type: "recording_error", error: e.message });
        }
      });
    }
  };
  
  // Function to send the entire array of events
  function sendEventsToTargets() {
    if (events.length === 0) return;
    
    // Clone the events array to avoid mutation during sending
    const eventsToSend = [...events];
    
    // Send to all target URLs
    for (var i = 0; i < targetUrls.length; i++) {
      try {
        parent.postMessage({ 
          type: "rrweb_events", 
          events: eventsToSend,
          timestamp: Date.now(),
          url: document.location.href
        }, targetUrls[i]);
      } catch (e) {
        console.error("Error sending events to " + targetUrls[i], e);
      }
    }
  }
  
  // Set up periodic sending of events (every 5 seconds)
  setInterval(sendEventsToTargets, 5000);
  
  // Set up cleanup function
  function cleanup() {
    if (recorder) {
      recorder(); // Stop recording
      recorder = null;
    }
    
    observer.disconnect(); // Stop the mutation observer
    document.removeEventListener("click", handleClickEvent, true);
    
    // Send final events
    sendEventsToTargets();
    
    sendMessage({ type: "cleanup_complete" });
  }
  
  // Clean up when the page is unloaded
  window.addEventListener("beforeunload", cleanup);
  
  // Initial call to send the current URL when the script is loaded
  sendMessage({ type: "script_loaded", message: scriptLoadedMessage });
  
  // Start recording
  startRecording();
  
})();
