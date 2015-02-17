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

function createUserEvent(){
	var currentUser = Parse.User.current();
	var owner = currentUser.getUsername();

	var title = $("#event-create-title").val();
	var location = $("#event-create-location").val();
	var startTime = $("#event-create-startTime").val().replace("T", ' ');
    var endTime = $("#event-create-endTime").val().replace('T', ' ');

    var errorHandler = function(item) {
        $("#event-create-" + item).focus().parent().addClass("ui-custom-event-create-focus");
        if ($("#event-create-" + item + "-alert").length == 0) {
            $("#event-create-" + item).parent().after("<p id='event-create-" + item + "-alert' class='event-create-alert'>*Field required</p>");
        }

        setTimeout(function(){
            $("#event-create-" + item).focus().parent().removeClass("ui-custom-event-create-focus");
        }, 500);

        $("#event-create-" + item).change(function(){
            $("#event-create-" + item + "-alert").remove();
            $("#event-create-" + item).unbind("change");
        });
    };

    if (title.length == 0) {
        errorHandler("title");
        return;
    }

    if (location.length == 0) {
        errorHandler("location");
        return;
    }

    if (startTime.length == 0) {
        errorHandler("startTime");
        return;
    }

    if (endTime.length == 0) {
        errorHandler("endTime");
        return;
    }

    $('#event-create-button').unbind("click");

    var index1 = startTime.indexOf(":");
    var index2 = startTime.lastIndexOf(":");
    if (index1 != index2) {
        startTime = startTime.substring(0, index2);
    }

    index1 = endTime.indexOf(":");
    index2 = endTime.lastIndexOf(":");
    if (index1 != index2) {
        endTime = endTime.substring(0, index2);
    }

    var time = startTime + " -- " + endTime;

	var visibility = $("#event-create-visibility").val()=="on" ? true : false ;
	var description = $("#event-create-description").val();
	var errorObject = $("#event-error");
	var destID = "#page-event";
	var displayFunction = function(object){
		$("#event-create-title").val("");
		$("#event-create-location").val("");
		$("#event-create-start-time").val("");
		$("#event-create-end-time").val("");
		$("#event-create-description").val("");
		$("#event-create-visibility").val("on").flipswitch('refresh');
		$("#event-create-error").html("");
		//pullUserEvent();
		var id = object.id;
		var holder = object.get("owner");
		var newElement = buildUserEventElement(object);
		$("#event-content").prepend(newElement);
		// display event holder's name | not the email one
		pullUserEventHolderInfo(holder, id);
	};
	ParseEventCreate(owner, title, location, time, visibility, description, errorObject, destID, displayFunction);
}

var pullLastItem=0;

function pullUserEventHolderInfo(holder, eventId){
	var displayFunction = function(object, data) {
		var name = object.get("name");
		var gender = object.get("gender");
		var userId = object.id;
		var eventId = data.eventId;

		$("#"+eventId+"-owner-name").html(name);
		if (typeof(gender) == 'undefined') {
			//$("#"+eventId+"-owner-gender").html(gender.toString());
		} else if (gender) {
			$("#"+eventId+"-owner-gender").css("backgroundImage","url('./content/customicondesign-line-user-black/png/male-white-20.png')");
			$("#"+eventId+"-owner-gender").css("backgroundColor","#8970f1");
		} else {
			$("#"+eventId+"-owner-gender").css("backgroundImage","url('./content/customicondesign-line-user-black/png/female1-white-20.png')");
			$("#"+eventId+"-owner-gender").css("backgroundColor","#f46f75");
		}
		
		pullLastItem = pullLastItem - 1;
		if (pullLastItem == 0) {
			$("#event-content").removeClass("ui-hidden-accessible");
			$.mobile.loading("hide");
		}

		var displayFunction = function(object, data){
			var photo120 = object.get("profilePhoto120");
			if (typeof(photo120) == "undefined") {
				photo120 = "./content/png/Taylor-Swift.png";
			}
			$("#"+data.eventId+" > .custom-corners").css("backgroundImage","url('"+photo120+"')");
			pullLastItem = pullLastItem - 1;
			if (pullLastItem == 0) {
				$("#event-content").removeClass("ui-hidden-accessible");
				$.mobile.loading("hide");
			}
		};
		CacheGetProfilePhoto(userId, displayFunction, data);
	};
	CacheGetProfileByUsername(holder, displayFunction, {eventId : eventId});
	//ParseGetProfile(holder, displayFunction, eventId);
}

function buildUserEventElement(object){
	var title = object.get("title");
	var location = object.get("location");
	var time = object.get("time");
	var visibility = object.get("visibility");
	var description = object.get("description");
	var interestNumber = object.get("interestNumber");
	var commentNumber = object.get("commentNumber");
	var holder = object.get("owner");
	var id = object.id;
	var newElement = "";
	newElement = newElement + "<div id=\'"+id+"\'>";
	newElement = newElement + "<div class='custom-corners-public custom-corners'>";
	newElement = newElement + "<div class='ui-bar ui-bar-a'>";
	newElement = newElement + "<div><strong id=\'"+id+"-owner-name\'></strong></div>";
	newElement = newElement + "<div id=\'"+id+"-owner-gender\' class=\'ui-icon-custom-gender\'></div>";
	newElement = newElement + "</div>";
	newElement = newElement + "<div class='ui-body ui-body-a' style='cursor:pointer' onclick=\"$.mobile.changePage(\'#page-event-detail\');updateEventDetail('"+id+"')\">";
	newElement = newElement + "<p class='ui-custom-event-title'>" + title + "</p>";
	if (description.length == 0) {
		newElement = newElement + "<p class='ui-custom-event-description-less-margin'></br></p>";
	} else {
		newElement = newElement + "<p class='ui-custom-event-description'>" +  description.replace("\n","</br>") + "</p>";
	}
	newElement = newElement + "<p class='ui-custom-event-location'>" + location + "</p>";
	newElement = newElement + "<p class='ui-custom-event-time'>" + time + "</p>";
	newElement = newElement + "<div id='comment-statistics-"+id+"' class='event-statistics' style='clear:both'>" + commentNumber + " Comments</div><div id='interest-statistics-"+id+"' class='event-statistics'>" + interestNumber + " Interests</div>";
	newElement = newElement + "</div>";
	newElement = newElement + "<div class='ui-footer ui-bar-custom'>";
	newElement = newElement + "<div class='ui-custom-float-left'><a href='#page-event-detail' data-transition='slide' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-comment' id='comment-button-"+id+"' onclick=\"updateEventDetail('"+id+"')\">"+"Detail"+"</a></div>";
	newElement = newElement + "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-favor-false' id='interest-button-"+id+"' >"+"Interest"+"</a></div>";
	newElement = newElement + "</div>";
	newElement = newElement + "</div>";
	newElement = newElement + "</div>";

	return newElement;
}

var currentLastEvent;
function pullUserEvent(beforeAt){
	currentLastEvent = new Date;
	pullLastItem = -1;
	var limitNumber = 15;
	var descendingOrderKey = "createdAt";
	//var ascendingOrderKey = "createdAt";
	if (typeof(beforeAt) == "undefined") {
		$("#event-content").addClass("ui-hidden-accessible");
		setTimeout(function(){
			if (pullLastItem != 0) {
				$.mobile.loading("show");
			}
		},350);	
	}
	var displayFunction = function(objects){
		var currentUser = Parse.User.current();
		var owner = currentUser.getUsername();
		pullLastItem = 3 * objects.length;
		if (objects.length < limitNumber)
			$(".ui-load-more-activity").html("No More Activities");
		for (var i=0; i <= objects.length-1; i++) {
			if ($("#"+objects[i].id).length == 0) {
				if (Date.parse(currentLastEvent) > Date.parse(objects[i].createdAt))
					currentLastEvent = objects[i].createdAt
				var id = objects[i].id;
				var holder = objects[i].get("owner");
				var newElement = buildUserEventElement(objects[i]);
				$(".ui-load-more-activity").before(newElement);
				// display event holder's name | not the email one
				pullUserEventHolderInfo(holder, id);
				// check if owner has interested this event
				var successFunction = function(eventId, interest){
					if (interest.length == 0){
						$("#interest-button-"+eventId).bind("click", function() {
							addInterestEvent(eventId);
						});
					} else {
						$("#interest-button-"+eventId).removeClass("ui-icon-custom-favor-false");
						$("#interest-button-"+eventId).addClass("ui-icon-custom-favor-true");
						$("#interest-button-"+eventId).bind("click", function() {
							removeInterestEvent(eventId);
						});
					};
					pullLastItem = pullLastItem - 1;
					if (pullLastItem == 0) {
						$("#event-content").removeClass("ui-hidden-accessible");
						$.mobile.loading("hide");
					}
				};
				ParseCheckInterest(owner, id, successFunction);
			} else {
				var commentNumber = objects[i].get("commentNumber");
				var interestNumber = objects[i].get("interestNumber");
				var holder = objects[i].get("owner");
				var id = objects[i].id;
				$("#comment-statistics-"+id).html(commentNumber.toString()+" Comments");
				$("#interest-statistics-"+id).html(interestNumber.toString()+" Interests");
				pullLastItem = pullLastItem - 1;
				if (pullLastItem == 0) {
					$("#event-content").removeClass("ui-hidden-accessible");
					$.mobile.loading("hide");
				}
				// display event holder's name | not the email one
				pullUserEventHolderInfo(holder, id);
			}
		}
	};

	ParsePullEvent({
		// owner: owner,
		limitNumber: limitNumber,
		descendingOrderKey:descendingOrderKey,
		accessibility: "public",
		beforeAt: beforeAt,
		displayFunction: displayFunction
		// eventId: null
	});
	// ParsePullEvent(null, limitNumber, descendingOrderKey, "public", beforeAt, displayFunction);
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

function buildCommentInEventDetail(object){
	var commentId = object.id;
	var ownerName = object.get("ownerName");
	var text = object.get('content');
	var time = object.createdAt;

	var newElement = "";
	newElement += "<div id='comment-"+commentId+"' class='ui-custom-comment-left'>";
	newElement += "<div class='ui-comment-owner'>"+ownerName+"</div>";
	newElement += "<div class='ui-comment-time'>"+convertTime(time)+"</div>";
	newElement += "<div class='ui-comment-content'>"+text+"</div>";
	newElement += "</div>";

	return newElement;
}

// update the detail of event when the user clicked to the page-event-detail
function updateEventDetail(id){
	$("#event-detail-content").html("");
	$("#event-id-label").html(id);
	$("#send-comment-bar").fadeIn();
	var descendingOrderKey = "createdAt";
	var displayFunction = function(object){
		var title = object[0].get("title");
		var location = object[0].get("location");
		var time = object[0].get("time");
		var visibility = object[0].get("visibility");
		var description = object[0].get("description");
        var holder = object[0].get("owner");
		var id = object[0].id;

		var newElement = "";
		newElement = newElement + "<div id=event-detail-'"+id+"'>";
        newElement = newElement + "<div class='ui-corner-all custom-corners custom-corners-detail'>";
		newElement = newElement + "<div class='ui-body ui-body-a'>";
		newElement = newElement + "<p class='ui-custom-event-title'>" + title + "</p>";
        if (description.length == 0) {
            newElement = newElement + "<p class='ui-custom-event-description-less-margin'>" + description.replace("\n","</br>") + "</p>";
        } else {
            newElement = newElement + "<p class='ui-custom-event-description'>" + description.replace("\n","</br>") + "</p>";
        }
		newElement = newElement + "<p class='ui-custom-event-location'>" + location + "</p>";
		newElement = newElement + "<p class='ui-custom-event-time'>" + time + "</p>";
		//newElement += "<br><p class = 'ui-custom-event-activityreport' onclick ='$(\".ui-custom-report\").click(reportActivity(\""+id+"\"))'>Report</p>";
		newElement += "<a href='#page-event-report' role='button' class='ui-custom-event-activityreport' data-transition='slideup' onclick='$(\"#send-comment-bar\").fadeOut();'>Report</a>";
		newElement = newElement + "</div>";
		newElement = newElement + "</div>";
		newElement = newElement + "</div>";

		$("#event-detail-content").prepend(newElement);
		$(".ui-custom-report").on("click",function(){
			reportActivity(id);
		});
	};
	ParseSelectEvent(id, displayFunction);

	var displayFunction = function(objects) {
		$("#event-detail-content").append("<div id='event-commnets-list' class='ui-custom-comment-container'></div>")

		for (var i=0; i<=objects.length-1; i++) {
			var newElement = buildCommentInEventDetail(objects[i]);
			$("#event-commnets-list").append(newElement);
			var displayFunction = function(object, data) {
				var photo120 = object.get("profilePhoto120");
				if (typeof(photo120) == "undefined") {
					photo120 = "./content/png/Taylor-Swift.png";
				}
				$("#comment-"+data.commentId).css("backgroundImage", "url("+photo120+")")
			}
			CacheGetProfilePhotoByUsername(objects[i].get('owner'), displayFunction, {commentId: objects[i].id});
		}
	}
	ParsePullEventComment(id, descendingOrderKey, displayFunction);
}

// send comment to database
function sendComment(){
	var eventId = $("#event-id-label").html();
	var currentUser = Parse.User.current();
	var owner = currentUser.getUsername();
	var content = $("#comment-content").val();
	if (content == "")
		return;
	$("#comment-content").val("");
	if (content.length==0)
		return;
	var errorFunction = function(error){
		$.mobile.loading( 'show', {
			text: error,
			textVisible: true,
			theme: 'a',
			textonly: true,
			html: ""
		});
		setTimeout( function(){$.mobile.loading( "hide" );}, 2000);
	};
	var successFunction = function(object){
		var eventId = object.id;
		var commentNumber = object.get("commentNumber");
		updateEventDetail(eventId);
		$("#comment-statistics-"+eventId).html(commentNumber.toString()+" Comments");
		$("#my-comment-statistics-"+eventId).html(commentNumber.toString()+" Comments");
	};
	ParseAddEventComment(eventId, owner, content, errorFunction, successFunction);
}

var selectedElement="";
var animateDuration=150;
function pullMyEvent(beforeAt){
	var currentUser = Parse.User.current();
	var owner = currentUser.getUsername();
	var descendingOrderKey = "createdAt";
	var displayFunction = function(objects){
		for (var i=objects.length-1; i >= 0; i--) {
			if ($("#my-event-content > #my-"+objects[i].id).length == 0) {
				var owner = objects[i].get("owner");
				var title = objects[i].get("title");
				var location = objects[i].get("location");
				var time = objects[i].get("time");
				var visibility = objects[i].get("visibility");
				var description = objects[i].get("description");
				var interestNumber = objects[i].get("interestNumber");
				var commentNumber = objects[i].get("commentNumber");
				var id = objects[i].id;
				var newElement = "";
				newElement = newElement + "<div id='my-"+id+"'>";
				newElement = newElement + "<div class='custom-corners custom-corners-public'>";
				newElement = newElement + "<div class='ui-body ui-body-a'>";
				newElement = newElement + "<p class='ui-custom-event-title'>" + title + "</p>";
				if (location.length > 0) {
					newElement = newElement + "<p class='ui-custom-event-location'>" + location + "</p>";
				}
				if (time.length > 0) {
					newElement = newElement + "<p class='ui-custom-event-time'>" + time + "</p>";
				}
				if ((location.length == 0) && (time.length == 0)) {
					newElement = newElement + "<p class='ui-custom-event-description-less-margin'>" + description.replace("\n","</br>") + "</p>";
				} else {
					newElement = newElement + "<p class='ui-custom-event-description'>" + description.replace("\n","</br>") + "</p>";
				}
				newElement = newElement + "<div id='my-comment-statistics-"+id+"' class='event-statistics'>" + commentNumber + " Comments</div><div id='my-interest-statistics-"+id+"' class='event-statistics'>" + interestNumber + " Interests</div>";
				newElement = newElement + "</div>";
				newElement = newElement + "<div class='ui-footer ui-bar-custom'>"
				newElement = newElement + "<div class='ui-custom-float-left'><a href='#page-event-detail' data-transition='slide' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-comment' id='my-comment-button-"+id+"' onclick=\"updateEventDetail('"+id+"'); setCurrLocationHash('#page-event-delete')\">"+"Detail"+"</a></div>";
				newElement = newElement + "<div class='ui-custom-float-left'><a href='#page-event-delete' data-transition='slideup' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-delete' id='my-comment-button-"+id+"' onclick=\"deleteMyEvent('"+id+"'); setCurrLocationHash('#page-event-delete')\">"+"Delete"+"</a></div>";
				newElement = newElement + "<div class='ui-custom-float-left'><a href='#page-event-update' data-transition='slideup' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-edit' id='my-comment-button-"+id+"' onclick=\"editMyEvent('"+id+"'); setCurrLocationHash('#page-event-delete')\">"+"Edit"+"</a></div>";

				//newElement = newElement + "<div class='ui-block-c'><a href='#' class='ui-btn ui-mini ui-btn-icon-left' id='my-delete-button-"+id+"' onclick=\"deleteMyEvent('"+id+"')\">"+'delete'+"</a></div>";
				newElement = newElement + "</div>";
				newElement = newElement + "</div>";
				newElement = newElement + "</div>";
				$("#my-event-content").prepend(newElement);
			} else {
				var commentNumber = objects[i].get("commentNumber");
				var interestNumber = objects[i].get("interestNumber");
				var id = objects[i].id;
				$("#my-comment-statistics-"+id).html(commentNumber.toString()+" Comments");
				$("#my-interest-statistics-"+id).html(interestNumber.toString()+" Interests");
			}
		};
	};
	ParsePullEvent({
		owner: owner,
		// limitNumber: null,
		descendingOrderKey:descendingOrderKey,
		// accessibility: null,
		beforeAt: beforeAt,
		displayFunction: displayFunction
		// eventId: null
	});
	// ParsePullEvent(owner, null, descendingOrderKey, null, beforeAt, displayFunction);
}

function addInterestEvent(eventId){
	var currentUser = Parse.User.current();
	var owner = currentUser.getUsername();
	var displayFunction = function(object){
		var eventId = object.id;
		var interestNumber = object.get("interestNumber");
		$("#interest-statistics-"+eventId).html(interestNumber.toString()+" Interests");
		$("#interest-button-"+eventId).removeClass("ui-icon-custom-favor-false");
		$("#interest-button-"+eventId).addClass("ui-icon-custom-favor-true");
		$("#interest-button-"+eventId).unbind("click");
		$("#interest-button-"+eventId).bind("click", function() {
			removeInterestEvent(eventId);
		});
	};
	ParseAddInterest(owner, eventId, displayFunction);

}

function removeInterestEvent(eventId){
	var currentUser = Parse.User.current();
	var owner = currentUser.getUsername();
	var displayFunction = function(object,eventId){
		if (object.length == 1) {
			objectId = object[0].id;
			var displayFunction = function(object) {
				var eventId = object.id;
				var interestNumber = object.get("interestNumber");
				$("#interest-statistics-"+eventId).html(interestNumber.toString()+" Interests");
				$("#interest-button-"+eventId).removeClass("ui-icon-custom-favor-true");
				$("#interest-button-"+eventId).addClass("ui-icon-custom-favor-false");
				$("#interest-button-"+eventId).unbind("click");
				$("#interest-button-"+eventId).bind("click", function() {
					addInterestEvent(eventId); 
				});
			};
			ParseRemoveInterest(objectId, null, eventId, displayFunction)
		}
	};
	ParseRemoveInterest(null, owner, eventId, displayFunction);
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

function deleteMyEvent(eventId){
	$(".ui-custom-delete-confirm").click(function(){
		var displayFunction = function(eventId){
			$("#my-"+eventId).slideUp("fast", function(){
				$("#"+eventId).remove();
				$("#my-"+eventId).remove();
			});
		};
		ParseDeleteEvent(eventId, displayFunction);
	});
}

function editMyEvent(eventId){
	var display = function(objs){
		$("#event-edit-title").val(objs[0].get("title"));
		$("#event-edit-location").val(objs[0].get("location"));
		var time = objs[0].get("time").split(" -- ");
		$("#event-edit-startTime").val(time[0].replace(" ", "T"));
		$("#event-edit-endTime").val(time[1].replace(" ", "T"));
		if(objs[0].get("visibility") == false){
			$("#event-edit-visibility").val("Friends");
		}
		$("#event-edit-description").val(objs[0].get("description"));
		setCurrLocationHash('#page-event-edit');
		$.mobile.changePage("#page-event-edit"); // window.location.hash = "#page-event";
		$('#event-editsave-button').on('click',function(){
			editSaveUserEvent(eventId);
		});
	}
	ParsePullEvent({eventId: eventId, displayFunction: display});
}

function editSaveUserEvent(eventId){
	var currentUser = Parse.User.current();
	var owner = currentUser.getUsername();

	var title = $("#event-edit-title").val();
	var location = $("#event-edit-location").val();
	var startTime = $("#event-edit-startTime").val().replace("T", ' ');
    var endTime = $("#event-edit-endTime").val().replace('T', ' ');

    var errorHandler = function(item) {
        $("#event-edit-" + item).focus().parent().addClass("ui-custom-event-edit-focus");
        if ($("#event-edit-" + item + "-alert").length == 0) {
            $("#event-edit-" + item).parent().after("<p id='event-edit-" + item + "-alert' class='event-edit-alert'>*Field required</p>");
        }

        setTimeout(function(){
            $("#event-edit-" + item).focus().parent().removeClass("ui-custom-event-edit-focus");
        }, 500);

        $("#event-edit-" + item).change(function(){
            $("#event-edit-" + item + "-alert").remove();
            $("#event-edit-" + item).unbind("change");
        });
    };

    if (title.length == 0) {
        errorHandler("title");
        return;
    }

    if (location.length == 0) {
        errorHandler("location");
        return;
    }

    if (startTime.length == 0) {
        errorHandler("startTime");
        return;
    }

    if (endTime.length == 0) {
        errorHandler("endTime");
        return;
    }

    $('#event-edit-button').unbind("click");

    var index1 = startTime.indexOf(":");
    var index2 = startTime.lastIndexOf(":");
    if (index1 != index2) {
        startTime = startTime.substring(0, index2);
    }

    index1 = endTime.indexOf(":");
    index2 = endTime.lastIndexOf(":");
    if (index1 != index2) {
        endTime = endTime.substring(0, index2);
    }

    var time = startTime + " -- " + endTime;

	var visibility = $("#event-edit-visibility").val()=="on" ? true : false ;
	var description = $("#event-edit-description").val();
	var errorObject = $("#event-error");
	var destID = "#page-event-my-event";
	var displayFunction = function(object){
		$("#event-edit-title").val("");
		$("#event-edit-location").val("");
		$("#event-edit-start-time").val("");
		$("#event-edit-end-time").val("");
		$("#event-edit-description").val("");
		$("#event-edit-visibility").val("on").flipswitch('refresh');
		$("#event-edit-error").html("");
		var id = object.id;
		var holder = object.get("owner");
		var newElement = buildUserEventElement(object);
		$("#event-content").prepend(newElement);
	};
	ParseEventEditSave(owner, title, location, time, visibility, description, errorObject, destID, displayFunction, eventId);
}


var refreshPreviewPhoto = false;
function refreshPreviewCanvas(){
	profilePhotoCrop();
	if (refreshPreviewPhoto) {
		setTimeout(function(){
			refreshPreviewCanvas();
		},1500);
	}
}

function getMyProfile(){
	var currentUser = Parse.User.current();
	var owner = currentUser.getUsername();
	var userId = currentUser.id;
	var displayFunction = function(){
		var currentUser = Parse.User.current();
		var name = currentUser.get("name");
		var gender = currentUser.get("gender");
		var birthdate = currentUser.get("birthdate");
		var motto = currentUser.get("motto");
		var major = currentUser.get("major");
		var school = currentUser.get("school");
		var interest = currentUser.get("interest");
		var location = currentUser.get("location");

		$("#profile-edit-name").val(name);
		$("#profile-edit-gender").val(gender ? "on" : "off");
		if (!gender) {
			$("#profile-edit-gender").parent().removeClass("ui-flipswitch-active");
		} else {
			$("#profile-edit-gender").parent().addClass("ui-flipswitch-active");
		}
		$("#profile-edit-birthdate").val(birthdate);
		$("#profile-edit-motto").val(motto);
		$("#profile-edit-major").val(major);
		$("#profile-edit-school").val(school);
		$("#profile-edit-interest").val(interest);
		$("#profile-edit-location").val(location);
	} 
	ParseUpdateCurrentUser(displayFunction, function(){});
	displayFunction = function(object, data){
		var photo120 = object.get('profilePhoto120');
		if (typeof(photo120) == "undefined") {
			photo120 = "./content/png/Taylor-Swift.png";
		}
		var canvas = document.getElementById('canvas-photo');
		var context = canvas.getContext('2d');
		var image = new Image();
		image.src = photo120;
		context.drawImage(image, 0, 0);
	}
	CacheGetProfilePhoto(userId, displayFunction, {});
}

function saveProfile(){
	refreshPreviewPhoto = false;
	$("#profile-save-btn").unbind("click");
	var currentUser = Parse.User.current();
	var owner = currentUser.getUsername();
	var id = currentUser.id;
	var fileUploadControl = $("#profile-edit-photo")[0];
	if (fileUploadControl.files.length > 0) {
		var canvas = document.getElementById('canvas-photo');
		var photo120 = canvas.toDataURL();
		var photo = fileUploadControl.files[0];
	}
	else {
		var photo120 = null;
		var photo = null;
	};
	var name = $("#profile-edit-name").val();
	var gender = $("#profile-edit-gender").val()=="on" ? true : false ;
	var birthdate = $("#profile-edit-birthdate").val();
	var motto = $("#profile-edit-motto").val();
	var major = $("#profile-edit-major").val();
	var school = $("#profile-edit-school").val();
	var interest = $("#profile-edit-interest").val();
	var location = $("#profile-edit-location").val();
	var displayFunction = function(){
		ParseUpdateCurrentUser(function(){}, function(){});
	}
	ParseSaveProfile(name, gender, birthdate, motto, major, school, interest, location, displayFunction);
	ParseSaveProfilePhoto(id, photo, photo120, function(object){});
}

function profilePhotoCrop(){
	var fileUploadControl = $("#profile-edit-photo")[0];
	var file = fileUploadControl.files[0];
	if (typeof(file) == "undefined")
		return;
	var reader = new FileReader();
	reader.onload = function(e) {
		var image = new Image();
		var canvas = document.getElementById('canvas-photo');
		var context = canvas.getContext('2d');
		image.src = e.target.result;
		var sourceX=0;
		var sourceY=0;
		var sourceWidth = image.width;
		var sourceHeight = image.height;
		var destWidth = canvas.width;
		var destHeight = canvas.height;
		var destX=0;
		var destY=0;
		if (sourceHeight < sourceWidth) {
			destWidth = sourceWidth*(destHeight/sourceHeight);
			destX = (canvas.width - destWidth)/2;
		} else if (sourceHeight > sourceWidth) {
			destHeight = sourceHeight*(destWidth/sourceWidth);
			destY = (canvas.height - destHeight)/2;
		}
		var orientation = parseInt($("#photo-orientation").html());
		context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
		switch(orientation){
			case 8:
				context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destX-canvas.width/2, destY-canvas.height/2, destWidth, destHeight);
				context.rotate(90*Math.PI/180);
				context.translate(-canvas.width/2,-canvas.height/2);
				break;
			case 3:
				context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destX-canvas.width/2, destY-canvas.height/2, destWidth, destHeight);
				context.rotate(-180*Math.PI/180);
				context.translate(-canvas.width/2,-canvas.height/2);
				break;
			case 6:
				context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destX-canvas.width/2, destY-canvas.height/2, destWidth, destHeight);
				context.rotate(-90*Math.PI/180);
				context.translate(-canvas.width/2,-canvas.height/2);
				break;
			default:
				context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
	    }
	}
	loadImage.parseMetaData(file,function (data) {
    	if (typeof(data.exif) != "undefined"){
	    	var orientation = data.exif.get('Orientation');
	    	//console.log(orientation);
	    	var canvas = document.getElementById('canvas-photo');
	    	var context = canvas.getContext('2d');
	    	switch(orientation){
	    		case 8:
	    			context.translate(canvas.width/2,canvas.height/2);
	    			context.rotate(-90*Math.PI/180);
	    			break;
	    		case 3:
	    			context.translate(canvas.width/2,canvas.height/2);
	    			context.rotate(180*Math.PI/180);
	    			break;
	    		case 6:
	    			context.translate(canvas.width/2,canvas.height/2);
	    			context.rotate(90*Math.PI/180);
	    			break;
		    }
		    $("#photo-orientation").html(orientation.toString());
		    reader.readAsDataURL(file);
		} else {
			reader.readAsDataURL(file);
		}
	},{});
}

var geoWatchId;
function listPeopleNearBy(){
	if (navigator.geolocation){
		geoWatchId = navigator.geolocation.watchPosition(showPeopleNearByList,showPeopleNearByListError);
	} else {
		$("#page-people-near-by > .ui-content").html("<p style='padding: 1em'>Geolocation is not supported by this browser.</p>");
	}
}

function stopGeoWatch(){
	navigator.geolocation.clearWatch(geoWatchId);
	$("#page-people-near-by > .ui-content").html("");
}

function getDistance(lat1, lng1, lat2, lng2){
	var radLat1 = lat1 * Math.PI / 180.0;
	var radLat2 = lat2 * Math.PI / 180.0;
	var radLng1 = lng1 * Math.PI / 180.0;
	var radLng2 = lng2 * Math.PI / 180.0;
	var a = radLat1 - radLat2;
	var b = radLng1 - radLng2;
	var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) + Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
	s = s * 6378.137;
	s = Math.round(s * 100) / 100;
	return s.toString();
}

function buildUserListElement(object, liIdPrefix, lat, lng, type) {
	var name = object.get('name');
	var gender = object.get('gender');
	var latitude = object.get('latitude');
	var longitude = object.get('longitude');
	var userId = object.id;
	var updatedAt = object.updatedAt;
	var newElement = "";
	if (liIdPrefix != null) {
		newElement += "<li id='"+liIdPrefix+userId+"'>";
	}
	if (type.localeCompare("friend-list") == 0){
		newElement += "<div class='custom-people-in-friend-list custom-corners'>"
	} else {//if (type.localeCompare("people-near-by-list") == 0) {
		newElement += "<div class='custom-corners-people-near-by custom-corners'>"
	}
	newElement += "<div class='ui-bar ui-bar-a'>";
	newElement += "<div><strong>"+name+"</strong></div>";
	newElement += "<div class='ui-icon-custom-gender' style='";
	if (typeof(gender) == 'undefined') {
		//$("#"+eventId+"-owner-gender").html(gender.toString());
	} else if (gender) {
		newElement += "background-image:url("+"./content/customicondesign-line-user-black/png/male-white-20.png"+");";
		newElement += "background-color:"+"#8970f1"+";";
	} else {
		newElement += "background-image:url("+"./content/customicondesign-line-user-black/png/female1-white-20.png"+");";
		newElement += "background-color:"+"#f46f75"+";";
	}

	newElement += "'></div>";

	if ((lat != null) && (lng != null)) {
		newElement += "<div class='people-near-by-list-distance'>" + getDistance(latitude, longitude, lat, lng) + "km, "+convertTime(updatedAt)+"</div>";
	}

	newElement += "</div>";
	newElement += "</div>";

	if (liIdPrefix != null) {
		newElement += "</li>";
	}

	return newElement;
}

function showPeopleNearByList(position){
	var latitudeLimit = 1;
	var longitudeLimit = 1;
	var descendingOrderKey = "updatedAt";
	if ($("#people-near-by-list").length == 0) {
		$("#page-people-near-by > .ui-content").html("<ul id='people-near-by-list' data-role='listview' data-inset='true' class='ui-listview ui-listview-inset ui-corner-all ui-shadow'></ul>");
	}
	var displayFunction = function(lat,lng,objects){
		for (var i = objects.length-1; i >= 0; i--) {
			if ($("#people-near-by-list > #near-by-"+objects[i].id).length == 0) {
				var newElement = buildUserListElement(objects[i], "near-by-", lat, lng, "people-near-by-list");
				var userId = objects[i].id;
				$("#people-near-by-list").prepend(newElement);
				var displayFunction = function(object){
					var photo120 = object.get("profilePhoto120");
					if (typeof(photo120) == "undefined") {
						photo120 = "./content/png/Taylor-Swift.png";
					}
					$("#near-by-"+object.get('userId')+" > .custom-corners-people-near-by").css("backgroundImage","url('"+photo120+"')");
				};
				CacheGetProfilePhoto(userId, displayFunction);
				prefixForGetFriendOptionsButton="near-by-";
				getFriendOptionsButton(userId);
			} else {
				var latitude = objects[i].get('latitude');
				var longitude = objects[i].get('longitude');
				$("#near-by-"+objects[i].id+" > .custom-corners-people-near-by > .ui-bar-a > .people-near-by-list-distance").html(getDistance(latitude, longitude, lat, lng) + "km, "+convertTime(objects[i].updatedAt));
			}
		}
	};
	ParsePullUserByGeolocation(position.coords.latitude,position.coords.longitude,latitudeLimit,longitudeLimit,descendingOrderKey,displayFunction);
}

function showPeopleNearByListError(error){
	switch(error.code) {
		case error.PERMISSION_DENIED:
		$("#page-people-near-by > .ui-content").html("<p style='padding: 1em'>Location request has been denied. Please turn on your location service and try again.</p>");
		break;
		case error.POSITION_UNAVAILABLE:
		$("#page-people-near-by > .ui-content").html("<p style='padding: 1em'>Location information is currently unavailable. Please try again later.</p>");
		break;
		case error.TIMEOUT:
		$("#page-people-near-by > .ui-content").html("<p style='padding: 1em'>Location request has timed out. Please check your network connection and try again.</p>");
		break;
		case error.UNKNOWN_ERROR:
		$("#page-people-near-by > .ui-content").html("<p style='padding: 1em'>Location information is currently unavailable due to an unknown error. Please try again later.</p>");
		break;
	}
}

function displayEventMoreOption(){
	$('#event-page-right-top-option-1').unbind("click");
	$('#event-page-right-top-option-2').unbind("click");
	$('#ui-icon-custom-right-top-more').attr("id","ui-icon-custom-right-top-more-active");
	$(window).unbind("scroll");
	$('#event-page-right-top-option-1').on('click',function(){
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours();
        var minute =  date.getMinutes();
        var time = "";
        time += year + "-";
        time += (month < 10 ? "0" + month: month) + "-";
        time += (day < 10 ? "0" + day : day) + "T";
        time += (hour < 10 ? "0" + hour : hour) + ":";
        time += (minute < 10 ? "0" + minute : minute);

        $("#event-create-startTime").val(time);
        $("#event-create-endTime").val(time);

		$('#event-create-button').on('click',function(){
			createUserEvent();
		});
		hiddenEventMoreOption();
	});
	$('#event-page-right-top-option-2').on('click',function(){
		pullMyEvent();
		hiddenEventMoreOption();
	});
	$('.options-hidden-cover-layer').show();
	$('.event-page-right-top-options').fadeIn('fast');
	$('.options-hidden-cover-layer').on('click',hiddenEventMoreOption);
	$('.options-hidden-cover-layer').on('swipeleft',hiddenEventMoreOption);
	$('.options-hidden-cover-layer').on('swiperight',hiddenEventMoreOption);
	$(window).scroll(hiddenEventMoreOption)
}

function hiddenEventMoreOption(){
	$('#event-page-right-top-option-1').unbind("click");
	$('#event-page-right-top-option-2').unbind("click");
	$('#ui-icon-custom-right-top-more-active').attr("id","ui-icon-custom-right-top-more");
	$(window).unbind("scroll");
	$('.options-hidden-cover-layer').hide();
	$('.event-page-right-top-options').fadeOut('fast');
}

var prefixForGetFriendOptionsButton="";
function getFriendOptionsButton(userId, option){
	if ((option)&&(option == 3)) {
		var startChatButton = "<div class='send-friend-request chat-friend' onclick=\"startPrivateChat('"+userId+"');\">Start Chat</div>";
		$("#"+prefixForGetFriendOptionsButton+userId+" > .custom-corners-people-near-by > .ui-bar").append(startChatButton);
		return;
	}
	var displayFunction = function(ownerId, friendId, object){
		if (typeof(object)=="undefined") {
			var displayFunction = function(ownerId, friendId, object){
				if (typeof(object)=="undefined") {
					var sendFriendRequestButton = "<div class='send-friend-request'>Send Friend Request</div>";
					$("#"+prefixForGetFriendOptionsButton+ownerId+" > .custom-corners-people-near-by > .ui-bar").append(sendFriendRequestButton);
					$("#"+prefixForGetFriendOptionsButton+ownerId+" > .custom-corners-people-near-by > .ui-bar > .send-friend-request").on("click",function(){
						// when click to send new friend request
						sendFriendRequest(ownerId);
					})
				} else {
					var objectId = object.id;
					var acceptFriendRequestButton = "<div class='send-friend-request accept-friend-request'>Accept</div>";
					var rejectFriendRequestButton = "<div class='reject-friend-request'>Reject</div>";
					$("#"+prefixForGetFriendOptionsButton+ownerId+" > .custom-corners-people-near-by > .ui-bar").append(acceptFriendRequestButton+rejectFriendRequestButton);
					$("#"+prefixForGetFriendOptionsButton+ownerId+" > .custom-corners-people-near-by > .ui-bar > .accept-friend-request").on("click",function(){
						// when click accept friend request
						$("#"+prefixForGetFriendOptionsButton+ownerId+" > .custom-corners-people-near-by > .ui-bar > .accept-friend-request").unbind("click");
						$("#"+prefixForGetFriendOptionsButton+ownerId+" > .custom-corners-people-near-by > .ui-bar > .reject-friend-request").unbind("click");
						var successFunction = function(object){
							var objectId = object.id;
							var friendId = object.get('friend');
							$("#"+prefixForGetFriendOptionsButton+friendId+" > .custom-corners-people-near-by > .ui-bar > .reject-friend-request").remove();
							$("#"+prefixForGetFriendOptionsButton+friendId+" > .custom-corners-people-near-by > .ui-bar > .accept-friend-request").addClass("chat-friend");
							$("#"+prefixForGetFriendOptionsButton+friendId+" > .custom-corners-people-near-by > .ui-bar > .accept-friend-request").removeClass("accept-friend-request");
							$("#"+prefixForGetFriendOptionsButton+friendId+" > .custom-corners-people-near-by > .ui-bar > .chat-friend").html("Start Chat");
							$("#"+prefixForGetFriendOptionsButton+friendId+" > .custom-corners-people-near-by > .ui-bar > .chat-friend").on("click",function(){
								startPrivateChat(friendId);
							});
						};
						ParseAcceptFriendRequest(objectId, null, null, successFunction);
					});

					$("#"+prefixForGetFriendOptionsButton+ownerId+" > .custom-corners-people-near-by > .ui-bar > .reject-friend-request").on("click",function(){
						// when click reject friend request
						var successFunction = function(friendId){
							$("#"+prefixForGetFriendOptionsButton+friendId).slideUp("fast", function(){
								$("#"+prefixForGetFriendOptionsButton+friendId).remove();
							});
						}
						ParseRejectFriendRequest(objectId, null, ownerId, successFunction);
					});
				}
			};
			CacheCheckFriend(ownerId, friendId, displayFunction);
		} else {
			var valid = object.get('valid');
			if (valid) {
				var startChatButton = "<div class='send-friend-request chat-friend' onclick=\"startPrivateChat('"+friendId+"');\">Start Chat</div>";
				$("#"+prefixForGetFriendOptionsButton+friendId+" > .custom-corners-people-near-by > .ui-bar").append(startChatButton);
			} else {
				var sendFriendRequestButton = "<div class='send-friend-request'>Request Sent</div>";
				$("#"+prefixForGetFriendOptionsButton+friendId+" > .custom-corners-people-near-by > .ui-bar").append(sendFriendRequestButton);
			}
		}
	};
	CacheCheckFriend(userId, Parse.User.current().id, displayFunction);
}

function sendFriendRequest(friendId) {
	var currentUser = Parse.User.current();
	$("#"+prefixForGetFriendOptionsButton+friendId+" > .custom-corners-people-near-by > .ui-bar > .send-friend-request").unbind("click");
	var successFunction = function(object){
		var friendId = object.get('friend');
		$("#"+prefixForGetFriendOptionsButton+friendId+" > .custom-corners-people-near-by > .ui-bar > .send-friend-request").html("Request Sent");
	}
	ParseSendFriendRequest(currentUser.id, friendId, successFunction);
}

function bindSearchAutocomplete(){
	$( "#user-autocomplete-list" ).on( "filterablebeforefilter", function ( e, data ) {
		var $ul = $( this );
		var $input = $( data.input );
		var value = $input.val();
		$ul.html( "" );
		if ( value && value.length > 0 ) {
			var limitNumber = 15;
			var displayFunction = function(objects){
				var html = "";
				for (var i=0; i<objects.length; i++) {
					var newElement = buildUserListElement(objects[i], "people-search-", null, null, "people-near-by-list");
					var userId = objects[i].id;
					$( "#user-autocomplete-list" ).append(newElement);
					var displayFunction = function(object){
						var photo120 = object.get("profilePhoto120");
						if (typeof(photo120) == "undefined") {
							photo120 = "./content/png/Taylor-Swift.png";
						}
						$("#people-search-"+object.get('userId')+" > .custom-corners-people-near-by").css("backgroundImage","url('"+photo120+"')");
					}
					CacheGetProfilePhoto(userId, displayFunction);
					prefixForGetFriendOptionsButton="people-search-";
					getFriendOptionsButton(userId);
				}
			}
			ParseSearchUserByEmailAndName(value, limitNumber, "updatedAt", displayFunction);
		}
	});
}

function unbindSearchAutocomplete(){
	$( "#user-autocomplete-list" ).unbind( "filterablebeforefilter" );
	$( "#user-autocomplete-list" ).html("");
	$( "#user-autocomplete-input" ).val("");
}

function pullMyFriendRequests() {
	$("#page-my-friend-requests > .ui-content").html("<ul id='friend-requests-list' class='ui-listview ui-listview-inset ui-corner-all ui-shadow'></ul>");
	var descendingOrderKey = "createdAt";
	var displayFunction = function(objects){
		if (objects.length == 0) {
			$("#page-my-friend-requests > .ui-content").addClass("ui-hidden-accessible");
			$("#new-friend-requests-btn").addClass("ui-hidden-accessible");
		} else {
			$("#page-my-friend-requests > .ui-content").removeClass("ui-hidden-accessible");
			$("#new-friend-requests-btn").removeClass("ui-hidden-accessible");
		}
		for (var i=0; i<objects.length; i++) {
			var friendId = objects[i].get("owner");
			var objectId = objects[i].id;
			var displayFunction = function(userObject, data) {
				var newElement = buildUserListElement(userObject, "new-friend-request-", null, null, "people-near-by-list");
				var objectId = data.friendObject.id;
				var friendId = data.friendObject.get('owner');
				$( "#friend-requests-list" ).append(newElement);
				var displayFunction = function(object, data){
					var photo120 = object.get("profilePhoto120");
					if (typeof(photo120) == "undefined") {
						photo120 = "./content/png/Taylor-Swift.png";
					}
					$("#new-friend-request-"+data.friendId+" > .custom-corners-people-near-by").css("backgroundImage","url('"+photo120+"')");
				};
				CacheGetProfilePhoto(friendId, displayFunction, {friendId: friendId});
				prefixForGetFriendOptionsButton="new-friend-request-";
				getFriendOptionsButton(friendId);
			};
			CacheGetProfileByUserId(friendId, displayFunction, {friendObject:objects[i]});
			ParseSetRequestRead(objectId);
		}
	};
	CachePullNewFriendRequest(Parse.User.current().id, descendingOrderKey, displayFunction);
}

function pullMyFriendList() {
	$( "#friend-list" ).html("");
	// check if there is new friend requests. If none, hide the button to transfer request list page
	var displayFunction = function(objects){
		if (objects.length == 0) {
			$("#page-my-friend-requests > .ui-content").addClass("ui-hidden-accessible");
			$("#new-friend-requests-btn").addClass("ui-hidden-accessible");
		} else {
			$("#page-my-friend-requests > .ui-content").removeClass("ui-hidden-accessible");
			$("#new-friend-requests-btn").removeClass("ui-hidden-accessible");
		}
	};

	CachePullNewFriendRequest(Parse.User.current().id, "updatedAt", displayFunction);

	var descendingOrderKey = "createdAt";
	var displayFunction = function(objects){
		// sort user list
		objects.sort(function(a, b){return a.get('name') - b.get('name')});

		// display them
		for (var i=0; i<objects.length; i++) {
			var friendId = objects[i].get("friend");
			var objectId = objects[i].id;
			$("#friend-list").append("<li id='friend-list-"+friendId+"' style='cursor:pointer' onclick=\"startPrivateChat('"+friendId+"');\"></li>");
			var displayFunction = function(userObject, data) {
				var newElement = buildUserListElement(userObject, null, null, null, "friend-list");
				var objectId = data.friendObject.id;
				var friendId = data.friendObject.get('friend');
				$( "#friend-list-"+userObject.id ).append(newElement);
				var displayFunction = function(object, data){
					var photo120 = object.get("profilePhoto120");
					if (typeof(photo120) == "undefined") {
						photo120 = "./content/png/Taylor-Swift.png";
					}
					$("#friend-list-"+data.friendId+">.custom-people-in-friend-list").css("backgroundImage","url('"+photo120+"')");
				};
				CacheGetProfilePhoto(friendId, displayFunction, {friendId : friendId});
				prefixForGetFriendOptionsButton="friend-list-";
				//getFriendOptionsButton(friendId, 3);
			};
			CacheGetProfileByUserId(friendId, displayFunction, {friendObject:objects[i]});
		}
	};

	CachePullMyFriend(Parse.User.current().id, descendingOrderKey, displayFunction);
}

function buildElementInChatMessagesPage(object){
	var messageId = object.id;
	var senderId = object.get("senderId");
	var currentId = Parse.User.current().id;
	var text = object.get('text');
	var elementClass;

	var newElement = "";
	if (currentId == senderId) {
		elementClass = "ui-custom-message-right";
	} else {
		elementClass = "ui-custom-message-left";
	}
	newElement += "<div id='message-"+messageId+"' class='"+elementClass+"'>";
	newElement += "<p>"+text+"</p>";
	newElement += "</div>";

	return newElement;
}

function sendMessage(){
	var groupId = $("#group-id-label").html();
	var senderId = Parse.User.current().id;
	var text = $("#message-content").val();
	if (text == "") 
		return;
	// $(window).unbind("scroll");
	$("#message-content").val("");
	var displayFunction= function(object){
		var messageId = object.id;
		var senderId = object.get("senderId");
		var groupId = object.get("groupId");
		var text = object.get('text');
		var notificationFunction = function(senderId,text,receiverId){
			var displayFunction = function(object,data){
				if (typeof(object.get("GCMId")) != "undefined") {
					data.GCMId = object.get("GCMId");
				}
				if (typeof(object.get("APNId")) != "undefined") {
					data.APNId = object.get("APNId");
				}
				var displayFunction = function(object,data){
					var message = object.get("name")+": " + data.message;
					if ('GCMId' in data)
						pushNotificationToDevice('gcm',data.GCMId,message);
					if ('APNId' in data)
						pushNotificationToDevice('apn',data.APNId,message);
				}
				CacheGetProfileByUserId(data.senderId, displayFunction, data);
			}
			var data = {senderId : senderId, message: text};
			CacheGetProfileByUserId(receiverId, displayFunction, data);
		};
		CacheSetGroupMemberChatObjectReadFalse(senderId, groupId, text, notificationFunction);
		var newElement = buildElementInChatMessagesPage(object);
		$("#page-chat-messages > .ui-content").append(newElement);
		var displayFunction = function(object, data){
			var photo120 = object.get("profilePhoto120");
			if (typeof(photo120) == "undefined") {
				photo120 = "./content/png/Taylor-Swift.png";
			}
			$("#message-"+data.messageId).css("backgroundImage","url('"+photo120+"')");
		};
		CacheGetProfilePhoto(senderId, displayFunction, {messageId : messageId});
		//$('#send-message-bar').css("bottom",($("body").height()-$("#page-chat-messages").height()-44).toString()+"px");
		
		$("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
			duration: 750,
			complete : function(){
			}
		});
		if ($("#send-message-bar").css("position") == "absolute") {
			$('#send-message-bar').css("bottom", ($("body").height()-$("#page-chat-messages").height()-44).toString()+"px");
		}
		
	};

	ParseAddChatMessage(senderId, groupId, text, displayFunction);
}

function updateChatTitle(friendId, id, option){
	var displayFunction= function(ownerId, friendId, object) {
		var alias = object.get('alias');
		if (typeof(alias) == "undefined") {
			var displayFunction = function(user){
				if ((option)&&(option == 2)) {
					$('#'+id).html(user.get("name"));
				} else {
					$('#'+id).append(user.get("name"));
				}
			};
			CacheGetProfileByUserId(friendId, displayFunction)
		} else {
			if ((option)&&(option == 2)) {
				$('#'+id).html(alias);
			} else {
				$('#'+id).append(alias);
			}
		}
	};
	// get the Friend object, in order to get alias of friend.
	CacheCheckFriend(friendId, Parse.User.current().id, displayFunction);
}

function startPrivateChat(friendId){
	$("#page-chat-messages > .ui-content").html("");
	$("#chat-messages-title").html("");
	$("#message-content").val("");	
	
	var memberId = new Array;
	memberId.push(friendId);
	memberId.push(Parse.User.current().id);
	var successFunction = function(object){
		var groupId = object.id;
		var currentId = Parse.User.current().id;
		$("#group-id-label").html(groupId);
		var successFunction = function(object){
			var groupId = object.get("groupId");
			var limitNum = 15;
			var descendingOrderKey = "createdAt";
			var displayFunction = function(objects, data){
				for (var i=objects.length-1; i>=0; i--) {
					var newElement = buildElementInChatMessagesPage(objects[i]);
					$("#page-chat-messages > .ui-content").append(newElement);
					var displayFunction = function(object, data) {
						var photo120 = object.get("profilePhoto120");
						if (typeof(photo120) == "undefined") {
							photo120 = "./content/png/Taylor-Swift.png";
						}
						$("#message-"+data.messageId).css("backgroundImage", "url("+photo120+")")
					};
					CacheGetProfilePhoto(objects[i].get('senderId'), displayFunction, {messageId: objects[i].id});
				}
				$.mobile.changePage( "#page-chat-messages");
				
			};
			//CachePullChatMessage(groupId, limitNum, null, displayFunction);
			ParsePullChatMessage(groupId, limitNum, descendingOrderKey, null, displayFunction, null)
		};
		ParseSetChatObjectAsRead(currentId, groupId, null, successFunction);
	};
	CacheGetGroupId(memberId,successFunction);
	//updateCashedPhoto120(friendId);
	updateChatTitle(friendId, "chat-messages-title");
}

function updateChatMessage(object){
	var groupId = object.get('groupId');
	var beforeAt = object.updatedAt;
	var limitNum = object.get("unreadNum");
	var descendingOrderKey = "createdAt";
	var displayFunction = function(objects, data) {
		var currentId = Parse.User.current().id;
		for (var i=objects.length-1; i>=0; i--) {
			if ($("#message-"+objects[i].id).length == 0) {
				var newElement = buildElementInChatMessagesPage(objects[i]);
				$("#page-chat-messages > .ui-content").append(newElement);
				var displayFunction = function(object, data) {
					var photo120 = object.get("profilePhoto120");
					if (typeof(photo120) == "undefined") {
						photo120 = "./content/png/Taylor-Swift.png";
					}
					$("#message-"+data.messageId).css("backgroundImage", "url("+photo120+")")
				}
				CacheGetProfilePhoto(objects[i].get('senderId'), displayFunction, {messageId: objects[i].id});
				var groupId = objects[i].get('groupId');
				ParseSetChatObjectAsRead(currentId, groupId, 1, function(){});
			}
		}
		$("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
			duration: 750,
	        complete : function(){
	        }
	    });
	    if ($("#send-message-bar").css("position") == "absolute") {
			$('#send-message-bar').css("bottom", ($("body").height()-$("#page-chat-messages").height()-44).toString()+"px");
		}
	}
	ParsePullChatMessage(groupId, limitNum, descendingOrderKey, beforeAt, displayFunction, null);

}

function buildElementInChatListPage(object){
	var chatId = object.id;
	var groupId = object.get('groupId');
	var unreadNum = object.get("unreadNum");
	var newElement = "";
	newElement += "<div id='chat-"+chatId+"' class='chat-list'>";
	newElement += "<div class='chat-list-title'></div>";
	newElement += "<div class='chat-last-time'></div>";
	newElement += "<div class='chat-last-message'></div>";
	if (unreadNum > 0) {
		newElement += "<span class='ui-li-count'>"+unreadNum+"</span>";
	}
	newElement += "</div>";

	return newElement;
}

function pullMyChat(){
	if (!pullNotificationRunning) {
		pullNotification();
	}
	var ownerId = Parse.User.current().id;
	var displayFunction = function(objects){
		for (var i=objects.length-1; i>=0; i--) {
			if ($("#chat-"+objects[i].id).length == 0) {
				var newElement = buildElementInChatListPage(objects[i]);
				$("#page-chat > .ui-content").prepend(newElement);
				var chatId = objects[i].id;
				var data = {chatId: chatId};
				var groupId = objects[i].get('groupId');
				var successFunction = function(object, data){
					var memberId = object.get("memberId");
					for (var i=0; i<memberId.length; i++) {
						if (memberId[i] != Parse.User.current().id) {
							updateChatTitle(memberId[i], "chat-"+data.chatId+"> .chat-list-title", 2);
							data['friendId'] = memberId[i];
							var displayFunction = function(object, data) {
								var photo120 = object.get("profilePhoto120");
								if (typeof(photo120) == "undefined") {
									photo120 = "./content/png/Taylor-Swift.png";
								}
								$("#chat-"+data.chatId).css("backgroundImage", "url("+photo120+")")
							};
							CacheGetProfilePhoto(data.friendId, displayFunction, data);
							$("#chat-"+data.chatId).unbind("click");
							$("#chat-"+data.chatId).on("click",function(){
								startPrivateChat(data.friendId);
							});
						}
					}
				};
				CacheGetGroupMember(groupId, successFunction, data);
				updateLastMessage(groupId, data);
			} else {
				var chatId = objects[i].id;				
				var groupId = objects[i].get('groupId');
				var data = {chatId: chatId};
				var unreadNum = objects[i].get('unreadNum');
				// move the element to top of the list
				var element = $("#chat-"+data.chatId);
				$("#page-chat > .ui-content").prepend(element);
				// update unread number label
				var unreadNum_Current;
				if ($("#chat-"+data.chatId+"> .ui-li-count").length > 0) {
					unreadNum_Current = parseInt($("#chat-"+data.chatId+"> .ui-li-count").html());
				} else {
					unreadNum_Current = 0;
				}
				if ((unreadNum != unreadNum_Current) && (unreadNum > 0)){
					if ($("#chat-"+data.chatId+"> .ui-li-count").length > 0) {
						$("#chat-"+data.chatId+"> .ui-li-count").html(unreadNum.toString());
					} else {
						$("#chat-"+data.chatId).append("<span class='ui-li-count'>"+unreadNum.toString()+"</span>");
					}
				} else {
					if (($("#chat-"+data.chatId+"> .ui-li-count").length > 0) && (unreadNum == 0)) {
						$("#chat-"+data.chatId+"> .ui-li-count").remove();						
						$("#chat-"+data.chatId+"> .chat-last-time").removeClass("chat-last-time-right-blank");
					}
				}
				updateLastMessage(groupId, data);
				// update photo and title 
				/*var groupId = objects[i].get('groupId');
				var successFunction = function(object, data){
					var memberId = object.get("memberId");
					for (var i=0; i<memberId.length; i++) {
						if (memberId[i] != Parse.User.current().id) {
							updateChatTitle(memberId[i], "chat-"+data.chatId+"> .chat-list-title", 2);
							data['friendId'] = memberId[i];
							getCashedPhoto120(data.friendId,"#chat-"+data.chatId);
							$("#chat-"+data.chatId).unbind("click");
							$("#chat-"+data.chatId).on("click",function(){
								startPrivateChat(data.friendId);
							});
						}
					}
				}
				CacheGetGroupMember(groupId, successFunction, data);*/
			}
		}
	};
	CachePullMyChat(ownerId,displayFunction);
}

function updateLastMessage(groupId, data){
	if (($("#chat-"+data.chatId+"> .ui-li-count").length == 0) && (typeof(data.parse) == "undefined")) {
		var displayFunction = function(object, data){
			if (object != null) {
				var text = object.get("text");
				var time = object.get("createdAt");
				$("#chat-"+data.chatId+"> .chat-last-message").html(text);
				$("#chat-"+data.chatId+"> .chat-last-time").html(convertTime(time));	
				if ($("#chat-"+data.chatId+"> .ui-li-count").length > 0) {					
					$("#chat-"+data.chatId+"> .chat-last-time").addClass("chat-last-time-right-blank");
				}
			} else {
				data.parse = true;
				updateLastMessage(groupId, data);
			}
		}
		CacheGetLastestMessage(groupId, displayFunction, data);
	} else {
		var limitNum = 1;
		var descendingOrderKey = "createdAt";
		var displayFunction = function(object, data){
			if (object.length > 0) {
				var text = object[0].get("text");
				var time = object[0].createdAt;
				$("#chat-"+data.chatId+"> .chat-last-message").html(text);							
				$("#chat-"+data.chatId+"> .chat-last-time").html(convertTime(time));
				if ($("#chat-"+data.chatId+"> .ui-li-count").length > 0) {
					$("#chat-"+data.chatId+"> .chat-last-time").addClass("chat-last-time-right-blank");
				}
			}
		};
		ParsePullChatMessage(groupId, limitNum, descendingOrderKey, null, displayFunction, data);
	}
}

//report spam activity
function reportActivity(id){
	var hiddenUserEvent = function(object){
		var id = object.id;
		$("#" + id).remove();
		$.mobile.changePage("#page-event");//window.location.hash = "#page-event";
	}
	ParseUpdateReport(id, hiddenUserEvent);	
}

function pushNotificationToDevice(platform,regId,message) {
	var request="id="+regId+"&message="+message;//{id: regId, message: message};
	//console.log(request);
	$.post("https://yueme-push-server.herokuapp.com/"+platform,request)
		.done(function(data) {
			//console.log(data);
		});
}