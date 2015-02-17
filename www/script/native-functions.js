// instant variable to handle pushNotification
var pushNotification;
var pullNotificationEnable = true;
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
        // set comment and message send bar diable
        $('#comment-content').on("blur",function(){
            $('#comment-content').prop('disabled', true);
            $('#send-comment-bar').css("position",'fixed');
            $('#send-comment-bar').css("bottom","0");
        });
        $('#message-content').on("blur",function(){
            $('#message-content').prop('disabled', true);
            $('#send-message-bar').css("position",'fixed');
            $('#send-message-bar').css("bottom","0");
        });
        $('#comment-content').prop('disabled', true);
        $('#message-content').prop('disabled', true);
        $('#message-chat-form').submit(function(event){
            // sendToolbarActiveKeyboard({
            //  id:'#message-content',
            //  bar:'#send-message-bar',
            //  base:'#page-chat-messages'
            // });
            event.preventDefault();
        });
        $('#comment-form').submit(function(event){
            // sendToolbarActiveKeyboard({
            //  id:'#comment-content',
            //  bar:'#send-comment-bar',
            //  base:'#page-event-detail'
            // });
            event.preventDefault();
        });
        // finish

        $('#profile-edit-photo').on('blur change',function(){
            profilePhotoCrop();
        })


        $('#event-create-form').submit(function(event) {
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
        // add function when the page #page-chat-messages completed.
        $(document).on("pageshow","#page-chat-messages",function(){
            $("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
                duration: 500,
                complete : function(){
                    $("#send-message-bar").css("position","fixed");
                    $("#send-message-bar").css("bottom","0");
                    $("#send-message-bar").fadeIn("fast");
                }
            });
        });
        $(document).on("pagehide","#page-chat-messages",function(){
            console.log("scroll:remove");
            $(window).unbind("scroll");
            console.log("resize:remove");
            $(window).unbind("resize");
        });
        cacheInitialization();
        loginByLocalStorage();
        // set up push notification
        pushNotification = window.plugins.pushNotification;
        // add update button
        $(".ui-custom-log-out").before("<a href='https://build.phonegap.com/apps/1239477/install' class='ui-btn'>Update</a>");
    }

};

// Android
function onNotification(e) {
    switch(e.event) {
        case 'registered':
            if (e.regid.length > 0) {
                pullNotificationEnable == false;
                ParseUpdateGCMId(GCMId, function(){
                });
            }
        break;

        case 'message':
            if (!pullNotificationRunning) {
                pullNotification();
            }
            if (e.foreground) {
            }
        break;

        case 'error':
        break;
    }
}

function successHandler (result) {}
function errorHandler (error) {
    alert('error: '+error);
}

// iOS
function tokenHandler (result) {
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
    //alert('device token = ' + result);
    ParseUpdateAPNId(result, function(object){
        pullNotificationEnable == false;
        //alert('device token saved = ' + object.get("APNId"));
    });
}
function onNotificationAPN (event) {
    if ( event.alert )
    {
        if (!pullNotificationRunning) {
            pullNotification();
        }
        //navigator.notification.alert(event.alert);
    }

    if ( event.sound )
    {
        var snd = new Media(event.sound);
        snd.play();
    }

    if ( event.badge )
    {
        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }
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
    if ( device.platform == 'iOS') {
        pushNotification.register(
        tokenHandler,
        errorHandler,
        {
            "badge":"true",
            "sound":"true",
            "alert":"true",
            "ecb":"onNotificationAPN"
        });
    }
}

function unregisterNotificationId(){
    pushNotification.unregister(function(){
        //alert("unregister success");
    }, function(){
        //alert("unregister fault");
    });
}