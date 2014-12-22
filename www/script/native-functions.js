var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        var currentUser = Parse.User.current();
        $('#comment-content').on("blur",function(){
            $('#comment-content').textinput('disable');
        });
        if (currentUser) {
            var successFunction = function() {
                window.location.hash = "page-event";
                pullUserEvent();
            };
            var errorFunction = function() {
                window.location.hash = "page-login";
            };
            ParseUpdateCurrentUser(successFunction, errorFunction);
        } else {
            window.location.hash = "page-login";
        }
    }
};