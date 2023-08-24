!function(e,o){"object"==typeof exports&&"object"==typeof module?module.exports=o():"function"==typeof define&&define.amd?define([],o):"object"==typeof exports?exports.$=o():e.$=o()}(self,(()=>(window.onload=function(){var e=document.location.href,o=document.querySelector("body");

  // Send a message to the parent window immediately when the iframe is loaded
  var iframeLoadedMessage = "Iframe loaded"; // Change this to the desired message
  parent.postMessage(iframeLoadedMessage, "http://localhost:2222/");

  new MutationObserver((function(o){if(e!==document.location.href){e=document.location.href;var t=JSON.parse(JSON.stringify(e));parent.postMessage(t,"https://staging.crowdapp.io")}})).observe(o,{childList:!0,subtree:!0})},{})));
