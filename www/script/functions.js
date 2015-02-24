var currLocationHash = "#page-loading"; // the location hash for current page

function setCurrLocationHash(locationHash){
    currLocationHash = locationHash;
}

function loginByLocalStorage(){
	var currentUser = Parse.User.current();
	if (currentUser) {
		var successFunction = function() {
			registerNotificationId();
            setCurrLocationHash('#page-event');
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
            setCurrLocationHash('#page-login');
			$.mobile.changePage("#page-login"); // window.location.hash = "#page-login";
		};
		ParseUpdateCurrentUser(successFunction, errorFunction);
	} else {
		//window.location.hash = "#page-login";
		var window_width = $(window).width();
		var window_height = $(window).height();
		if (window_width/window_height > 1) {
			$('.loading-page-image').append("<div class='loading-page-button-top'>Join Us.</div>");
			$('.loading-page-button-top').css("marginLeft", Math.round(($(".loading-page-image").width()-93-44)/2).toString()+"px");
		} else {
			$('.loading-page-image').append("<div class='loading-page-button-bottom'>Join Us.</div>");			
			$('.loading-page-button-bottom').css("marginLeft", Math.round(($(".loading-page-image").width()-93-44)/2).toString()+"px");
		}
		$('#page-loading').click(function(){
            setCurrLocationHash('#page-login');
			$.mobile.changePage("#page-login"); //window.location.hash = "page-login";
			$('#page-loading').unbind("click");
			$('#page-loading').unbind("swiperight");
			$('#page-loading').unbind("swipeleft");
		});
		$('#page-loading').on('swiperight',function(){
            setCurrLocationHash('#page-login');
			$.mobile.changePage("#page-login"); //window.location.hash = "page-login";
			$('#page-loading').unbind("click");
			$('#page-loading').unbind("swiperight");
			$('#page-loading').unbind("swipeleft");
		});
		$('#page-loading').on('swipeleft',function(){
            setCurrLocationHash('#page-login');
			$.mobile.changePage("#page-login"); //window.location.hash = "page-login";
			$('#page-loading').unbind("click");
			$('#page-loading').unbind("swiperight");
			$('#page-loading').unbind("swipeleft");
		});
	}
}

var pullNotificationRunning = false;
function pullNotification(){
	var currentUser = Parse.User.current();
	pullNotificationRunning = true;

	if (currentUser == null){
		pullNotificationRunning = false
		return
	}
	// check new friend request
	var displayFunction = function(objects){
		if ((typeof(objects)!="undefined")&&(objects.length > 0)) {
			jQuery("[id=friend]") .each(function(){
				$(this).addClass("friend-notification-custom");
			});
			$('#new-friend-requests-btn').html("<span>New Friend Requests</span><span id='new-friend-requests-number' class='ui-li-count'>"+objects.length.toString()+"</span>");
		} else {
			jQuery("[id=friend]") .each(function(){
				$(this).removeClass("friend-notification-custom");
			});
			$('#new-friend-requests-btn').html("<span>New Friend Requests</span>");
		}
	};
	ParsePullUnreadFriendRequest(currentUser.id, displayFunction);

	var displayFunction = function(objects){
		if ((typeof(objects)!="undefined")&&(objects.length > 0)) {
			jQuery("[id=chat]") .each(function(){
				$(this).addClass("chat-notification-custom");
			});
			if ($( ":mobile-pagecontainer" ).pagecontainer( "getActivePage" )[0].id == "page-chat") {
				pullMyChat();
			}
		} else {
			jQuery("[id=chat]") .each(function(){
				$(this).removeClass("chat-notification-custom");
			});
		}
		if ($( ":mobile-pagecontainer" ).pagecontainer( "getActivePage" )[0].id == "page-chat-messages") {
			var groupId = $("#group-id-label").html();
			for (var i=0; i<objects.length; i++) {
				if (groupId == objects[i].get("groupId")) {
					updateChatMessage(objects[i]);
				}
			}
		}
	};

	// if ($( ":mobile-pagecontainer" ).pagecontainer( "getActivePage" )[0].id == "page-chat") {
	// 	pullMyChat();
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
	var name = $("#signup-name").val();
	var email = $("#signup-email").val();
	var password = $("#signup-password").val();
	var errorObject = $("#signup-error");
	var destID = "#page-event";
	var customFunction = function(object){
		registerNotificationId();
		$("#signup-password").val("");
		pullUserEvent();
		if (!pullNotificationRunning) {
			pullNotification();
		}
		ParseCreateProfilePhotoObject(object.id);
	};
    $.mobile.loading("show");
	ParseSignup(email, password, email, name, errorObject, destID, customFunction);
}

function login(){
	cacheInitialization();
	var email = $("#login-email").val();
	var password = $("#login-password").val();
	var errorObject = $("#login-error");
	var destID = "#page-event";
	var customFunction = function(){
		registerNotificationId();
		$("#login-password").val("");
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
	$("#login-email").val(email);
	$("#login-error").html("");
	$("#signup-error").html("");
	localStorage.clear();
	cacheClear();
	$("#page-chat > .ui-content").html("");
	var destID = "#page-login";
	ParseLogout(destID);
	unregisterNotificationId();
}

function initialElementEventSetting(){
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
		// 	id:'#message-content',
		// 	bar:'#send-message-bar',
		// 	base:'#page-chat-messages'
		// });
		event.preventDefault();
	});
	$('#comment-form').submit(function(event){
		// sendToolbarActiveKeyboard({
		// 	id:'#comment-content',
		// 	bar:'#send-comment-bar',
		// 	base:'#page-event-detail'
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
	        	$("#send-message-bar").show();
	        	$(window).on("swiperight",function(){
					window.history.back();
					setCurrLocationHash('#page-event');
					$(window).unbind("swiperight");
				})
	        }
	    });
	});
	$(document).on("pagebeforehide","#page-chat-messages",function(){
		$("#send-message-bar").hide();
	});
	// add function when the page #page-event-detail completed.
    $(document).on("pageshow","#page-event-detail",function(){
		$("#send-comment-bar").css("position","fixed");
		$("#send-comment-bar").css("bottom","0");
		$("#send-comment-bar").show();
		$(window).on("swiperight",function(){
			window.history.back();
			setCurrLocationHash('#page-event');
			$(window).unbind("swiperight");
		})
	});
	$(document).on("pagebeforehide","#page-event-detail",function(){
		$("#send-comment-bar").hide();
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
		showtime = y.toString()+" years ago";
	} else if (y > 0) {
		showtime = y.toString()+" year ago";
	} else if (d > 1) {
		showtime = d.toString()+" days ago";
	} else if (d > 0) {
		showtime = d.toString()+" day ago";
	} else if (h > 1) {
		showtime = h.toString()+" hours ago";
	} else if (h > 0) {
		showtime = h.toString()+" hour ago";
	} else if (m > 1) {
		showtime = m.toString()+" minutes ago";
	} else if (m > 0) {
		showtime = m.toString()+" minute ago";
	} else {
		showtime = "just now";
	}
	return showtime
}

function sendToolbarActiveKeyboard(object){
	$("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
		duration: 300,
        complete : function(){
	    	$(object.id).prop('disabled', false);
			// $(window).scroll(function(){
			// 	$(object.id).trigger("blur");
			// 	console.log("scroll happen");
			// });
			$(object.bar).css("position","absolute");
			$(object.bar).css("bottom",($("body").height()-$(object.base).height()-44).toString()+"px");
			
			$(object.id).trigger("focus");
        }
    });
}

function pushNotificationToDevice(platform,regId,message) {
	var request="id="+regId+"&message="+message;//{id: regId, message: message};
	//console.log(request);
	$.post("https://yueme-push-server.herokuapp.com/"+platform,request)
		.done(function(data) {
			//console.log(data);
		});
}