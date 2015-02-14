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
        cordova.plugins.Keyboard.disableScroll(true);
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
        $('#profile-edit-photo').on('blur change',function(){
            profilePhotoCrop();
        })
        $('#message-chat-form').submit(function(event){
            if (window.navigator.standalone == true) {
                $('#message-content').trigger('blur');
            } else {
                sendToolbarActiveKeyboard('message-content');
            }
            event.preventDefault();
        });
        $('#event-create-form').submit(function(event) {
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
        $(window).hashchange(function(){
            var preHash = currLocationHash;
            var currHash = window.location.hash;
            //console.log("currHash:" + currHash);
            //console.log("preHash:" + preHash);

            // in user session
            if (currHash == "#page-login" && (preHash != "#page-loading" && preHash != "#page-login" && preHash != "#page-signup")) {
                $.mobile.changePage("#page-event"); // window.location.hash = "#page-event";
                currLocationHash = "#page-event";
            }

            // out of user session
            if (currHash == "#page-setting" && (preHash == "#page-loading" || preHash == "#page-login" || preHash == "#page-signup")) {
                $.mobile.changePage("#page-login"); // window.location.hash = "#page-login";
                currLocationHash = "#page-login";
            }
        });
        cacheInitialization();
        loginByLocalStorage();
        pushNotification = window.plugins.pushNotification;
    }

};

function onNotification(e) {
    switch(e.event) {
        case 'registered':
            if (e.regid.length > 0) {
                GCMId = e.regid;
                ParseUpdateGCMId(GCMId, function(){
                });
            }
        break;

        case 'message':
            pullNotification();
            if (e.foreground) {
            }
        break;

        case 'error':
        break;
    }
}

function successHandler (result) {}
function errorHandler (error) {}

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