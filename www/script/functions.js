$(document).ready(function (){
	var currentUser = Parse.User.current();
	$('#comment-content').on("blur",function(){
		$('#comment-content').textinput('disable');
	});
	if (currentUser) {
		var successFunction = function() {
			window.location.hash = "page-event";
			pullUserEvent();
		};
		var errorFunction = function() {
			window.location.hash = "page-login";
		};
		ParseUpdateCurrentUser(successFunction, errorFunction);
	} else {
		window.location.hash = "page-login";
	}
});

function signup(){
	var name = $("#signup-name").val();
	var email = $("#signup-email").val();
	var password = $("#signup-password").val();
	var errorObject = $("#signup-error");
	var destID = "page-event";
	var customFunction = function(){
		pullUserEvent();
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
	};
	ParseLogin(email, password, errorObject, destID, customFunction);
	$("#login-password").val("");
}

function logout(){
	var currentUser = Parse.User.current();
	var email = currentUser.getUsername();
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
	var time = $("#event-create-time").val();
	var visibility = $("#event-create-visibility").val()=="on" ? true : false ;
	var description = $("#event-create-description").val();
	var errorObject = $("#event-error");
	var destID = "page-event";
	var clearFunction = function(){
		$("#event-create-title").val("");
		$("#event-create-location").val("");
		$("#event-create-time").val("");
		$("#event-create-description").val("");
		$("#event-create-visibility").val("on").flipswitch('refresh');
		$("#event-create-error").html("");
		pullUserEvent();
	};
	ParseEventCreate(owner, title, location, time, visibility, description, errorObject, destID, clearFunction);
}

function pullUserEvent(){
	var limitNumber = 20;
	var descendingOrderKey = "createdAt";
	var ascendingOrderKey = "createdAt";
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
				var id = objects[i].id;
				var newElement = "";
				newElement = newElement + "<div id='"+id+"'>";
				newElement = newElement + "<div class='ui-corner-all custom-corners'>";
				newElement = newElement + "<div class='ui-bar ui-bar-a'>";
				newElement = newElement + "<h3>" + title + "</h3>";
				newElement = newElement + "</div>";
				newElement = newElement + "<div class='ui-body ui-body-a'>";
				newElement = newElement + "<p>" + description + "</p>";
				newElement = newElement + "<div id='comment-statistics-"+id+"' class='event-statistics'>" + commentNumber + " Comments</div><div id='interest-statistics-"+id+"' class='event-statistics'>" + interestNumber + " Interests</div>";
				newElement = newElement + "</div>";
				newElement = newElement + "<div class='ui-footer ui-bar-inherit ui-bar-custom'>";
				newElement = newElement + "<div class='ui-custom-float-left'><a href='#page-event-detail' data-transition='slide' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-comment' id='comment-button-"+id+"' onclick=\"updateEventDetail('"+id+"')\">"+"Detail"+"</a></div>";
				newElement = newElement + "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-favor-false' id='interest-button-"+id+"' >"+"Interest"+"</a></div>";
				newElement = newElement + "</div>";
				newElement = newElement + "</div>";
				newElement = newElement + "</div>";
				$("#event-content").prepend(newElement);
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
					}
				}
				ParseCheckInterest(owner, id, successFunction);
			} else {
				var commentNumber = objects[i].get("commentNumber");
				var interestNumber = objects[i].get("interestNumber");
				var id = objects[i].id;
				$("#comment-statistics-"+id).html(commentNumber.toString()+" Comments");
				$("#interest-statistics-"+id).html(interestNumber.toString()+" Interests");
			}
		};
	};
	ParsePullEvent(null, limitNumber, descendingOrderKey, displayFunction);
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
		newElement = newElement + "<div class='ui-corner-all custom-corners'>";
		newElement = newElement + "<div class='ui-bar ui-bar-a'>";
		newElement = newElement + "<h3>" + title + "</h3>";
		newElement = newElement + "</div>";
		newElement = newElement + "<div class='ui-body ui-body-a'>";
		newElement = newElement + "<p>" + description + "</p>";
		newElement = newElement + "</div>";
		newElement = newElement + "</div>";
		newElement = newElement + "</div>";
		$("#event-detail-content").prepend(newElement);
	}
	ParseSelectEvent(id, displayFunction);
	displayFunction = function(objects){
		$("#event-detail-content").append("<ul id='event-commnets-list' data-role='listview' data-inset='true' class='ui-listview ui-listview-inset ui-corner-all ui-shadow'></ul>")
		var minutes = 1000 * 60;
		var hours = minutes * 60;
		var days = hours * 24;
		var years = days * 365;
		var currentTime = new Date();
		for (var i=objects.length-1; i>=0; i--) {
			var ownerName = objects[i].get("ownerName");
			var content = objects[i].get("content");
			var time = currentTime.getTime()-Date.parse(objects[i].createdAt.toString());
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
			var newElement = "<li>";
			newElement = newElement + "<a href='#' class='ui-btn'>"
			newElement = newElement + "<p><strong>"+ownerName+": </strong>"+content+"</p>";
			newElement = newElement + "<p><strong>"+showtime+"</strong></p>"
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
				newElement = newElement + "<div class='ui-corner-all custom-corners'>";
				newElement = newElement + "<div class='ui-bar ui-bar-a'>";
				newElement = newElement + "<h3>" + title + "</h3>";
				newElement = newElement + "</div>";
				newElement = newElement + "<div class='ui-body ui-body-a'>";
				newElement = newElement + "<p>" + description + "</p>";
				newElement = newElement + "<div id='my-comment-statistics-"+id+"' class='event-statistics'>" + commentNumber + " Comments</div><div id='my-interest-statistics-"+id+"' class='event-statistics'>" + interestNumber + " Interests</div>";
				newElement = newElement + "</div>";
				newElement = newElement + "<div class='ui-footer ui-bar-inherit ui-bar-custom'>"
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
						"height": $(this).height().toString()+"px",
						"top": (-$(this).height()-16).toString()+"px",
						"marginBottom": (-$(this).height()).toString()+"px",
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
	ParsePullEvent(owner, null, descendingOrderKey, displayFunction);
}

function addInterestEvent(eventId){
	var currentUser = Parse.User.current();
	var owner = currentUser.getUsername();
	var displayFunction = function(object){
		var eventId = object.id;
		var interestNumber = object.get("interestNumber");
		$("#interest-statistics-"+eventDd).html(interestNumber.toString()+" Interests");
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

function sendToolbarActiveKeyboard(){
	$("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
		duration: 150,
        complete : function(){
            $('#comment-content').textinput('enable');
			$('#comment-content').focus();
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

function getMyProfile(){
	var currentUser = Parse.User.current();
	var owner = currentUser.getUsername();
	var displayFunction = function(objects){
		var name = objects[0].get("name");
		var gender = objects[0].get("gender");
		var birthdate = objects[0].get("birthdate");
		var motto = objects[0].get("motto");
		var major = objects[0].get("major");
		var school = objects[0].get("school");
		var interest = objects[0].get("interest");
		var location = objects[0].get("location");

		$("#profile-edit-name").val(objects[0].get("name"));
		$("#profile-edit-gender").val(objects[0].get("gender") ? "on" : "off");
		if (!objects[0].get("gender")) {
			$("#profile-edit-gender").parent().removeClass("ui-flipswitch-active");
		} else {
			$("#profile-edit-gender").parent().addClass("ui-flipswitch-active");
		}
		$("#profile-edit-birthdate").val(objects[0].get("birthdate"));
		$("#profile-edit-motto").val(objects[0].get("motto"));
		$("#profile-edit-major").val(objects[0].get("major"));
		$("#profile-edit-school").val(objects[0].get("school"));
		$("#profile-edit-interest").val(objects[0].get("interest"));
		$("#profile-edit-location").val(objects[0].get("location"));
		$("#saveprofile-id").html(objects[0].id);
		
	} 
	ParseGetProfile(owner, displayFunction);
}

function saveprofile(){
	var currentUser = Parse.User.current();
	var owner = currentUser.getUsername();
	var id = $("#saveprofile-id").html();
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
	ParseSaveProfile(id, name, gender, birthdate, motto, major, school, interest, location, displayFunction);
}