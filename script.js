(function () {

  var scriptLoadedMessage = "Script loaded";
  var failedMessage = "Click event did not change the URL";
  var events = [];
  var recorder;
  

  var parentOrigin = '';
  try {
    parentOrigin = document.referrer ? new URL(document.referrer).origin : '*';
  } catch (e) {
    parentOrigin = '*';
  }
  
  var targetUrls = [
    "http://localhost:2222/",
    "https://app.crowdapp.io/",
    "https://version2.crowdapp.io/"
  ];
  
 
  function sendMessage(message, retries = 2) {
    const sendAttempt = () => {
      try {
      
        if (parentOrigin && parentOrigin !== '*') {
          parent.postMessage(message, parentOrigin);
        }
        
       
        parent.postMessage(message, '*');
        
       
        targetUrls.forEach(function(url) {
          try {
            parent.postMessage(message, url);
          } catch (e) {
           console.log(e)
          }
        });
      } catch (e) {
        if (retries > 0) {
          setTimeout(function() {
            sendMessage(message, retries - 1);
          }, 500);
        }
      }
    };
    
    sendAttempt();
  }
 
  function confirmScriptLoaded() {
    var confirmationMessage = {
      type: "script_confirmation",
      message: "Script loaded and ready",
      timestamp: Date.now(),
      url: window.location.href,
      ready: true
    };
    
 
    sendMessage(confirmationMessage);
    
   
    setTimeout(function() {
      sendMessage(confirmationMessage);
    }, 1000);
    
   
    var heartbeatCount = 0;
    var heartbeatInterval = setInterval(function() {
      if (heartbeatCount >= 5) {
        clearInterval(heartbeatInterval);
        return;
      }
      
      sendMessage({
        type: "script_heartbeat",
        message: "Script heartbeat",
        heartbeat: ++heartbeatCount,
        timestamp: Date.now(),
        url: window.location.href
      });
    }, 2000);
  }
  
 
  function sendCurrentUrl() {
    var currentUrl = document.location.href;
    sendMessage({ type: "navigation", url: currentUrl });
  }
  

  function ensureRrwebLoaded(callback) {
    if (typeof rrweb !== 'undefined') {
      callback();
      return;
    }
    
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js';
    script.onload = callback;
    script.onerror = function() {
      sendMessage({ type: "script_error", error: "Failed to load rrweb library" });
    };
    document.head.appendChild(script);
  }
  

  var observer = new MutationObserver(function (mutationsList) {
    sendCurrentUrl();
  });
  

  var observerConfig = { childList: true, subtree: true };
  

  observer.observe(document, observerConfig);
  
 
  function handleClickEvent() {
    var previousUrl = document.location.href;
    
    setTimeout(function () {
      if (previousUrl === document.location.href) {
        sendMessage({ type: "click_no_nav", message: failedMessage });
      } else {
        sendCurrentUrl();
      }
    }, 100);
  }
  

  document.addEventListener("click", handleClickEvent, true);
  

  window.addEventListener("message", function(event) {
    if (event.data && event.data.type === "detection_ping") {
    
      sendMessage({
        type: "script_confirmation",
        message: "Script responding to ping",
        timestamp: Date.now(),
        pingResponse: true
      });
    }
  });
  
 
  function startRecording() {
    var isAllowedReferrer = targetUrls.some(function(url) {
      return document.referrer.startsWith(url);
    });
    var isInIframe = window.self !== window.top;
    
    if (isAllowedReferrer || isInIframe) {
      ensureRrwebLoaded(function() {
        try {
          if (recorder) {
            recorder();
          }
          
          events = [];
          
          recorder = rrweb.record({
            emit: function(event) {
              events.push(event);
              
              if (events.length % 50 === 0) {
                sendEventsToTargets();
              }
            },
            recordCanvas: true,
            recordCrossOriginIframes: true,
          });
          
          sendMessage({ type: "recording_started" });
        } catch (e) {
          sendMessage({ type: "recording_error", error: e.message });
        }
      });
    }
  }
  

  function sendEventsToTargets() {
    if (events.length === 0) return;
    
    var eventsToSend = events.slice(); 
    
    sendMessage({ 
      type: "rrweb_events", 
      events: eventsToSend,
      timestamp: Date.now(),
      url: document.location.href
    });
  }
  
 
  setInterval(sendEventsToTargets, 5000);
  

  function cleanup() {
    if (recorder) {
      recorder();
      recorder = null;
    }
    
    observer.disconnect();
    document.removeEventListener("click", handleClickEvent, true);
    
    sendEventsToTargets();
    
    sendMessage({ type: "cleanup_complete" });
  }
  

  window.addEventListener("beforeunload", cleanup);
  
  
  function initializeScript() {
    try {
   
      sendMessage({ type: "script_loaded", message: scriptLoadedMessage });
   
      confirmScriptLoaded();
      

      startRecording();
      
    } catch (e) {
      sendMessage({
        type: "script_error",
        error: e.message,
        timestamp: Date.now()
      });
    }
  }
  

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScript);
  } else {
    initializeScript();
  }
  
  setTimeout(initializeScript, 100);
  
})();
