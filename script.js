!function(e,o){"object"==typeof exports&&"object"==typeof module?module.exports=o():"function"==typeof define&&define.amd?define([],o):"object"==typeof exports?exports.$=o():e.$=o()}(self,(()=>(window.onload=function(){
    // Send a message when the script is loaded
    var scriptLoadedMessage = "Script loaded"; // Customize the message
    parent.postMessage(scriptLoadedMessage, "http://localhost:2222/");

    var e=document.location.href,o=document.querySelector("body");
    new MutationObserver((function(o){
        if(e!==document.location.href){
            e=document.location.href;
            var t=JSON.parse(JSON.stringify(e));
            parent.postMessage(t,"http://localhost:2222/");
        }
    })).observe(o,{childList:!0,subtree:!0});
}),{})));
