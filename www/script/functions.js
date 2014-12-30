$(document).ready(function (){
	var currentUser = Parse.User.current();
	$('#comment-content').on("blur",function(){
		$('#comment-content').textinput('disable');
	});
	$('#message-content').on("blur",function(){
		$('#message-content').textinput('disable');
	});
	$('#message-chat-form').submit(function(event){
		$('#message-content').trigger('blur');
		event.preventDefault();
	});
	$('#comment-form').submit(function(event){
		$('#comment-content').trigger('blur');
		event.preventDefault();
	});
	if (currentUser) {
		var successFunction = function() {
			window.location.hash = "page-event";
			pullUserEvent();
			pullNotification();
		};
		var errorFunction = function() {
			window.location.hash = "page-login";
		};
		ParseUpdateCurrentUser(successFunction, errorFunction);
	} else {
		window.location.hash = "page-login";
	}
});

function checkBridgeitEnable(){
	var currentBridgeitId = Parse.User.current().get("bridgeitId");
	if (typeof(currentBridgeitId) == "undefined" && bridgeit.isIPhone() && !bridgeit.isRegistered()) {
		//bridgeit.usePushService( window.pushHub, window.apiKey);
		bridgeit.register('_reg', 'handlePushRegistration');
	}
}

function handlePushRegistration(event){
	if (bridgeit.isRegistered()) {
		ParseUpdateBridgeit(bridgeit.getId());
	}
}

function pullNotification(){
	var currentUser = Parse.User.current();

	if (currentUser == null)
		return
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
	}
	ParsePullUnreadFriendRequest(currentUser.id, displayFunction);

	var displayFunction = function(objects){
		if ((typeof(objects)!="undefined")&&(objects.length > 0)) {
			jQuery("[id=chat]") .each(function(){
				$(this).addClass("chat-notification-custom");
			});
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
	}

	if ($( ":mobile-pagecontainer" ).pagecontainer( "getActivePage" )[0].id == "page-chat") {
		pullMyChat();
	} else {
		ParsePullUnreadChat(currentUser.id, "updatedAt", displayFunction);
	}


	setTimeout(function(){
		pullNotification();
	}, 2000)
}

function signup(){
	var name = $("#signup-name").val();
	var email = $("#signup-email").val();
	var password = $("#signup-password").val();
	var errorObject = $("#signup-error");
	var destID = "page-event";
	var customFunction = function(object){
		pullUserEvent();
		pullNotification();
		ParseCreateProfilePhotoObject(object.id);
	};
	ParseSignup(email, password, email, name, errorObject, destID, customFunction);
	$("#signup-password").val("");
}

function login(){
	var email = $("#login-email").val();
	var password = $("#login-password").val();
	var errorObject = $("#login-error");
	var destID = "page-event";
	var customFunction = function(){
		pullUserEvent();
		pullNotification();
	};
	ParseLogin(email, password, errorObject, destID, customFunction);
	$("#login-password").val("");
}

function logout(){
	var currentUser = Parse.User.current();
	var email = currentUser.getUsername();
	ParseRemoveCurrentBridgeitId();
	$("#login-email").val(email);
	$("#login-error").html("");
	$("#signup-error").html("");
	var destID = "page-login";
	ParseLogout(destID);

}

function createUserEvent(){
	var currentUser = Parse.User.current();
	var owner = currentUser.getUsername();
	$('#event-create-button').unbind("click");
	var title = $("#event-create-title").val();
	var location = $("#event-create-location").val();
	var time = $("#event-create-start-time").val().replace('T',' ');
	if (($("#event-create-start-time").val().toString().length > 0) && ($("#event-create-end-time").val().toString().length > 0)) {
		time = time + ' -- ';
	}
	time = time + $("#event-create-end-time").val().replace('T', ' ');
	var visibility = $("#event-create-visibility").val()=="on" ? true : false ;
	var description = $("#event-create-description").val();
	var errorObject = $("#event-error");
	var destID = "page-event";
	var clearFunction = function(){
		$("#event-create-title").val("");
		$("#event-create-location").val("");
		$("#event-create-start-time").val("");
		$("#event-create-end-time").val("");
		$("#event-create-description").val("");
		$("#event-create-visibility").val("on").flipswitch('refresh');
		$("#event-create-error").html("");
		pullUserEvent();
	};
	ParseEventCreate(owner, title, location, time, visibility, description, errorObject, destID, clearFunction);
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
			//$("#"+eventId+"-owner-denger").html(gender.toString());
		} else if (gender) {
			$("#"+eventId+"-owner-denger").css("backgroundImage","url('./content/customicondesign-line-user-black/png/male-white-20.png')");
			$("#"+eventId+"-owner-denger").css("backgroundColor","#8970f1");
		} else {
			$("#"+eventId+"-owner-denger").css("backgroundImage","url('./content/customicondesign-line-user-black/png/female1-white-20.png')");
			$("#"+eventId+"-owner-denger").css("backgroundColor","#f46f75");
		};
		
		pullLastItem = pullLastItem - 1;
		if (pullLastItem == 0) {
			$("#event-content").removeClass("ui-hidden-accessible");
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
			}
		}
		CacheGetProfilePhoto(userId, displayFunction, data);
	};
	CacheGetProfileByUsername(holder, displayFunction, {eventId : eventId})
	//ParseGetProfile(holder, displayFunction, eventId);
}

function pullUserEvent(){
	var limitNumber = 15;
	var descendingOrderKey = "createdAt";
	var ascendingOrderKey = "createdAt";
	$("#event-content").addClass("ui-hidden-accessible");
	pullLastItem=3*limitNumber;
	var displayFunction = function(objects){
		var currentUser = Parse.User.current();
		var owner = currentUser.getUsername();
		for (var i=objects.length-1; i >= 0; i--) {
			if ($("#"+objects[i].id).length == 0) {
				var title = objects[i].get("title");
				var location = objects[i].get("location");
				var time = objects[i].get("time");
				var visibility = objects[i].get("visibility");
				var description = objects[i].get("description");
				var interestNumber = objects[i].get("interestNumber");
				var commentNumber = objects[i].get("commentNumber");
				var holder = objects[i].get("owner");
				var id = objects[i].id;
				var newElement = "";
				newElement = newElement + "<div id='"+id+"'>";
				newElement = newElement + "<div class='custom-corners-public custom-corners'>";
				newElement = newElement + "<div class='ui-bar ui-bar-a'>";
				newElement = newElement + "<div><strong id='"+id+"-owner-name'></strong></div>";
				newElement = newElement + "<div id='"+id+"-owner-denger' class='ui-icon-custom-gender'></div>";
				newElement = newElement + "</div>";
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
				newElement = newElement + "<div id='comment-statistics-"+id+"' class='event-statistics'>" + commentNumber + " Comments</div><div id='interest-statistics-"+id+"' class='event-statistics'>" + interestNumber + " Interests</div>";
				newElement = newElement + "</div>";
				newElement = newElement + "<div class='ui-footer ui-bar-custom'>";
				newElement = newElement + "<div class='ui-custom-float-left'><a href='#page-event-detail' data-transition='slide' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-comment' id='comment-button-"+id+"' onclick=\"updateEventDetail('"+id+"')\">"+"Detail"+"</a></div>";
				newElement = newElement + "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-favor-false' id='interest-button-"+id+"' >"+"Interest"+"</a></div>";
				newElement = newElement + "</div>";
				newElement = newElement + "</div>";
				newElement = newElement + "</div>";
				$("#event-content").prepend(newElement);
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
					}
				}
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
				}
				// display event holder's name | not the email one
				pullUserEventHolderInfo(holder, id);
			}
		};
	};
	ParsePullEvent(null, limitNumber, descendingOrderKey, "public", displayFunction);
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


// update the detail of event when the user clicked to the page-event-detail
function updateEventDetail(id){
	$("#event-detail-content").html("");
	$("#event-id-label").html(id);
	var descendingOrderKey = "createdAt";
	var displayFunction = function(object){
		var title = object[0].get("title");
		var location = object[0].get("location");
		var time = object[0].get("time");
		var visibility = object[0].get("visibility");
		var description = object[0].get("description");
		var id = object[0].id;
		var newElement = "";
		newElement = newElement + "<div id=event-detail-'"+id+"'>";
		newElement = newElement + "<div class='ui-corner-all custom-corners custom-corners-detail'>";
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
		newElement = newElement + "</div>";
		newElement = newElement + "</div>";
		newElement = newElement + "</div>";
		$("#event-detail-content").prepend(newElement);
	}
	ParseSelectEvent(id, displayFunction);
	displayFunction = function(objects){
		$("#event-detail-content").append("<ul id='event-commnets-list' data-role='listview' data-inset='true' class='ui-listview ui-listview-inset ui-corner-all ui-shadow'></ul>")
		
		for (var i=objects.length-1; i>=0; i--) {
			var ownerName = objects[i].get("ownerName");
			var content = objects[i].get("content");
			var newElement = "<li>";
			newElement = newElement + "<a href='#' class='ui-btn'>"
			newElement = newElement + "<p><strong>"+ownerName+": </strong>"+content+"</p>";
			newElement = newElement + "<p><strong>"+convertTime(objects[i].createdAt)+"</strong></p>"
			newElement = newElement + "</a></li>";
			$("#event-commnets-list").prepend(newElement);
		}
	}
	ParsePullEventComment(id, descendingOrderKey, displayFunction);
}

// send comment to database
function sendCommnet(){
	var eventId = $("#event-id-label").html();
	var currentUser = Parse.User.current();
	var owner = currentUser.getUsername();
	var content = $("#comment-content").val();
	if (content == "")
		return;
	$("#comment-content").val("");
	if (content.length==0)
		return
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
function pullMyEvent(){
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
				newElement = newElement + "<div class='custom-corners'>";
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
				newElement = newElement + "<div class='ui-custom-float-left'><a href='#page-event-detail' data-transition='slide' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-comment' id='my-comment-button-"+id+"' onclick=\"updateEventDetail('"+id+"')\">"+"Detail"+"</a></div>";
				//newElement = newElement + "<div class='ui-block-c'><a href='#' class='ui-btn ui-mini ui-btn-icon-left' id='my-delete-button-"+id+"' onclick=\"deleteMyEvent('"+id+"')\">"+'delete'+"</a></div>";
				newElement = newElement + "</div>";
				newElement = newElement + "</div>";
				newElement = newElement + "<div class='ui-custom-delete-btn' onclick=\"deleteMyEvent('"+id+"')\"></div>"
				newElement = newElement + "</div>";
				$("#my-event-content").prepend(newElement);


				$("#my-"+id).on("swipeleft", function (){
					var id= $(this)[0].id;
					if (selectedElement == id) {
						return;
					}
					$("#"+selectedElement).animate({
						marginLeft:"0%"
					},{
						duration: animateDuration,
						complete: function(){
							$(this).css("width","");
						}
					});
					$("#"+selectedElement).children(".ui-custom-delete-btn").animate({
						width:"0%"
					},{
						duration: animateDuration,
						complete: function(){
							$(this).css("height","");
						}
					});
					var eventId = id.substring(3);
					$(this).css("width","100%");
					$(this).animate({
						marginLeft:"-72px"
					},{
						duration: animateDuration,
					});
					$(this).children(".ui-custom-delete-btn").css({
						"height": ($(this).height()-6.4).toString()+"px",
						"top": (-$(this).height()-6.4).toString()+"px",
						"marginBottom": (-$(this).height()+6.4).toString()+"px",
						"width":"72px"
					});
					selectedElement = id;
					$(window).scroll(function(){
						$("#"+selectedElement).animate({
							marginLeft:"0%"
						},{
							duration: animateDuration,
							complete: function(){
								$(this).css("width","");
							}
						});
						$("#"+selectedElement).children(".ui-custom-delete-btn").animate({
							width:"0%"
						},{
							duration: animateDuration,
							complete: function(){
								$(this).css("height","");
							}
						});
						$("#page-event-my-event").not("#"+selectedElement).unbind("click");
						$(window).unbind("scroll");
						selectedElement = "";
					});
					$("#page-event-my-event").not("#"+selectedElement).click(function() {
						$("#"+selectedElement).animate({
							marginLeft:"0%"
						},{
							duration: animateDuration,
							complete: function(){
								$(this).css("width","");
							}
						});
						$("#"+selectedElement).children(".ui-custom-delete-btn").animate({
							width:"0%"
						},{
							duration: animateDuration,
							complete: function(){
								$(this).css("height","");
							}
						});
						$("#page-event-my-event").not("#"+selectedElement).unbind("click");
						$(window).unbind("scroll");
						selectedElement = "";
					});
				});
				$("#my-"+id).on("swiperight", function (){
					if (selectedElement == "") {
						return;
					}
					$("#"+selectedElement).animate({
						marginLeft:"0%"
					},{
						duration: animateDuration,
						complete: function(){
							$(this).css("width","");
						}
					});
					$("#"+selectedElement).children(".ui-custom-delete-btn").animate({
						width:"0%"
					},{
						duration: animateDuration,
						complete: function(){
							$(this).css("height","");
						}
					});
					$("#page-event-my-event").not("#"+selectedElement).unbind("click");
					$(window).unbind("scroll");
					selectedElement = "";
				});


			} else {
				var commentNumber = objects[i].get("commentNumber");
				var interestNumber = objects[i].get("interestNumber");
				var id = objects[i].id;
				$("#my-comment-statistics-"+id).html(commentNumber.toString()+" Comments");
				$("#my-interest-statistics-"+id).html(interestNumber.toString()+" Interests");
			}
		};
	};
	ParsePullEvent(owner, null, descendingOrderKey, null, displayFunction);
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

function sendToolbarActiveKeyboard(id){
	$("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
		duration: 150,
        complete : function(){
            $('#'+id).textinput('enable');
			$('#'+id).focus();
        }
    });
}

function deleteMyEvent(eventId){
	var displayFunction = function(eventId){
		$("#my-"+eventId).slideUp("fast", function(){
			$("#"+eventId).remove();
			$("#my-"+eventId).remove();
		});
	};
	ParseDeleteEvent(eventId, displayFunction);
}

var refreshPreviewPhoto = false;
function refreshPreviewCanvas(){
	profilePhotoCrop();
	if (refreshPreviewPhoto) {
		setTimeout(function(){
			refreshPreviewCanvas();
		},1000);
	}
}

function getMyProfile(){
	refreshPreviewPhoto = true;
	refreshPreviewCanvas();
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
	displayFunction = function(object){
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
	CacheGetProfilePhoto(userId, displayFunction);
}

function saveProfile(){
	refreshPreviewPhoto = false;
	$("#profile-save-btn").unbind("click");
	var currentUser = Parse.User.current();
	var owner = currentUser.getUsername();
	var id = $("#saveprofile-id").html();
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
		context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
	}
	reader.readAsDataURL(file);
}


var geoWatchId;
function listFriendNearBy(){
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

function buildUserListElement(object, liIdPrefix, lat, lng) {
	var name = object.get('name');
	var gender = object.get('gender');
	var latitude = object.get('latitude');
	var longitude = object.get('longitude');
	var userId = object.id;
	var updatedAt = object.updatedAt;
	var newElement = "<li id='"+liIdPrefix+userId+"'>";
	newElement = newElement + "<div class='custom-corners-people-near-by custom-corners'>"
	newElement = newElement + "<div class='ui-bar ui-bar-a'>";
	newElement = newElement + "<div><strong>"+name+"</strong></div>";
	newElement = newElement + "<div class='ui-icon-custom-gender' style='";
	if (typeof(gender) == 'undefined') {
		//$("#"+eventId+"-owner-denger").html(gender.toString());
	} else if (gender) {
		newElement = newElement + "background-image:url("+"./content/customicondesign-line-user-black/png/male-white-20.png"+");";
		newElement = newElement + "background-color:"+"#8970f1"+";";
	} else {
		newElement = newElement + "background-image:url("+"./content/customicondesign-line-user-black/png/female1-white-20.png"+");";
		newElement = newElement + "background-color:"+"#f46f75"+";";
	};
	newElement = newElement + "'></div>";
	if ((lat != null) && (lng != null)) {
		newElement = newElement + "<div class='people-near-by-list-distance'>" + getDistance(latitude, longitude, lat, lng) + "km, "+convertTime(updatedAt)+"</div>";
	}
	newElement = newElement + "</div>";
	newElement = newElement + "</div></li>";

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
				var newElement = buildUserListElement(objects[i], "near-by-", lat, lng);
				var userId = objects[i].id;
				$("#people-near-by-list").prepend(newElement);
				var displayFunction = function(object){
					var photo120 = object.get("profilePhoto120");
					if (typeof(photo120) == "undefined") {
						photo120 = "./content/png/Taylor-Swift.png";
					}
					$("#near-by-"+object.get('userId')+" > .custom-corners-people-near-by").css("backgroundImage","url('"+photo120+"')");
				}
				CacheGetProfilePhoto(userId, displayFunction);
				prefixForGetFriendOptionsButton="near-by-";
				getFriendOptionsButton(userId);
			} else {
				var latitude = objects[i].get('latitude');
				var longitude = objects[i].get('longitude');
				$("#near-by-"+objects[i].id+" > .custom-corners-people-near-by > .ui-bar-a > .people-near-by-list-distance").html(getDistance(latitude, longitude, lat, lng) + "km, "+convertTime(objects[i].updatedAt));
			}
		}
	}
	ParsePullUserByGeolocation(position.coords.latitude,position.coords.longitude,latitudeLimit,longitudeLimit,descendingOrderKey,displayFunction);
}

function showPeopleNearByListError(error){
	switch(error.code) {
		case error.PERMISSION_DENIED:
		$("#page-people-near-by > .ui-content").html("<p style='padding: 1em'>User denied the request for Geolocation.</p>");
		break;
		case error.POSITION_UNAVAILABLE:
		$("#page-people-near-by > .ui-content").html("<p style='padding: 1em'>Location information is unavailable.</p>");
		break;
		case error.TIMEOUT:
		$("#page-people-near-by > .ui-content").html("<p style='padding: 1em'>The request to get user location timed out.</p>");
		break;
		case error.UNKNOWN_ERROR:
		$("#page-people-near-by > .ui-content").html("<p style='padding: 1em'>An unknown error occurred.</p>");
		break;
	}
}

function displayEventMoreOption(){
	$('#event-page-right-top-option-1').unbind("click");
	$('#event-page-right-top-option-2').unbind("click");
	$('#ui-icon-custom-right-top-more').attr("id","ui-icon-custom-right-top-more-active");
	$(window).unbind("scroll");
	$('#event-page-right-top-option-1').on('click',function(){
		$('#event-create-button').bind('click',function(){
			createUserEvent();
		});
		hiddenEventMoreOption();
	})
	$('#event-page-right-top-option-2').on('click',function(){
		pullMyEvent();
		hiddenEventMoreOption();
	})
	$('.options-hidden-cover-layer').show();
	$('.event-page-right-top-options').fadeIn('fast');
	$('.options-hidden-cover-layer').on('click',hiddenEventMoreOption);
	$('.options-hidden-cover-layer').on('swipeleft',hiddenEventMoreOption)
	$('.options-hidden-cover-layer').on('swiperight',hiddenEventMoreOption)
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
	if ((option)&&(option = 3)) {
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
					var acceptFriendRequestButton = "<div class='send-friend-request accept-friend-request'>Accept Request</div>";
					var rejectFriendRequestButton = "<div class='reject-friend-request'>Reject Request</div>";
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
						}
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
			}
			ParseCheckFriend(friendId, ownerId, displayFunction);
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
	}
	ParseCheckFriend(Parse.User.current().id, userId, displayFunction);
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
					var newElement = buildUserListElement(objects[i], "people-search-", null, null);
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
	$("#page-my-friend-requests > .ui-content").html("<ul id='friend-requests-list' data-role='listview' data-inset='true' class='ui-listview ui-listview-inset ui-corner-all ui-shadow'></ul>");
	var descendingOrderKey = "createdAt";
	var displayFunction = function(objects){
		for (var i=0; i<objects.length; i++) {
			var friendId = objects[i].get("owner");
			var objectId = objects[i].id;
			var displayFunction = function(userObject, data) {
				var newElement = buildUserListElement(userObject, "new-friend-request-", null, null);
				var objectId = data.friendObject.id;
				var friendId = data.friendObject.get('owner');
				$( "#friend-requests-list" ).append(newElement);
				var displayFunction = function(object, data){
					var photo120 = object.get("profilePhoto120");
					if (typeof(photo120) == "undefined") {
						photo120 = "./content/png/Taylor-Swift.png";
					}
					$("#new-friend-request-"+data.friendId+" > .custom-corners-people-near-by").css("backgroundImage","url('"+photo120+"')");
				}
				CacheGetProfilePhoto(friendId, displayFunction, {friendId: friendId});
				prefixForGetFriendOptionsButton="new-friend-request-";
				getFriendOptionsButton(friendId);
			}
			CacheGetProfileByUserId(friendId, displayFunction, {friendObject:objects[i]});
			ParseSetRequestRead(objectId);
		}
	}
	ParsePullNewFriendRequest(Parse.User.current().id, descendingOrderKey, displayFunction);
}

function pullMyFriendList() {
	$( "#friend-list" ).html("");
	var descendingOrderKey = "updatedAt";
	var displayFunction = function(objects){
		for (var i=0; i<objects.length; i++) {
			var friendId = objects[i].get("friend");
			var objectId = objects[i].id;
			var displayFunction = function(userObject, data) {
				var newElement = buildUserListElement(userObject, "friend-list-", null, null);
				var objectId = data.friendObject.id;
				var friendId = data.friendObject.get('friend');
				$( "#friend-list" ).append(newElement);
				var displayFunction = function(object, data){
					var photo120 = object.get("profilePhoto120");
					if (typeof(photo120) == "undefined") {
						photo120 = "./content/png/Taylor-Swift.png";
					}
					$("#friend-list-"+data.friendId+" > .custom-corners-people-near-by").css("backgroundImage","url('"+photo120+"')");
				}
				CacheGetProfilePhoto(friendId, displayFunction, {friendId : friendId});
				prefixForGetFriendOptionsButton="friend-list-";
				getFriendOptionsButton(friendId, 3);
			}
			CacheGetProfileByUserId(friendId, displayFunction, {friendObject:objects[i]});
		}
	}
	ParsePullMyFriend(Parse.User.current().id, descendingOrderKey, displayFunction);
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

/*var cashedPhoto120 = new Array;
function getCashedPhoto120(userId, destSelector){
	for (var i = cashedPhoto120.length-1; i >= 0; i--){
		if (cashedPhoto120[i].id == userId) {
			if (typeof(destSelector) != "undefined") {
				$(destSelector).css("backgroundImage","url("+cashedPhoto120[i].photo120+")");
				return;
			} else {
				return cashedPhoto120[i].photo120;
			}
		}
	}
	updateCashedPhoto120(userId, destSelector);
	return "";
}

function updateCashedPhoto120(userId, destSelector){
	var successFunction = function(data, object){
		var userId = object[0].get("userId");
		var photo120Data = object[0].get("profilePhoto120");
		if (typeof(photo120Data)=="undefined") {
			photo120Data = "./content/png/Taylor-Swift.png";
		}
		var existFlag = false;
		for (var i = cashedPhoto120.length-1; i >=0; i--){
			if (userId == cashedPhoto120[i].id) {
				cashedPhoto120[i].photo120 = photo120Data;
				existFlag = true;
				break;
			}
		}
		if (!existFlag) {
			var newCashed = {id: userId, photo120: photo120Data};
			cashedPhoto120.push(newCashed);
		}
		if (typeof(destSelector) != "undefined") {
			$(destSelector).css("backgroundImage", "url("+photo120Data+")");
		}
	};
	ParseGetProfilePhoto(null, userId, successFunction);
}*/

function sendMessage(){
	var groupId = $("#group-id-label").html();
	var senderId = Parse.User.current().id;
	var text = $("#message-content").val();
	if (text == "") 
		return;
	$("#message-content").val("");
	var displayFunction= function(object){
		var messageId = object.id;
		var senderId = object.get("senderId");
		var groupId = object.get("groupId");
		var text = object.get('text');
		var notificationFunction = function(text, object){
			var subject = $("#chat-messages-title").html+": "+text;
			var data = {subject: subject};
			var ownerId = object.get('ownerId');
			var displayFunction = function(user){
				var bridgeitId = user.get("bridgeitId");
				/*bridgeit.push(bridgeitId, {
					subject: data.subject
				});*/
			}
			CacheGetProfileByUserId(ownerId, displayFunction);
		}
		ParseSetGroupMemberChatObjectReadFalse(senderId, groupId, text, notificationFunction);
		var newElement = buildElementInChatMessagesPage(object);
		$("#page-chat-messages > .ui-content").append(newElement);
		var displayFunction = function(object, data){
			var photo120 = object.get("profilePhoto120");
			if (typeof(photo120) == "undefined") {
				photo120 = "./content/png/Taylor-Swift.png";
			}
			$("#message-"+data.messageId).css("backgroundImage","url('"+photo120+"')");
		}
		CacheGetProfilePhoto(senderId, displayFunction, {messageId : messageId});
		$("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
			duration: 150,
			complete : function(){}
		});
	}

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
	}
	// get the Friend object, in order to get alias of friend.
	ParseCheckFriend(Parse.User.current().id, friendId, displayFunction);
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
			var displayFunction = function(objects){
				for (var i=objects.length-1; i>=0; i--) {
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
				}
				$.mobile.changePage( "#page-chat-messages", { transition: "slide"});
				setTimeout(function(){
					$("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
						duration: 150,
						complete : function(){}
					});
				},575);
			}
			ParsePullChatMessage(groupId, limitNum, descendingOrderKey, null, displayFunction)
		}
		ParseSetChatObjectAsRead(currentId, groupId, null, successFunction);
	}
	ParseGetGroupId(memberId,successFunction);
	//updateCashedPhoto120(friendId);
	updateChatTitle(friendId, "chat-messages-title");
}

function updateChatMessage(object){
	var groupId = object.get('groupId');
	var beforeAt = object.updatedAt;
	var limitNum = object.get("unreadNum");
	var descendingOrderKey = "createdAt";
	var displayFunction = function(objects) {
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
			duration: 150,
			complete : function(){}
		});
	}
	ParsePullChatMessage(groupId, limitNum, descendingOrderKey, beforeAt, displayFunction);

}

function buildElementInChatListPage(object){
	var chatId = object.id;
	var groupId = object.get('groupId');
	var unreadNum = object.get("unreadNum");
	var newElement = "";
	newElement += "<div id='chat-"+chatId+"' class='chat-list'>";
	newElement += "<div class='chat-list-title'></div>";
	if (unreadNum > 0) {
		newElement += "<span class='ui-li-count'>"+unreadNum+"</span>";
	}
	newElement += "</div>";

	return newElement;
}

function pullMyChat(){
	var ownerId = Parse.User.current().id;
	var descendingOrderKey = "updatedAt";
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
							}
							CacheGetProfilePhoto(data.friendId, displayFunction, data);
							$("#chat-"+data.chatId).unbind("click");
							$("#chat-"+data.chatId).on("click",function(){
								startPrivateChat(data.friendId);
							});
						}
					}
				}
				ParseGetGroupMember(groupId, successFunction, data);
			} else {
				var chatId = objects[i].id;
				var data = {chatId: chatId};
				var unreadNum = objects[i].get('unreadNum');
				// update unread number label
				if (unreadNum > 0){
					// when unread number positive, move the element to top of the list
					var element = $("#chat-"+data.chatId);
					$("#page-chat > .ui-content").prepend(element);
					if ($("#chat-"+data.chatId+"> .ui-li-count").length > 0) {
						$("#chat-"+data.chatId+"> .ui-li-count").html(unreadNum.toString());
					} else {
						$("#chat-"+data.chatId).append("<span class='ui-li-count'>"+unreadNum.toString()+"</span>");
					}
				} else {
					if ($("#chat-"+data.chatId+"> .ui-li-count").length > 0) {
						$("#chat-"+data.chatId+"> .ui-li-count").remove();
					}
				}
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
				ParseGetGroupMember(groupId, successFunction, data);*/
			}
		}
	}
	ParsePullMyChat(ownerId,descendingOrderKey,displayFunction);
	
}