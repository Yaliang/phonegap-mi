/* This variable keeps track of the location hash of current page.
 */
var currLocationHash = "#page-loading";

/* This variable indicates whether the "pullNotification" function is running or not.
 */
var pullNotificationRunning = false;

/* This function sets the location hash of current page to the variable "currLocationHash";
 *  remember doing this whenever the location hash changes.
 */
function setCurrLocationHash(locationHash){
    currLocationHash = locationHash;
}

/* This object is a class to handle custom touch event
 * create by Yaliang, 4/27/2015
 */
touch = {
    touchInitialize: function(selector) {
        this.selector = selector;
        $(this.selector).stop();
        this.stop = true;
        $(this.selector).unbind("touchstart").bind("touchstart", function(event){
            touch.touchStartEventHandler(event);
        });
        $(this.selector).unbind("touchmove").bind("touchmove", function(event){
            touch.touchMoveEventHandler(event);
        });
        $(this.selector).unbind("touchend").bind("touchend", function(event){
            touch.touchEndEventHandler(event);
        })
    },
    touchStartEventHandler: function(event) {
        $(this.selector).stop();
        this.stop = true;
        this.currentY = event.originalEvent.touches[0].clientY;
        this.moveStartY = this.currentY;
        this.moveStartTime = new Date;
        this.moveSlowCircle = 0;
    },
    touchMoveEventHandler: function(event) {
        event.preventDefault();
        this.lastY = this.currentY;
        this.currentY = event.originalEvent.touches[0].clientY;
        this.moveRate = (1+Math.round(Math.abs(this.currentY-this.lastY) / 10));
        if (this.moveRate > 1) {
            this.moveSlowCircle = 0;
        } else {
            this.moveSlowCircle += 1;
        }
        var newTop = $(this.selector).scrollTop() - (this.currentY-this.lastY);
        $(this.selector).scrollTop(newTop);
        // console.log(this.moveRate);
    },
    touchEndEventHandler: function(event) {
        if (this.moveSlowCircle > 5) {
            return;
        }
        this.moveEndTime = new Date;
        this.moveRate = (this.currentY-this.moveStartY) / (this.moveEndTime-this.moveStartTime) * 50;
        this.stop = false;
        this.touchEndAnimate();
    },
    touchEndAnimate: function() {
        this.moveRate = this.moveRate * 29/30;
        if (Math.abs(this.moveRate) <= 0.1) {
            return;
        }
        $(this.selector).scrollTop($(this.selector).scrollTop() - this.moveRate);
        setTimeout(function(){
            if (!touch.stop) {
                touch.touchEndAnimate();
            }
        }, 13);
        // console.log(this.moveRate);
    }
}

/* This function is designed to initialize certain elements in the document, such as attaching events handlers,
 * preventing default events, showing default display, etc.
 */
function initialElementEventSetting(){
    // instantiate the FastClick object for removing the 300ms delay in jQuery mobile
    FastClick.attach(document.body);

    // set comment and message send bar disable
    var $footerBarInputCommentContent = $("#footer-bar-input-comment-content");
    $footerBarInputCommentContent.on("blur",function(){
        // $footerBarInputCommentContent.prop("disabled", true);
        $("#footer-bar-send-comment").css("position","fixed").css("bottom","0");
        if ($footerBarInputCommentContent.val().length == 0) {
            $("#footer-bar-input-comment-content").attr("placeholder","comment...");
            $("#footer-bar-reply-to-id-label").html("");
        }
    });

    var $footerBarInputMessageContent = $("#footer-bar-input-message-content");
    $footerBarInputMessageContent.on("blur",function(){
        // $footerBarInputMessageContent.prop("disabled", true);
        $("#footer-bar-send-message").css("position","fixed").css("bottom","0");
    });

    // $footerBarInputCommentContent.prop("disabled", true);
    // $footerBarInputMessageContent.prop("disabled", true);

    $("#footer-bar-form-message-chat").submit(function(event){
        event.preventDefault();
    });

    $("#footer-bar-form-comment").submit(function(event){
        event.preventDefault();
    });

    $("#body-input-edit-profile-photo").on("blur change",function(){
        profilePhotoCrop();
    });

    $("#body-form-confirm-password").submit(function(event) {
        event.preventDefault();
    });

    $("#body-form-set-new-password").submit(function(event) {
        event.preventDefault();
    });

    $("#body-input-set-new-password").focusout(function(){
        if ($(this).val().length < 6){
            var errorMessage = "Password should be at least 6 characters. Please reenter password.";
            $("#body-set-new-password-error").html(errorMessage);
        }
    });

    $("#body-form-create-event").submit(function(event) {
        event.preventDefault();
    });

    $("#body-form-login").submit(function(event){
        event.preventDefault();
    });

    $("#body-form-signup").submit(function(event){
        event.preventDefault();
    });

    $("#body-input-insert-description-photo").on("change",function(){
        insertDescriptionPreviewPhoto();
    });

    $("#body-input-create-event-description").on("keyup keypress",function(e){
        if(listenKeyup)
            deleteDescriptionPreviewPhoto(e);
    });

    $("#body-form-set-group-name").submit(function(event){
        event.preventDefault();
    });

    // check if the user has been logged in or not
    $(window).hashchange(function(){
        var preHash = currLocationHash;
        var currHash = window.location.hash;

        // in user session
        if (currHash == "#page-login" && (preHash != "#page-loading" && preHash != "#page-login" && preHash != "#page-signup")) {
            $.mobile.changePage("#page-event");
            currLocationHash = "#page-event";
        }

        // out of user session
        if (currHash == "#page-setting" && (preHash == "#page-loading" || preHash == "#page-login" || preHash == "#page-signup")) {
            $.mobile.changePage("#page-login");
            currLocationHash = "#page-login";
        }
    });

    // add function when the page #page-chat-messages completed.
    $(document).on("pageshow","#page-chat-messages",function(){
        $("#footer-bar-send-message").css("position","fixed").css("bottom","0").show();
        $("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
            duration: 500,
            complete : function(){
                $(window).on("swiperight",function(){
                    pullMyChat();
                    window.history.back();
                    setCurrLocationHash("#page-event");
                    $(window).unbind("swiperight");
                })
            }
        });
    });

    $(document).on("pagebeforehide","#page-chat-messages",function(){
        $("#footer-bar-send-message").hide();
    });

    // add function when the page #page-event-detail completed.
    $(document).on("pageshow","#page-event-detail",function(){
        $("#footer-bar-send-comment").css("position","fixed").css("bottom","0").show();
        $(window).on("swiperight",function(){
            window.history.back();
            setCurrLocationHash("#page-event");
            $(window).unbind("swiperight");
        })
    });

    $(document).on("pagebeforehide","#page-event-detail",function(){
        $("#footer-bar-send-comment").hide();
    });

    // for page-change-my-password
    $(document).on("pagebeforeshow","#page-change-my-password",function(){
        $("#body-form-confirm-password").show();
        $("#body-form-set-new-password").hide();
        $("#body-confirm-password-btn").show();
        $("#body-set-new-password-btn").hide();
        $("#body-input-old-password").val("");
        $("#body-input-set-new-password").val("");
        $("#body-input-confirm-new-password").val("");
        $("#body-confirm-password-error").html("");
        $("#body-set-new-password-error").html("");
    });

    $(document).on("pageshow","#page-change-my-password", function(){
        $("#body-input-old-password").focus();
    });

    // fix the content height(page-event)
    $(document).on("pageshow", "#page-event", function(){
        var window_height = $(window).height();
        var head_height = $("#page-event > .ui-header").outerHeight();
        var foot_height = $("#page-event > .ui-footer").outerHeight();
        $("#page-event > .ui-content").css("height",(window_height - head_height - foot_height).toString() + "px");
        touch.touchInitialize("#page-event > .ui-content");
    });

    // fix the content height(page-firend)
    $(document).on("pageshow", "#page-friend", function(){
        var window_height = $(window).height();
        var head_height = $("#page-friend > .ui-header").outerHeight();
        var foot_height = $("#page-friend > .ui-footer").outerHeight();
        $("#page-friend > .ui-content").css("height",(window_height - head_height - foot_height).toString() + "px");
        touch.touchInitialize("#page-friend > .ui-content");
    });

    // fix the content height(page-people-near-by)
    $(document).on("pageshow", "#page-people-near-by", function(){
        var window_height = $(window).height();
        var head_height = $("#page-people-near-by > .ui-header").outerHeight();
        $("#page-people-near-by > .ui-content").css("height",(window_height - head_height).toString() + "px");
        touch.touchInitialize("#page-people-near-by > .ui-content");
    });

    // fix the content height(page-people-search)
    $(document).on("pageshow", "#page-people-search", function(){
        var window_height = $(window).height();
        var head_height = $("#page-people-search > .ui-header").outerHeight();
        $("#page-people-search > .ui-content").css("height",(window_height - head_height).toString() + "px");
        touch.touchInitialize("#page-people-search > .ui-content");
    });

    // fix the content height(page-chat)
    $(document).on("pageshow", "#page-chat", function(){
        var window_height = $(window).height();
        var head_height = $("#page-chat > .ui-header").outerHeight();
        var foot_height = $("#page-chat > .ui-footer").outerHeight();
        $("#page-chat > .ui-content").css("height",(window_height - head_height - foot_height).toString() + "px");
        touch.touchInitialize("#page-chat > .ui-content");
    });

    // fix the content height(page-setting)
    $(document).on("pageshow", "#page-setting", function(){
        var window_height = $(window).height();
        var head_height = $("#page-setting > .ui-header").outerHeight();
        var foot_height = $("#page-setting > .ui-footer").outerHeight();
        $("#page-setting > .ui-content").css("height",(window_height - head_height - foot_height).toString() + "px");
        touch.touchInitialize("#page-setting > .ui-content");
    });
}

/* This function tries to log into user session by local storage
 * currentUser: object representing current user from the Parse server
 * if currentUser is valid, then the function tries to restore the user session and update the events, friend and chat info;
 * else the function will direct the user to the loading page for transition to login/sign-up pages.
 */
function loginByLocalStorage(){
    var currentUser = Parse.User.current();

    if (currentUser) {
        var successFunction = function() {
            registerNotificationId();
            setCurrLocationHash("#page-event");
            $.mobile.changePage("#page-event");
            $.mobile.loading("show");
            pullUserEvent();
            if (!pullNotificationRunning) {
                setTimeout(function(){
                    pullNotification();
                },5000);
            }
            ParsePullAllFriendObjectById(Parse.User.current().id);
            ParsePullMyChat(Parse.User.current().id,"updatedAt",function(){});
        };
        var errorFunction = function() {
            setCurrLocationHash("#page-login");
            $.mobile.changePage("#page-login");
        };

        // this function will call the Parse API to communicate with Parse server
        ParseUpdateCurrentUser(successFunction, errorFunction);

    } else {
        var window_width = $(window).width();
        var window_height = $(window).height();
        var $loadingPageImage = $(".loading-page-image");
        if (window_width/window_height > 1) {
            $loadingPageImage.append("<div class='loading-page-button-top'>Join Us.</div>");
            $(".loading-page-button-top").css("marginLeft", Math.round(($loadingPageImage.width()-93-44)/2).toString()+"px");
        } else {
            $loadingPageImage.append("<div class='loading-page-button-bottom'>Join Us.</div>");
            $(".loading-page-button-bottom").css("marginLeft", Math.round(($loadingPageImage.width()-93-44)/2).toString()+"px");
        }

        var $pageLoading = $("#page-loading");
        $pageLoading.click(function(){
            setCurrLocationHash("#page-login");
            $.mobile.changePage("#page-login");
            //$pageLoading.unbind("click");
            //$pageLoading.unbind("swiperight");
            //$pageLoading.unbind("swipeleft");
        });

        $pageLoading.on("swiperight",function(){
            setCurrLocationHash("#page-login");
            $.mobile.changePage("#page-login");
            //$pageLoading.unbind("click");
            //$pageLoading.unbind("swiperight");
            //$pageLoading.unbind("swipeleft");
        });

        $pageLoading.on("swipeleft",function(){
            setCurrLocationHash("#page-login");
            $.mobile.changePage("#page-login");
            //$pageLoading.unbind("click");
            //$pageLoading.unbind("swiperight");
            //$pageLoading.unbind("swipeleft");
        });
    }
}

/* This function is designed to check repeatedly the possible new friend requests and new chatting messages during
 * user session at a time interval of 2 seconds. If the user session is not valid, this function sets the
 * pullNotificationRunning flag to false and returns.
 */
function pullNotification(){
    var currentUser = Parse.User.current();

    if (currentUser == null){
        pullNotificationRunning = false;
        return;
    }

    pullNotificationRunning = true;

    // check new friend requests
    var displayFunction = function(objects){ // objects: Friend objects
        if ((typeof(objects)!="undefined")&&(objects.length > 0)) {
            $(".footer-navigation-bar-friend").each(function(){
                $(this).addClass("friend-notification-custom");
            });
            $("#body-new-friend-requests-btn").html("<span>New Friend Requests</span><span id='body-new-friend-requests-number' class='ui-li-friend-count'>"
                                                       +objects.length.toString()+"</span>").removeClass("ui-hidden-accessible");
            $("#page-my-friend-requests > .ui-content").removeClass("ui-hidden-accessible");
        } else {
            $(".footer-navigation-bar-friend").each(function(){
                $(this).removeClass("friend-notification-custom");
            });
            $("#body-new-friend-requests-btn").html("<span>New Friend Requests</span>");
        }
    };
    ParsePullUnreadFriendRequest(currentUser.id, displayFunction);

    // check new chatting messages
    displayFunction = function(objects){  // objects: an array of Chat objects
        if ((typeof(objects)!="undefined")&&(objects.length > 0)) {
            $(".footer-navigation-bar-chat").each(function(){
                $(this).addClass("chat-notification-custom");
            });
            if ($(":mobile-pagecontainer").pagecontainer("getActivePage")[0].id == "page-chat") {
                pullMyChat();
            }
        } else {
            $(".footer-navigation-bar-chat").each(function(){
                $(this).removeClass("chat-notification-custom");
            });
        }
        if ($(":mobile-pagecontainer").pagecontainer("getActivePage")[0].id == "page-chat-messages") {
            var groupId = $("#footer-bar-group-id-label").html();
            for (var i=0; i<objects.length; i++) {
                if (groupId == objects[i].get("groupId")) {
                    updateChatMessage(objects[i]);
                }
            }
        }
    };
    ParsePullUnreadChat(currentUser.id, "updatedAt", displayFunction);

    // auto redirect if stop at loading page
    if ($(":mobile-pagecontainer").pagecontainer("getActivePage")[0].id == "page-loading") {
        loginByLocalStorage();
    }

    if (pullNotificationEnable == true) {
        setTimeout(function(){
            pullNotification();
        }, 2000);
    } else {
        pullNotificationRunning = false;
    }
}

/* This function is designed to sign up new users with username, email and password. If successful, it will login and
 * direct the user to the "Activities" page and send a verification email to the user email account.
 */
function signup(){
    var name = $("#body-input-signup-name").val();
    var email = $("#body-input-signup-email").val();
    var password = $("#body-input-signup-password").val();
    var errorObject = $("#body-signup-error");
    var destID = "#page-event";
    var customFunction = function(object){
        registerNotificationId();
        $("#body-input-signup-password").val("");
        pullUserEvent();
        if (!pullNotificationRunning) {
            pullNotification();
        }
        ParseCreateProfilePhotoObject(object.id);
        sendVerifyEmail(object);
    };

    // this shows the default JQuery loading icon (spinning arrow)
    $.mobile.loading("show");

    // this function will communicate with the Parse server to sign up new users
    ParseSignup(email, password, email, name, errorObject, destID, customFunction);
}

/* This function sends a verification email to the user email account provided at sign-up phase.
 */
function sendVerifyEmail(object){
    var request="email="+object.get('email');
    request +="&username="+object.get('name');
    request +="&verifyLink=http://yuemeuni.tk/verify.html?id="+object.id;
    $.post("https://yueme-push-server.herokuapp.com/varifyEmail",request).done(function(data) {
        console.log(data);
    });
}

/* This function is designed to login the user by email and password. If successful, it will login and
 * direct the user to the "Activities" page.
 */
function login(){
    cacheInitialization();
    var email = $("#body-input-login-email").val();
    var password = $("#body-input-login-password").val();
    var errorObject = $("#body-login-error");
    var destID = "#page-event";
    var customFunction = function(){
        registerNotificationId();
        $("#body-input-login-password").val("");
        pullUserEvent();
        if (!pullNotificationRunning) {
            pullNotification();
        }
        ParsePullAllFriendObjectById(Parse.User.current().id);
        ParsePullMyChat(Parse.User.current().id,"updatedAt",function(){});
    };

    $.mobile.loading("show");

    // this function will communicate with the Parse server to login the user
    ParseLogin(email, password, errorObject, destID, customFunction);
}

/* This function is designed to logout and end the user session. If successful, it will direct the user
 * to the login page.
 */
function logout(){
    var currentUser = Parse.User.current();
    var email = currentUser.getUsername();
    ParseRemoveCurrentBridgeitId();
    $("#body-input-login-email").val(email);
    $("#body-login-error").html("");
    $("#body-signup-error").html("");
    localStorage.clear();
    cacheClear();
    $("#page-chat > .ui-content").html("");
    var destID = "#page-login";
    ParseLogout(destID);
    unregisterNotificationId();
}

/* This function is designed to convert ISO time to relative time.
 * It's used to show the time a user was active in the past from now.
 */
function convertTime(rawTime){
    var minutes = 1000 * 60;
    var hours = minutes * 60;
    var days = hours * 24;
    var months = days * 30;
    var years = days * 365;
    var currentTime = new Date();
    var time = currentTime.getTime() - Date.parse(rawTime.toString());
    time = Math.max(time, 0);

    var y = Math.floor(time / years);
    time = time - years * y;

    var mon = Math.floor(time / months);
    time = time - months * mon;

    var d = Math.floor(time / days);
    time = time - days * d;

    var h = Math.floor(time / hours);
    time = time - hours * h;

    var m = Math.floor(time / minutes);

    var showtime = "";

    if (y > 0) {
        showtime = y.toString() + (y > 1 ? " years ago" : " year ago");
        //showtime = y.toString()+"y";
    }  else if (mon > 0) {
        showtime = mon.toString()+ (mon > 1 ? " months ago" : " month ago");
        //showtime = d.toString()+"d";
    }else if (d > 0) {
        showtime = d.toString()+ (d > 1 ? " days ago" : " day ago");
        //showtime = d.toString()+"d";
    }  else if (h > 0) {
        showtime = h.toString()+ (h > 1 ? " hours ago" : " hour ago");
        //showtime = h.toString()+"hour";
    } else if (m > 0) {
        showtime = m.toString()+(m > 1 ? " mins ago" : " min ago");
        //showtime = m.toString()+"m";
    } else {
        showtime = "just now";
        //showtime = "now";
    }
    return showtime;
}

/* This variable is used to get the day of the week. It should be regarded as constant
 * so do not modify its value.
 */
var DAYOFWEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* This function is designed to convert ISO time format to month/date/year format.
 * It's used to show the time a user was active in the past from now.
 */
function convertTimeFormat(rawTime) {
    var time = new Date(rawTime);  // the date corresponding to rawTime
    var year = time.getFullYear();
    var month = time.getMonth();
    var date = time.getDate();
    var hour = time.getHours();
    var minute = time.getMinutes();
    var day = time.getDay();

    var currTime = new Date();    // the date of today
    var currYear = currTime.getFullYear();
    var currMonth = currTime.getMonth();
    var currDate = currTime.getDate();

    var currStartTime = new Date(currYear, currMonth, currDate, 0, 0, 0, 0);  // starting time of today

    var showTime = "";

    var difference = currStartTime.getTime() - time.getTime();  // in milliseconds
    var oneDay = 24 * 60 * 60 * 1000;  // in milliseconds

    if (difference <= 0) {
        showTime = (hour < 10 ? "0" + hour : hour) + ":" + (minute < 10 ? "0" + minute : minute);
    } else if (Math.floor(difference / oneDay) <= 1) {
        showTime = "Yesterday";
    }  else if (Math.floor(difference / oneDay) <= 3) {
        showTime = DAYOFWEEK[day];
    } else {
        showTime = (month + 1) + "/" + date + "/" + (year % 2000);
    }

    return showTime;
}

/* This function is designed to convert ISO time format to
 * weekday | month | date | year | hour: minute format.
 * It's mainly used in the chat message to show when the message
 * was sent.
 */
function convertTimeFormatToHourMinute(time) {
    var hour = time.getHours();
    var minute = time.getMinutes();
    var day = time.getDay();

    var currTime = new Date();    // the date of today
    var currYear = currTime.getFullYear();
    var currMonth = currTime.getMonth();
    var currDate = currTime.getDate();

    var currStartTime = new Date(currYear, currMonth, currDate, 0, 0, 0, 0);  // starting time of today

    var showTime = "";

    var difference = currStartTime.getTime() - time.getTime();  // in milliseconds
    var oneDay = 24 * 60 * 60 * 1000;  // in milliseconds

    var hourAndMinute = (hour < 10 ? "0" + hour : hour) + ":" + (minute < 10 ? "0" + minute : minute);
    if (difference <= 0) {
        showTime = hourAndMinute;
    } else if (Math.floor(difference / oneDay) <= 1) {
        showTime = "Yesterday " + hourAndMinute;
    }  else if (Math.floor(difference / oneDay) <= 3) {
        showTime = DAYOFWEEK[day] + " " + hourAndMinute;
    } else {
        showTime = time.toDateString() + " " + hourAndMinute;
    }

    return showTime;
}

/* This function is designed to ...
 */
function sendToolbarActiveKeyboard(object){
    $("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
        duration: 300,
        complete : function(){
            $(object.bar).css("position","absolute");
            $(object.bar).css("bottom",($("body").height() - $(object.base).height()+object.bias).toString()+"px");
            // $(object.id).prop("disabled", false);
            $(object.id).trigger("focus");
        }
    });
}

/* This function is designed to send notifications to users' devices
 */
function pushNotificationToDevice(platform,regId,message) {
    var request="id="+regId+"&message="+message;
    $.post("https://yueme-push-server.herokuapp.com/"+platform,request).done(function(data) {
    });
}

/* This function is designed to send notifications to users' devices by user name
 */
function pushNotificationToDeviceByUsername(username, message) {
    // fetch user information
    CacheGetProfileByUsername(username, function(obj,data){
        // push notification
        var regId;
        if (typeof(obj.get("GCMId")) != "undefined") {
            regId = obj.get("GCMId");
            pushNotificationToDevice("gcm",regId, data.message);
        }
        if (typeof(obj.get("APNId")) != "undefined") {
            regId = obj.get("APNId");
            pushNotificationToDevice("apn",regId, data.message);
        }
    }, {message: message});
}

/* This function is designed to send notifications to users' devices by user Id
 */
function pushNotificationToDeviceByUserId(userid, message) {
    // fetch user information
    CacheGetProfileByUserId(userid, function(obj,data){
        // push notification
        var regId;
        if (typeof(obj.get("GCMId")) != "undefined") {
            regId = obj.get("GCMId");
            pushNotificationToDevice("gcm",regId, data.message);
        }
        if (typeof(obj.get("APNId")) != "undefined") {
            regId = obj.get("APNId");
            pushNotificationToDevice("apn",regId, data.message);
        }
    }, {message: message});
}