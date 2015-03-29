var currLocationHash = "#page-loading"; // the location hash for current page

function setCurrLocationHash(locationHash){
    currLocationHash = locationHash;
}

function loginByLocalStorage(){
    var currentUser = Parse.User.current();
    if (currentUser) {
        var successFunction = function() {
            registerNotificationId();
            setCurrLocationHash("#page-event");
            $.mobile.changePage("#page-event"); // window.location.hash = "#page-event";
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
            $.mobile.changePage("#page-login"); // window.location.hash = "#page-login";
        };
        ParseUpdateCurrentUser(successFunction, errorFunction);
    } else {
        //window.location.hash = "#page-login";
        var window_width = $(window).width();
        var window_height = $(window).height();
        if (window_width/window_height > 1) {
            $(".loading-page-image").append("<div class='loading-page-button-top'>Join Us.</div>");
            $(".loading-page-button-top").css("marginLeft", Math.round(($(".loading-page-image").width()-93-44)/2).toString()+"px");
        } else {
            $(".loading-page-image").append("<div class='loading-page-button-bottom'>Join Us.</div>");            
            $(".loading-page-button-bottom").css("marginLeft", Math.round(($(".loading-page-image").width()-93-44)/2).toString()+"px");
        }
        $("#page-loading").click(function(){
            setCurrLocationHash("#page-login");
            $.mobile.changePage("#page-login"); //window.location.hash = "page-login";
            $("#page-loading").unbind("click");
            $("#page-loading").unbind("swiperight");
            $("#page-loading").unbind("swipeleft");
        });
        $("#page-loading").on("swiperight",function(){
            setCurrLocationHash("#page-login");
            $.mobile.changePage("#page-login"); //window.location.hash = "page-login";
            $("#page-loading").unbind("click");
            $("#page-loading").unbind("swiperight");
            $("#page-loading").unbind("swipeleft");
        });
        $("#page-loading").on("swipeleft",function(){
            setCurrLocationHash("#page-login");
            $.mobile.changePage("#page-login"); //window.location.hash = "page-login";
            $("#page-loading").unbind("click");
            $("#page-loading").unbind("swiperight");
            $("#page-loading").unbind("swipeleft");
        });
    }
}

var pullNotificationRunning = false;

function pullNotification(){
    var currentUser = Parse.User.current();
    pullNotificationRunning = true;

    if (currentUser == null){
        pullNotificationRunning = false;
        return
    }
    // check new friend request
    var displayFunction = function(objects){
        if ((typeof(objects)!="undefined")&&(objects.length > 0)) {
            $(".footer-navigation-bar-friend").each(function(){
                $(this).addClass("friend-notification-custom");
            });
            $("#body-new-friend-requests-btn").html("<span>New Friend Requests</span><span id='body-new-friend-requests-number' class='ui-li-count'>"+objects.length.toString()+"</span>");
        } else {
            $(".footer-navigation-bar-friend").each(function(){
                $(this).removeClass("friend-notification-custom");
            });
            $("#body-new-friend-requests-btn").html("<span>New Friend Requests</span>");
        }
    };
    ParsePullUnreadFriendRequest(currentUser.id, displayFunction);

    var displayFunction = function(objects){
        if ((typeof(objects)!="undefined")&&(objects.length > 0)) {
            $(".footer-navigation-bar-chat").each(function(){
                $(this).addClass("chat-notification-custom");
            });
            if ($( ":mobile-pagecontainer" ).pagecontainer( "getActivePage" )[0].id == "page-chat") {
                pullMyChat();
            }
        } else {
            $(".footer-navigation-bar-chat").each(function(){
                $(this).removeClass("chat-notification-custom");
            });
        }
        if ($( ":mobile-pagecontainer" ).pagecontainer( "getActivePage" )[0].id == "page-chat-messages") {
            var groupId = $("#footer-bar-group-id-label").html();
            for (var i=0; i<objects.length; i++) {
                if (groupId == objects[i].get("groupId")) {
                    updateChatMessage(objects[i]);
                }
            }
        }
    };

    // if ($( ":mobile-pagecontainer" ).pagecontainer( "getActivePage" )[0].id == "page-chat") {
    //     pullMyChat();
    // } else {
    ParsePullUnreadChat(currentUser.id, "updatedAt", displayFunction);
    // }

    // auto redirect if stop at loading page
    if ($( ":mobile-pagecontainer" ).pagecontainer( "getActivePage" )[0].id == "page-loading") {
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
    $.mobile.loading("show");
    ParseSignup(email, password, email, name, errorObject, destID, customFunction);
}

function sendVerifyEmail(object){
    var request="email="+object.get('email');
    request +="&username="+object.get('name');
    request +="&verifyLink=http://yuemeuni.tk/verify.html?id="+object.id;
    //{id: regId, message: message};
    $.post("https://yueme-push-server.herokuapp.com/varifyEmail",request)
        .done(function(data) {
            console.log(data);
        });
}

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
    ParseLogin(email, password, errorObject, destID, customFunction);
}

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

function initialElementEventSetting(){
    // set comment and message send bar diable
    $("#footer-bar-input-comment-content").on("blur",function(){
        $("#footer-bar-input-comment-content").prop("disabled", true);
        $("#footer-bar-send-comment").css("position","fixed");
        $("#footer-bar-send-comment").css("bottom","0");
        if ($("#footer-bar-input-comment-content").val().length == 0) {
            $("#footer-bar-input-comment-content").attr("placeholder","");
            $("#footer-bar-reply-to-id-label").html("");
        }
    });

    $("#footer-bar-input-message-content").on("blur",function(){
        $("#footer-bar-input-message-content").prop("disabled", true);
        $("#footer-bar-send-message").css("position","fixed");
        $("#footer-bar-send-message").css("bottom","0");
    });

    $("#footer-bar-input-comment-content").prop("disabled", true);
    $("#footer-bar-input-message-content").prop("disabled", true);
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
    })

    $("#body-form-set-group-name").submit(function(event){
        event.preventDefault();
    })

    // check if the user has been logged in or not
    $(window).hashchange(function(){
        var preHash = currLocationHash;
        var currHash = window.location.hash;

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
        $("#footer-bar-send-message").css("position","fixed");
        $("#footer-bar-send-message").css("bottom","0");
        $("#footer-bar-send-message").show();
        $("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
            duration: 500,
            complete : function(){
                $(window).on("swiperight",function(){
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
        $("#footer-bar-send-comment").css("position","fixed");
        $("#footer-bar-send-comment").css("bottom","0");
        $("#footer-bar-send-comment").show();
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
}

// convert ISO time format to relative time
function convertTime(rawTime){
    var minutes = 1000 * 60;
    var hours = minutes * 60;
    var days = hours * 24;
    var years = days * 365;
    var currentTime = new Date();
    var time = currentTime.getTime()-Date.parse(rawTime.toString());
    if (time < 0) {
        time = 0;
    }
    var y = Math.floor(time / years);
    time = time - years * y;
    var d = Math.floor(time / days);
    time = time - days * d;
    var h = Math.floor(time / hours);
    time = time - hours * h;
    var m = Math.floor(time / minutes);
    var showtime;
    if (y > 1) {
        //showtime = y.toString()+" years ago";
        showtime = y.toString()+"y";
    } else if (y > 0) {
        //showtime = y.toString()+" year ago";
        showtime = y.toString()+"y";
    } else if (d > 1) {
        //showtime = d.toString()+" days ago";
        showtime = d.toString()+"d";
    } else if (d > 0) {
        //showtime = d.toString()+" day ago";
        showtime = d.toString()+"d";
    } else if (h > 1) {
        //showtime = h.toString()+" hours ago";
        showtime = h.toString()+"h";
    } else if (h > 0) {
        //showtime = h.toString()+" hour ago";
        showtime = h.toString()+"h";
    } else if (m > 1) {
        //showtime = m.toString()+" minutes ago";
        showtime = m.toString()+"m";
    } else if (m > 0) {
        //showtime = m.toString()+" minute ago";
        showtime = m.toString()+"m";
    } else {
        //showtime = "just now";
        showtime = "now";
    }
    return showtime;
}

function sendToolbarActiveKeyboard(object){
    $("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
        duration: 300,
        complete : function(){
            $(object.id).prop("disabled", false);
            $(object.bar).css("position","absolute");
            $(object.bar).css("bottom",($("body").height()-$(object.base).height()+object.bias).toString()+"px");
            $(object.id).trigger("focus");
        }
    });
}

function pushNotificationToDevice(platform,regId,message) {
    var request="id="+regId+"&message="+message;//{id: regId, message: message};
    $.post("https://yueme-push-server.herokuapp.com/"+platform,request)
        .done(function(data) {

        });
}

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