// instant variable to handle pushNotification
var pushNotification;
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
        cacheInitialization();
        loginByLocalStorage();
        $("#loading-status").html("Initialized");
        pushNotification = window.plugins.pushNotification;
        $("#loading-status").html("Initialized pushNotification");
    }

};

function onNotification(e) {
    switch(e.event) {
        case 'registered':
            if (e.regid.length > 0) {
                GCMId = e.regid;
                ParseUpdateGCMId(GCMId, function(){
                    $("#loading-status").html("Initialized pushNotification </br> stored </br> regID= " + CGMId);
                    //alert("GCM registered");
                });
            }
        break;

        case 'message':
            pullNotification();
            if (e.foreground) {
                //alert(e.payload.message);
            }
        break;

        case 'error':
            $("#loading-status").html("Initialized pushNotification </br> error= " + e.msg);
        break;
    }
}

function successHandler (result) {
    $("#loading-status").html("Initialized pushNotification </br> register = " + result + ";" + CGMId);
}
function errorHandler (error) {
    $("#loading-status").html("Initialized pushNotification </br> register error = " + error);
}

function registerNotificationId(){
    if ( device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos" ){
        pushNotification.register(
            successHandler,
            errorHandler,
            {
                "senderID":"829436752622",
                "ecb":"onNotification"
            }
        );
    }
}

function unregisterNotificationId(){
    pushNotification.unregister(function(){
        //alert("unregister success");
    }, function(){
        //alert("unregister fault");
    });
}