// instant variable to handle pushNotification
var pushNotification;
var pullNotificationEnable = true;
var badgeNumber = 0;
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
        initialElementEventSetting();

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
        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, 0);
        // navigator.notification.alert(event.alert);
        // check new version
        if (event.alert.toString().localeCompare("New version is available.") == 0) {
            navigator.notification.confirm("Install new version? Or you can update anytime in Setting -> Update.", function(buttonIndex){
                if (buttonIndex == 1)
                    window.location.href = "https://build.phonegap.com/apps/1239477/install";
            });
        }
    }

    if ( event.sound )
    {
        var snd = new Media(event.sound);
        snd.play();
    }

    if ( event.badge )
    {
        //badgeNumber += parseInt(event.badge);
        //pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, badgeNumber);
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