// general functions
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

// #page-people-near-by functions
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

// #page-people-search

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

// #page-friend functions
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