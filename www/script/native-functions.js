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
        if (window.navigator.standalone == true) {
            $('#comment-content').on("blur",function(){
                $('#comment-content').prop('disabled', true);
            });
            $('#message-content').on("blur",function(){
                $('#message-content').prop('disabled', true);
            });
            $('#comment-content').prop('disabled', true);
            $('#message-content').prop('disabled', true);
        }
        $('#message-chat-form').submit(function(event){
            if (window.navigator.standalone == true) {
                $('#message-content').trigger('blur');
            } else {
                sendToolbarActiveKeyboard('message-content');
            }
            event.preventDefault();
        });
        $('#comment-form').submit(function(event){
            sendToolbarActiveKeyboard('comment-content');
            if (window.navigator.standalone == true) {
                $('#comment-content').trigger('blur');
            } else {
                sendToolbarActiveKeyboard('message-content');
            }
            event.preventDefault();
        });
        $('#login-form').submit(function(event){
            event.preventDefault();
        });
        $('#signup-form').submit(function(event){
            event.preventDefault();
        });
        cacheInitialization()
        loginByLocalStorage();
    }

};