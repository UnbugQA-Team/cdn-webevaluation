(function (e, o) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = o();
    } else if (typeof define === 'function' && define.amd) {
        define([], o);
    } else if (typeof exports === 'object') {
        exports.$ = o();
    } else {
        e.$ = o();
    }
})(self, function () {
    return function () {
        window.onload = function () {
            // Send a message when the script is loaded
            var scriptLoadedMessage = "Script loaded"; // Customize the message
            parent.postMessage(scriptLoadedMessage, "http://localhost:2222/");

            var e = document.location.href,
                o = document.querySelector("body");
            new MutationObserver(function (o) {
                if (e !== document.location.href) {
                    e = document.location.href;
                    var t = JSON.parse(JSON.stringify(e));
                    parent.postMessage(t, "http://localhost:2222/");
                }
            }).observe(o, { childList: true, subtree: true });
        };
    };
});
