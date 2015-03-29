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
                        // when accepting friend request
                        $("#"+prefixForGetFriendOptionsButton+ownerId+" > .custom-corners-people-near-by > .ui-bar > .accept-friend-request").unbind("click");
                        $("#"+prefixForGetFriendOptionsButton+ownerId+" > .custom-corners-people-near-by > .ui-bar > .reject-friend-request").unbind("click");

                        var successFunction = function(object){
                            var objectId = object.id;
                            var friendId = object.get("friend");
                            $("#"+prefixForGetFriendOptionsButton+friendId+" > .custom-corners-people-near-by > .ui-bar > .reject-friend-request").remove();
                            $("#"+prefixForGetFriendOptionsButton+friendId+" > .custom-corners-people-near-by > .ui-bar > .accept-friend-request").addClass("chat-friend").removeClass("accept-friend-request");
                            $("#"+prefixForGetFriendOptionsButton+friendId+" > .custom-corners-people-near-by > .ui-bar > .chat-friend").html("Start Chat").on("click",function(){
                                startPrivateChat(friendId);
                            });

                            $("#body-bottom-button-send-request").html("Start Chat").unbind("click").on("click",function(){
                                startPrivateChat(friendId);
                            });

                            // push notification to friend
                            pushNotificationToDeviceByUserId(object.get('friend'), Parse.User.current().get("name")+" accepted your friend request!");
                        };
                        ParseAcceptFriendRequest(objectId, null, null, successFunction);
                    });

                    $("#"+prefixForGetFriendOptionsButton+ownerId+" > .custom-corners-people-near-by > .ui-bar > .reject-friend-request").on("click",function(){
                        // when rejecting friend request
                        var successFunction = function(friendId){
                            $("#"+prefixForGetFriendOptionsButton+friendId).slideUp("fast", function(){
                                $("#"+prefixForGetFriendOptionsButton+friendId).remove();
                            });

                            $("#body-bottom-button-send-request").html("Send Friend Request").unbind("click").on("click",function(){
                                sendFriendRequest(ownerId);
                            });
                        };
                        ParseRejectFriendRequest(objectId, null, ownerId, successFunction);
                    });
                }
            };
            CacheCheckFriend(ownerId, friendId, displayFunction);
            
        } else {
            var valid = object.get("valid");
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
    $("#body-bottom-button-send-request").unbind("click");

    var successFunction = function(object){
        var friendId = object.get("friend");
        $("#"+prefixForGetFriendOptionsButton+friendId+" > .custom-corners-people-near-by > .ui-bar > .send-friend-request").html("Request Sent");
        $("#body-bottom-button-send-request").html("Friend Request Sent");

        // push notification to friend
        pushNotificationToDeviceByUserId(object.get('friend'), Parse.User.current().get("name")+" wanna be your friend!");
    };
    ParseSendFriendRequest(currentUser.id, friendId, successFunction);
}

function buildUserListElement(object, liIdPrefix, lat, lng, type) {
    var name = object.get("name");
    var gender = object.get("gender");
    var latitude = object.get("latitude");
    var longitude = object.get("longitude");
    var userId = object.id;
    var updatedAt = object.updatedAt;
    var newElement = "";
    if (liIdPrefix != null) {
        newElement += "<li id='"+liIdPrefix+userId+"'";
        if (type.localeCompare("add-participant-list") == 0) {
            newElement += " class='ui-add-participant-unchecked'";
        } else {
            newElement += " class='ui-friend-list-line' onclick=\"$.mobile.changePage('#page-display-user-profile'); displayUserProfile('"+userId+"');\"";
        }
        newElement += ">";
    }
    //if (type.localeCompare("friend-list") == 0 || type.localeCompare("add-participant-list") == 0){
        newElement += "<div class='custom-people-in-friend-list custom-corners'>"
    //} else {//if (type.localeCompare("people-near-by-list") == 0) {
    //    newElement += "<div class='custom-corners-people-near-by custom-corners'>"
    //}
    newElement += "<div class='ui-bar ui-bar-a'>";
    newElement += "<div><strong>"+name+"</strong></div>";
    newElement += "<div class='ui-icon-custom-gender' style='";
    if (typeof(gender) == "undefined") {
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
    if ($("#body-people-near-by-list").length == 0) {
        $("#page-people-near-by > .ui-content").html("<ul id='body-people-near-by-list' data-role='listview' data-inset='true' class='ui-listview ui-listview-inset ui-corner-all ui-shadow'></ul>");
    }
    var displayFunction = function(lat,lng,objects){
        for (var i = objects.length-1; i >= 0; i--) {
            if ($("#body-people-near-by-list > #body-near-by-"+objects[i].id).length == 0) {
                var newElement = buildUserListElement(objects[i], "body-near-by-", lat, lng, "body-people-near-by-list");
                var userId = objects[i].id;
                $("#body-people-near-by-list").prepend(newElement);
                var displayFunction = function(object){
                    var photo120 = object.get("profilePhoto120");
                    if (typeof(photo120) == "undefined") {
                        photo120 = "./content/png/Taylor-Swift.png";
                    }
                    $("#body-near-by-"+object.get("userId")+" > .custom-people-in-friend-list").css("backgroundImage","url('"+photo120+"')");
                };
                CacheGetProfilePhotoByUserId(userId, displayFunction);
                prefixForGetFriendOptionsButton="body-near-by-";
                getFriendOptionsButton(userId);
            } else {
                var latitude = objects[i].get("latitude");
                var longitude = objects[i].get("longitude");
                $("#body-near-by-"+objects[i].id+" > .custom-people-in-friend-list > .ui-bar-a > .people-near-by-list-distance").html(getDistance(latitude, longitude, lat, lng) + "km, "+convertTime(objects[i].updatedAt));
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
    $( "#body-list-search-user" ).on( "filterablebeforefilter", function ( e, data ) {
        var $ul = $( this );
        var $input = $( data.input );
        var value = $input.val();
        $ul.html( "" );
        if ( value && value.length > 0 ) {
            var limitNumber = 15;
            var displayFunction = function(objects){
                var html = "";
                for (var i=0; i<objects.length; i++) {
                    var newElement = buildUserListElement(objects[i], "body-people-search-", null, null, "body-people-near-by-list");
                    var userId = objects[i].id;
                    $( "#body-list-search-user" ).append(newElement);
                    var displayFunction = function(object){
                        var photo120 = object.get("profilePhoto120");
                        if (typeof(photo120) == "undefined") {
                            photo120 = "./content/png/Taylor-Swift.png";
                        }
                        $("#body-people-search-"+object.get("userId")+" > .custom-people-in-friend-list").css("backgroundImage","url('"+photo120+"')");
                    };
                    CacheGetProfilePhotoByUserId(userId, displayFunction);
                    prefixForGetFriendOptionsButton="body-people-search-";
                    //getFriendOptionsButton(userId);
                }
            };
            ParseSearchUserByEmailAndName(value, limitNumber, "updatedAt", displayFunction);
        }
    });
}

function unbindSearchAutocomplete(){
    $( "#body-list-search-user" ).unbind( "filterablebeforefilter" );
    $( "#body-list-search-user" ).html("");
    $( "#body-input-user-autocomplete" ).val("");
}

// #page-friend functions
function pullMyFriendRequests() {
    $("#page-my-friend-requests > .ui-content").html("<ul id='body-friend-requests-list' class='ui-listview ui-listview-inset ui-corner-all ui-shadow'></ul>");
    var descendingOrderKey = "createdAt";
    var displayFunction = function(objects){
        if (objects.length == 0) {
            $("#page-my-friend-requests > .ui-content").addClass("ui-hidden-accessible");
            $("#body-new-friend-requests-btn").addClass("ui-hidden-accessible");
        } else {
            $("#page-my-friend-requests > .ui-content").removeClass("ui-hidden-accessible");
            $("#body-new-friend-requests-btn").removeClass("ui-hidden-accessible");
        }
        for (var i=0; i<objects.length; i++) {
            var friendId = objects[i].get("owner");
            var objectId = objects[i].id;
            var displayFunction = function(userObject, data) {
                var newElement = buildUserListElement(userObject, "body-new-friend-request-", null, null, "body-people-near-by-list");
                var objectId = data.friendObject.id;
                var friendId = data.friendObject.get("owner");
                $( "#body-friend-requests-list" ).append(newElement);
                var displayFunction = function(object, data){
                    var photo120 = object.get("profilePhoto120");
                    if (typeof(photo120) == "undefined") {
                        photo120 = "./content/png/Taylor-Swift.png";
                    }
                    $("#body-new-friend-request-"+data.friendId+" > .custom-corners-people-near-by").css("backgroundImage","url('"+photo120+"')");
                };
                CacheGetProfilePhotoByUserId(friendId, displayFunction, {friendId: friendId});
                prefixForGetFriendOptionsButton="body-new-friend-request-";
                //getFriendOptionsButton(friendId);
            };
            CacheGetProfileByUserId(friendId, displayFunction, {friendObject:objects[i]});
            ParseSetRequestRead(objectId);
        }
    };
    CachePullNewFriendRequest(Parse.User.current().id, descendingOrderKey, displayFunction);
}

function pullMyFriendList() {
    $( "#body-friend-list" ).html("");
    // check if there is new friend requests. If none, hide the button to transfer request list page
    var displayFunction = function(objects){
        if (objects.length == 0) {
            $("#page-my-friend-requests > .ui-content").addClass("ui-hidden-accessible");
            $("#body-new-friend-requests-btn").addClass("ui-hidden-accessible");
        } else {
            $("#page-my-friend-requests > .ui-content").removeClass("ui-hidden-accessible");
            $("#body-new-friend-requests-btn").removeClass("ui-hidden-accessible");
        }
    };

    CachePullNewFriendRequest(Parse.User.current().id, "updatedAt", displayFunction);

    var descendingOrderKey = "createdAt";
    displayFunction = function(objects){
        // sort user list
        objects.sort(function(a, b){return a.get("name") - b.get("name")});

        // display them
        for (var i=0; i<objects.length; i++) {
            var friendId = objects[i].get("friend");
            var objectId = objects[i].id;
            $("#body-friend-list").append("<li id='body-friend-list-"+friendId+"' class='ui-friend-list-line' onclick=\"setCurrLocationHash('#page-friend'); $.mobile.changePage('#page-display-user-profile'); displayUserProfile('"+friendId+"');\"></li>");
            var displayFunction = function(userObject, data) {
                var newElement = buildUserListElement(userObject, null, null, null, "friend-list");
                var objectId = data.friendObject.id;
                var friendId = data.friendObject.get("friend");
                $( "#body-friend-list-"+userObject.id ).append(newElement);
                var displayFunction = function(object, data){
                    var photo120 = object.get("profilePhoto120");
                    if (typeof(photo120) == "undefined") {
                        photo120 = "./content/png/Taylor-Swift.png";
                    }
                    $("#body-friend-list-"+data.friendId+">.custom-people-in-friend-list").css("backgroundImage","url('"+photo120+"')");
                };
                CacheGetProfilePhotoByUserId(friendId, displayFunction, {friendId : friendId});
                prefixForGetFriendOptionsButton="body-friend-list-";
                //getFriendOptionsButton(friendId, 3);
            };
            CacheGetProfileByUserId(friendId, displayFunction, {friendObject:objects[i]});
        }
    };

    CachePullMyFriend(Parse.User.current().id, descendingOrderKey, displayFunction);
}


var newGroupChatMemberArray = {memberId:[], prevNum:0, newNum:0};
function pullFriendListForAddingParticipants(){
    $("#body-add-participants-list").html("");
    $("#header-add-participant-for-group-chat").html("OK");
    $("#header-add-participant-for-group-chat").unbind("click");
    var groupId = $("#footer-bar-group-id-label").html();

    // pull the friend list
    var descendingOrderKey = "createdAt";
    displayFunction = function(objects){
        // sort user list
        objects.sort(function(a, b){return a.get("name") - b.get("name")});

        // display them
        for (var i=0; i<objects.length; i++) {
            var friendId = objects[i].get("friend");
            var objectId = objects[i].id;
            $("#body-add-participants-list").append("<li id='body-add-participants-list-"+friendId+"' class='ui-friend-list-line'></li>");
            $("#body-add-participants-list-"+friendId).click({id: friendId},selectANewPariticipant);
            var displayFunction = function(userObject, data) {
                var newElement = buildUserListElement(userObject, "body-add-participants-people-", null, null, "add-participant-list");
                var objectId = data.friendObject.id;
                var friendId = data.friendObject.get("friend");
                $( "#body-add-participants-list-"+userObject.id ).append(newElement);
                var displayFunction = function(object, data){
                    var photo120 = object.get("profilePhoto120");
                    if (typeof(photo120) == "undefined") {
                        photo120 = "./content/png/Taylor-Swift.png";
                    }
                    $("#body-add-participants-people-"+data.friendId+">.custom-people-in-friend-list").css("backgroundImage","url('"+photo120+"')");
                };
                CacheGetProfilePhotoByUserId(friendId, displayFunction, {friendId : friendId});
                prefixForGetFriendOptionsButton="body-add-participants-list-";
                //getFriendOptionsButton(friendId, 3);
            };
            CacheGetProfileByUserId(friendId, displayFunction, {friendObject:objects[i]});
        }

        // check if them have been in the group
        // get the current users in chat
        var groupId = $("#footer-bar-group-id-label").html();
        var successFunction = function(object, data){
            var memberId = object.get("memberId");
            console.log(memberId);
            newGroupChatMemberArray.memberId = $.merge([], memberId);
            newGroupChatMemberArray.prevNum = memberId.length;
            newGroupChatMemberArray.newNum = 0;
            for (var i=0; i<memberId.length; i++) {
                $("#body-add-participants-list-"+memberId[i]).unbind("click");
                $("#body-add-participants-people-"+memberId[i]).removeClass("ui-add-participant-unchecked");
                $("#body-add-participants-people-"+memberId[i]).addClass("ui-add-participant-checked");
            }
        }
        CacheGetGroupMember(groupId, successFunction, {});
    };

    CachePullMyFriend(Parse.User.current().id, descendingOrderKey, displayFunction);
}

