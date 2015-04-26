/* This function is designed to mark that you are interested in an activity.
 */
function addInterestEvent(eventId){
    var displayFunction = function(object){  // object: single UserEvent object
        var eventId = object.id;
        var ownerUsername = object.get("owner");
        var interestNumber = 0;
        if (typeof(object.get("interestId")) != "undefined")
            interestNumber = object.get("interestId").length;
        $(".interest-statistics-"+eventId).each(function(){$(this).html(interestNumber.toString()+" Interests");});
        $(".interest-button-"+eventId).each(function(){
            var id = eventId;
            var oldElement = $(this);
            var newElement = "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-favor-true interest-button-"+id+"' onclick='removeInterestEvent(\""+id+"\")'>"+"Interest"+"</a></div>"
            oldElement.before(newElement);
            oldElement.remove();
        });

        // push notification to owner
        var title = object.get("title");
        if (title.length>10) {
            title = title.slice(0,6) + "...";
        }
        pushNotificationToDeviceByUsername(ownerUsername, Parse.User.current().get("name")+" interested in your activity \'"+title+"\'.");
    };
    ParseAddInterest(eventId, displayFunction);
}

/* This function is designed to mark that you are no longer interested in an activity.
 */
function removeInterestEvent(eventId){
    var displayFunction = function(object) { // object: single UserEvent object
        var eventId = object.id;
        var interestNumber = 0;
        if (typeof(object.get("interestId")) != "undefined")
            interestNumber = object.get("interestId").length;
        $(".interest-statistics-"+eventId).each(function(){$(this).html(interestNumber.toString()+" Interests");});
        $(".interest-button-"+eventId).each(function(){
            var id = eventId;
            var oldElement = $(this);
            var newElement = "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-favor-false interest-button-"+id+"' onclick='addInterestEvent(\""+id+"\")'>"+"Interest"+"</a></div>"
            oldElement.before(newElement);
            oldElement.remove();
        });
    };
    ParseRemoveInterest(eventId, displayFunction);
}

/* This function is designed to mark that you'd like to follow an activity.
 */
function addGoingEvent(eventId){
    var currentUser = Parse.User.current();
    var displayFunction = function(object){  // object: single UserEvent object
        var eventId = object.id;
        var ownerUsername = object.get("owner");
        var goingNumber = 0;
        if (typeof(object.get("goingId")) != "undefined")
            goingNumber = object.get("goingId").length;
        $(".going-statistics-"+eventId).each(function(){$(this).html(goingNumber.toString()+" Goings");});
        $(".going-button-"+eventId).each(function(){
            var id = eventId;
            var oldElement = $(this);
            var newElement = "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-going-true going-button-"+id+"' onclick='removeGoingEvent(\""+id+"\")'>"+"Going"+"</a></div>"
            oldElement.before(newElement);
            oldElement.remove();
        });

        // push notification to owner
        var title = object.get("title");
        if (title.length>10) {
            title = title.slice(0,6) + "...";
        }
        pushNotificationToDeviceByUsername(ownerUsername, Parse.User.current().get("name")+" wanna go with you in activity \'"+title+"\'!");
    };
    ParseAddGoing(eventId, displayFunction);
}

/* This function is designed to mark that you no longer want to follow an activity.
 */
function removeGoingEvent(eventId){
    var currentUser = Parse.User.current();
    var displayFunction = function(object){  // object: single UserEvent object
        var eventId = object.id;
        var goingNumber = 0;
        if (typeof(object.get("goingId")) != "undefined")
            goingNumber = object.get("goingId").length;
        $(".going-statistics-"+eventId).each(function(){$(this).html(goingNumber.toString()+" Goings");});
        $(".going-button-"+eventId).each(function(){
            var id = eventId;
            var oldElement = $(this);
            var newElement = "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-going-false going-button-"+id+"' onclick='addGoingEvent(\""+id+"\")'>"+"Going"+"</a></div>"
            oldElement.before(newElement);
            oldElement.remove();
        });
    };
    ParseRemoveGoing(eventId, displayFunction);
}

/* This variable ...
 */
var pullLastItem=0;

/* This function is designed to pull up the event owner's info.
 */
function pullUserEventHolderInfo(holder, elementIdBase){
    var displayFunction = function(object, data) {  // object: single cacheUser[i] object
        var name = object.get("name");
        var gender = object.get("gender");
        var userId = object.id;
        var elementIdBase = data.elementIdBase;

        $("#body-event-"+data.elementIdBase+" > .custom-corners > .ui-bar").click(function(){
            displayUserProfile(userId);
        });
        $("#body-top-bar-event-"+elementIdBase+"-owner-name").html(name);

        if (typeof(gender) != "undefined") {
            var $ownerGenderImage = $("#body-top-bar-event-"+elementIdBase+"-owner-gender");
            if (gender) {
                $ownerGenderImage.css("backgroundImage","url('./content/customicondesign-line-user-black/png/male-white-20.png')").css("backgroundColor","#8970f1");
            } else {
                $ownerGenderImage.css("backgroundImage","url('./content/customicondesign-line-user-black/png/female1-white-20.png')").css("backgroundColor","#f46f75");
            }
        }

        pullLastItem = pullLastItem - 1;
        if (pullLastItem == 0) {
            $("#body-event-content-list").removeClass("ui-hidden-accessible");
            $.mobile.loading("hide");
        }

        var displayFunction = function(object, data){  // object: single cachePhoto[i] object
            var photo120 = object.get("profilePhoto120");
            if (typeof(photo120) == "undefined") {
                photo120 = "./content/png/Taylor-Swift.png";
            }
            $("#body-event-"+data.elementIdBase+" > .custom-corners").css("backgroundImage","url('"+photo120+"')");
            pullLastItem = pullLastItem - 1;
            if (pullLastItem == 0) {
                $("#body-event-content-list").removeClass("ui-hidden-accessible");
                $.mobile.loading("hide");
            }
        };
        CacheGetProfilePhotoByUserId(userId, displayFunction, data);
    };
    CacheGetProfileByUsername(holder, displayFunction, {elementIdBase : elementIdBase});
}

/* This function is designed to build up the user event elements.
 */
function buildUserEventElement(object){
    var title = object.get("title");
    var location = object.get("location");
    var time = object.get("time");
    var visibility = object.get("visibility");
    var description = object.get("description");
    var commentNumber = object.get("commentNumber");
    var holder = object.get("owner");
    var id = object.id;
    var goingId = object.get("goingId");
    if (typeof(goingId) == "undefined") {
        goingId = [];
    }
    var goingNumber = goingId.length;
    var interestId = object.get("interestId");
    if (typeof(interestId) == "undefined") {
        interestId = [];
    }
    var interestNumber = interestId.length;
    var newElement = "";
    newElement = newElement + "<div id=\'body-event-"+id+"\'>";
    newElement = newElement + "<div class='custom-corners-public custom-corners'>";
    newElement = newElement + "<div class='ui-bar ui-bar-a' style='cursor:pointer' onclick=\"$.mobile.changePage(\'#page-display-user-profile\');\">";
    newElement = newElement + "<div><strong id=\'body-top-bar-event-"+id+"-owner-name\'></strong></div>";
    newElement = newElement + "<div id=\'body-top-bar-event-"+id+"-owner-gender\' class=\'ui-icon-custom-gender\'></div>";
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
    newElement = newElement + "<div class='event-statistics comment-statistics-"+id+"' style='clear:both'>" + commentNumber + " Comments</div><div class='event-statistics interest-statistics-"+id+"'>" + interestNumber + " Interests</div><div class='event-statistics going-statistics-"+id+"'>" + goingNumber + " Goings</div>";
    newElement = newElement + "</div>";
    newElement = newElement + "<div class='ui-footer ui-bar-custom'>";
    newElement = newElement + "<div class='ui-custom-float-left'><a href='#page-event-detail' data-transition='slide' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-comment' id='comment-button-"+id+"' onclick=\"updateEventDetail('"+id+"')\">"+"Detail"+"</a></div>";
    if (interestId.indexOf(Parse.User.current().id) < 0) {
        newElement += "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-favor-false interest-button-"+id+"' onclick='addInterestEvent(\""+id+"\")'>"+"Interest"+"</a></div>";
    } else {
        newElement += "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-favor-true interest-button-"+id+"' onclick='removeInterestEvent(\""+id+"\")'>"+"Interest"+"</a></div>";
    }
    if (goingId.indexOf(Parse.User.current().id) < 0) {
        newElement = newElement + "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-going-false going-button-"+id+"' onclick='addGoingEvent(\""+id+"\")'>"+"Going"+"</a></div>";
    } else {
        newElement = newElement + "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-going-true going-button-"+id+"' onclick='removeGoingEvent(\""+id+"\")'>"+"Going"+"</a></div>";
    }
    newElement = newElement + "</div>";
    newElement = newElement + "</div>";
    newElement = newElement + "</div>";

    return newElement;
}

/* This function is designed to build up the detailed user profile elements.
 */
function buildUserProfileDetailElement(object){
    var name = object.get("name");
    var gender = object.get("gender");
    var birthdate = object.get("birthdate");
    var school = object.get("school");
    var interest = object.get("interest");
    var location = object.get("location");
    var motto = object.get("motto");
    var major = object.get("major");
    // var latitude = object.get('latitude');
    // var longitude = object.get('longitude');
    var newElement = "";

    newElement += "<div class='ui-user-profile-name'>"+name+"</div>";
    newElement += "<div class='ui-icon-custom-gender ui-user-profile-gender' style='";
    if (typeof(gender) != "undefined") {
        if (gender) {
            newElement += "background-image:url("+"./content/customicondesign-line-user-black/png/male-white-20.png"+");";
            newElement += "background-color:"+"#8970f1"+";";
        } else {
            newElement += "background-image:url("+"./content/customicondesign-line-user-black/png/female1-white-20.png"+");";
            newElement += "background-color:"+"#f46f75"+";";
        }
    }

    newElement += "'></div>";
    if ((typeof(birthdate) != "undefined") && (birthdate))
        newElement += "<div class='ui-user-profile-list'><div class='ui-profile-label'>Birthday</div><div class='ui-profile-item'>"+birthdate+"</div></div>";
    if ((typeof(location) != "undefined") && (location))
        newElement += "<div class='ui-user-profile-list'><div class='ui-profile-label'>Region</div><div class='ui-profile-item'>"+location+"</div></div>";
    if ((typeof(school) != "undefined") && (school))
        newElement += "<div class='ui-user-profile-list'><div class='ui-profile-label'>Education</div><div class='ui-profile-item'>"+school+"</div></div>";
    if ((typeof(major) != "undefined") && (major))
        newElement += "<div class='ui-user-profile-list'><div class='ui-profile-label'>Major</div><div class='ui-profile-item'>"+major+"</div></div>";
    if ((typeof(interest) != "undefined") && (interest))
        newElement += "<div class='ui-user-profile-list'><div class='ui-profile-label'>Interest</div><div class='ui-profile-item'>"+interest+"</div></div>";
    if ((typeof(motto) != "undefined") && (motto))
        newElement += "<div class='ui-user-profile-list'><div class='ui-profile-label'>Motto</div><div class='ui-profile-item'>"+motto+"</div></div>";

    newElement += "<br>";
    newElement += "<div class='ui-btn' id='body-bottom-button-send-request' style='clear: both'></div>";
    // newElement += "<div class='ui-btn' id='body-bottom-button-report-abuse' style='clear: both'></div>";
    newElement += "<br>";

    return newElement;
}

/* This function is designed to display the detailed user profile.
 */
function displayUserProfile(userId){
    $("#body-user-profile").html("<div id='body-user-photo-"+userId+"' class='ui-user-profile-photo'></div>");

    var displayFunction= function(object, data){  // object: single cacheUser[i] object;   data: {userId: userId}
        $("#body-user-photo-"+data.userId).after(buildUserProfileDetailElement(object));
        var displayFunction1 = function(ownerId, friendId, object) {  // object: single cacheFriend[i] object (belong to ownerId)
            if (ownerId !== friendId) {
                if (typeof(object) == "undefined") {
                    var displayFunction2 = function(ownerId, friendId, object) {  // object: single cacheFriend[i] object (belong to friendId)
                        if (typeof(object) == "undefined") {
                            $("#body-bottom-button-send-request").html("Send Friend Request").on("click", function(){
                                sendFriendRequest(ownerId);
                            });
                        } else {
                            $("#body-bottom-button-send-request").after("<div class='ui-btn' id='body-bottom-button-response-request-accept' style='clear: both'></div>"
                                + "<div class='ui-btn' id='body-bottom-button-response-request-reject' style='clear: both'></div>").remove();
                            $("#body-bottom-button-response-request-accept").html("Accept Request").on("click",function(){
                                acceptFriendRequest(object.id);
                            });
                            $("#body-bottom-button-response-request-reject").html("Reject Request").on("click",function(){
                                rejectFriendRequest(object.id, ownerId);
                            });

                            // $("#body-bottom-button-send-request").html("Friend Request Received").on("click", function(){
                            //     pullMyFriendRequests();
                            //     $.mobile.changePage("#page-my-friend-requests");
                            //     setCurrLocationHash("#page-my-friend-requests");
                            // });
                        }
                    };
                    CacheCheckFriend(ownerId, friendId, displayFunction2);

                } else {
                    var valid = object.get("valid");

                    if (valid) {
                        $("#body-bottom-button-send-request").html("Start Chat").on("click", function(){
                            startPrivateChat(friendId);
                        });
                    } else {
                        $("#body-bottom-button-send-request").html("Friend Request Sent");
                    }
                }

                /* Currently we can only report a particular activity. The function to report a user will come soon...*/
                // $("#body-bottom-button-report-abuse").html("Report Abuse").on("click", function(){
                //     $.mobile.changePage("#page-event-report");
                // });

            } else {
                $("#body-bottom-button-send-request").hide();
                $("#body-bottom-button-report-abuse").hide();
            }
        };
        CacheCheckFriend(userId, Parse.User.current().id, displayFunction1);
    };
    CacheGetProfileByUserId(userId, displayFunction, {userId: userId});

    displayFunction= function(object, data){  // object: single cachePhoto[i] object
        var photo120 = object.get("profilePhoto120");
        var photoRaw = object.get("profilePhoto");
        if (typeof(photo120) == "undefined") {
            photo120 = "./content/png/Taylor-Swift.png";
        }
        if (typeof(photoRaw) == "undefined") {
            photoRaw = "./content/png/Taylor-Swift-300.png";
        }
        $("#body-user-photo-"+data.userId).html("<img src='"+photo120+"' height='100' width='100' style='border-radius: 3px;' onclick='$(\".ui-black-cover\").fadeIn();$(\"#body-user-profile-full-screen-photo\").fadeIn();'>");
        var htmlString = "<div class='ui-black-cover' style='display:none; position:fixed; width:100%; height:100%; opacity:1; background-color:#000; z-index:1001' onclick='$(\".ui-black-cover\").fadeOut();$(\"#body-user-profile-full-screen-photo\").fadeOut();'><div>";
        htmlString += "<img src='"+photoRaw+"' style='max-height:100%; max-width:100%; height:auto; width:auto; position:absolute; top:-50%; bottom:-50%; left:-50%; right:-50%; margin:auto;' onclick='$(\".ui-black-cover\").fadeOut();$(\"#body-user-profile-full-screen-photo\").fadeOut();'>";
        $("#body-user-profile-full-screen-photo").html(htmlString);
    };
    CacheGetProfilePhotoByUserId(userId, displayFunction, {userId: userId});
}

/* This variable denotes the created time of the last event displayed in the user event list
 */
var currentLastEvent;

/* This function is designed to pull up the user event for the Activities page(id="page-event").
 *
 * Parameters annotation:
 * beforeAt -- corresponding to the "createdAt" attribute of UserEvent;
 * filterMode -- mode used to display user events;
 *
 * beforeAt is used to show more activities;
 * filterMode is used to display activities according to the following rules:
 * filterMode absent or filterMode = 0 == all events (no filter);
 * filterMode = 1 -- filter by time;
 * filterMode = 2 -- filter by location;
 * filterMode = 3 -- customized filter.
 *
 * Modified by Renpeng @ 12:30 4/19/2015
 */
function pullUserEvent(beforeAt, filterMode){
    currentLastEvent = new Date;
    pullLastItem = -1;
    var limitNumber = 15;
    var descendingOrderKey = "createdAt";
    if (typeof(beforeAt) == "undefined") {
        $("#body-event-content-list").addClass("ui-hidden-accessible");
        setTimeout(function(){
            if (pullLastItem != 0) {
                $.mobile.loading("show");
            }
        },350); 
    }

    var displayFunction = function(objects){  // objects: an array of UserEvent objects
        var currentUser = Parse.User.current();
        var owner = currentUser.getUsername();
        pullLastItem = 2 * objects.length;
        if (objects.length < limitNumber)
            $(".ui-load-more-activity").html("No More Activities");
        for (var i=0; i <= objects.length-1; i++) {
            if (Date.parse(currentLastEvent) > Date.parse(objects[i].createdAt))
                currentLastEvent = objects[i].createdAt;
            if ($("#body-event-"+objects[i].id).length == 0) {
                var id = objects[i].id;
                var holder = objects[i].get("owner");
                var newElement = buildUserEventElement(objects[i]);
                $(".ui-load-more-activity").before(newElement);

                pullUserEventHolderInfo(holder, id); // display event owner's name, not the username (which is an email address)

            } else {
                var commentNumber = objects[i].get("commentNumber");
                var goingId = objects[i].get("goingId");
                if (typeof(goingId) == "undefined") {
                    goingId = [];
                }
                var goingNumber = goingId.length;
                var interestId = objects[i].get("interestId");
                if (typeof(interestId) == "undefined") {
                    interestId = [];
                }
                var interestNumber = interestId.length;
                holder = objects[i].get("owner");
                id = objects[i].id;
                $(".comment-statistics-"+id).each(function(){
                    $(this).html(commentNumber.toString()+" Comments");
                });
                $(".interest-statistics-"+id).each(function(){
                    $(this).html(interestNumber.toString()+" Interests");
                });
                $(".going-statistics-"+id).each(function(){
                    $(this).html(goingNumber.toString()+" Goings");
                });

                pullUserEventHolderInfo(holder, id);  // display event owner's name, not the username (which is an email address)
            }
        }
    };

    var obj = {
        // owner: owner,
        // eventId: null,
        limitNumber: limitNumber,
        descendingOrderKey: descendingOrderKey,
        accessibility: "public",
        beforeAt: beforeAt,
        filterMode: filterMode,
        currentTimeInMilliseconds: new Date().getTime(),
        displayFunction: displayFunction
    };

    if (navigator.geolocation){
       navigator.geolocation.getCurrentPosition(function(position) {
           obj.currentLocation = [position.coords.latitude, position.coords.longitude];
       });
    }

    ParsePullEvent(obj);
}

/* This variable...
 */
var imgArray = [];

/* This function is designed to insert photo for preview in the description part
 * when creating a new user event.
 */
function insertDescriptionPreviewPhoto(){
    var fileUploadControl = $("#body-input-insert-description-photo")[0];
    var file = fileUploadControl.files[0];
    if (typeof(file) == "undefined"){
        return;
    }
    imgArray.push({file: file});

    var reader = new FileReader();
    reader.onload = function(e) {
        var curIndex = imgArray.length-1;
        var textValue = $("#body-input-create-event-description").val();
        $("#body-input-create-event-description").val( textValue + "\n");
        var caretPos = $("#body-input-create-event-description").textareaHelper('caretPos');
        var textareaPos = $("#body-input-create-event-description").offset();
       
        var image = new Image();
        image.src = e.target.result;
        var sourceWidth = image.width;
        var sourceHeight = image.height;
        var imgRatio = sourceWidth/sourceHeight;
        sourceWidth = $("#body-input-create-event-description").width()/2; //400;
        sourceHeight = sourceWidth/imgRatio;
        textValue = $("#body-input-create-event-description").val();
        var looptime = sourceHeight/22-1;
        $("#body-input-create-event-description").val( textValue + "<<>>IIIIMMMMMGGGG<<>>"+curIndex.toString()+"\n");
        for(var i = looptime; i > 0; i--){
            textValue = $("#body-input-create-event-description").val();
            $("#body-input-create-event-description").val( textValue + "\n");
        }
        var testPos = $("#body-input-create-event-description").textareaHelper('caretPos');
        $("body").append("<img id='body-description-img"+curIndex.toString()+"' src='"+image.src+"' width='"+sourceWidth+"' height='"+sourceHeight+"'>");
        $("#body-description-img"+curIndex.toString()).offset({ top: (caretPos.top+textareaPos.top), left: textareaPos.left+8});
        var imageObject = imgArray[curIndex];
        imageObject["width"] = sourceWidth;
        imageObject["height"] = sourceHeight;
        imageObject["top"] = caretPos.top;
        imageObject["left"] = caretPos.left;
        var fileUploadControl = $("#body-input-insert-description-photo").val("").clone(true);
        $("#body-input-create-event-description").trigger(jQuery.Event("keyup", {keyCode: $.ui.keyCode.ENTER, which: $.ui.keyCode.ENTER }));
        $("#body-input-create-event-description").textareaHelper('destroy');
    };
    reader.readAsDataURL(file);
}

/* This variable...
 */
var listenKeyup = true;

/* This variable...
 */
var goingToDelete = false;

/* This function is designed to delete photo for preview in the description part
 * when creating a new user event.
 */
function deleteDescriptionPreviewPhoto(e){
    listenKeyup = false;
    var curIndex = imgArray.length-1;
    if(curIndex < 0){
        listenKeyup = true;
        return;
    }

    var $bodyInputCreateEventDescription = $("#body-input-create-event-description");
    var caretPos = $bodyInputCreateEventDescription.textareaHelper('caretPos');
    var curImageObject = imgArray[curIndex];
    var deleteRangeTop = curImageObject.top + curImageObject.height;
    var deleteRangeLeft = curImageObject.left + curImageObject.width;

    if(goingToDelete == true && e.which == 8){ // && caretPos.left < deleteRangeLeft
        console.log("keycode space");
        textValue = $bodyInputCreateEventDescription.val();

        var deleteStrIndex = textValue.indexOf("\n<<>>IIIIMMMMMGGGG<<>>"+curIndex.toString());
        $bodyInputCreateEventDescription.val(textValue.substring(0,deleteStrIndex));
        $("#body-description-img"+curIndex.toString()).remove();
        imgArray.pop();
        //caretPos = $("#body-input-create-event-description").textareaHelper('caretPos');

        goingToDelete = false;
        $bodyInputCreateEventDescription.textareaHelper('destroy');
        listenKeyup = true;
        return;
    }


    while (1) {
        console.log("in while");
        if(caretPos.left < deleteRangeLeft && caretPos.top <= deleteRangeTop){
            var textValue = $bodyInputCreateEventDescription.val();
            $bodyInputCreateEventDescription.val( textValue + " ");
            //$("#body-input-create-event-description").trigger(jQuery.Event("keyup", {keyCode: $.ui.keyCode.SPACE, which: $.ui.keyCode.SPACE}));
            $bodyInputCreateEventDescription.keyup();

            caretPos = $bodyInputCreateEventDescription.textareaHelper('caretPos');
            goingToDelete = true;
        }
        else{
            console.log(goingToDelete);
            break;
        }
    }

    $bodyInputCreateEventDescription.textareaHelper('destroy');
    listenKeyup = true;
}

/* This function is designed to display more options for the event page
 */
function displayEventMoreOption(){
    var $headerCreateNewEventOption = $("#header-create-new-event-option");
    var $headerListMyEventOption = $("#header-list-my-event-option");

    $headerCreateNewEventOption.unbind("click");
    $headerListMyEventOption.unbind("click");

    $("#header-event-more-option").removeClass("ui-header-more-option").addClass("ui-header-more-option-active");
    $(window).unbind("scroll");

    $headerCreateNewEventOption.on("click",function(){
        var date = new Date();
        var timeISO = date.toISOString().split(":");
        var timeLocal = timeISO[0].split("T");
        var timeLocalHour = date.getHours();
        timeLocal[1] = timeLocalHour < 10 ? "0" + timeLocalHour : timeLocalHour;

        time = timeLocal[0] + "T" + timeLocal[1] +":"+timeISO[1];
        $("#body-input-create-event-startTime").val(time);
        $("#body-input-create-event-endTime").val(time);

        $("#body-bottom-create-event-btn").on("click",function(){
            createUserEvent();
        });
        hiddenEventMoreOption();
    });

    $headerListMyEventOption.on("click",function(){
        pullMyEvent();
        hiddenEventMoreOption();
    });

    var $$optionHiddenCoverLayer = $(".options-hidden-cover-layer");
    $$optionHiddenCoverLayer.show();
    $(".page-right-top-options").fadeIn("fast");
    $$optionHiddenCoverLayer.on("click",hiddenEventMoreOption).on("swipeleft",hiddenEventMoreOption).on("swiperight",hiddenEventMoreOption);
    $(window).scroll(hiddenEventMoreOption);
}

/* This function is designed to hide more options for the event page
 */
function hiddenEventMoreOption(){
    $("#header-create-new-event-option").unbind("click");
    $("#header-list-my-event-option").unbind("click");
    $("#header-event-more-option").removeClass("ui-header-more-option-active").addClass("ui-header-more-option");
    $(window).unbind("scroll");
    $(".options-hidden-cover-layer").hide();
    $(".page-right-top-options").fadeOut("fast");
}

/* This function is designed to display event filter modes for the event page
 */
function displayEventFilterModeMoreOption(){
    var $bodyBottomHidingEventFilterMoreOption = $("#body-bottom-hiding-event-filter-more-option");
    $bodyBottomHidingEventFilterMoreOption.css("position","fixed").css("bottom",(-$bodyBottomHidingEventFilterMoreOption.height()).toString()+"px").show();

    $("body").append("<div class='ui-gray-cover' style='position:fixed; width:100%; height:100%; opacity:0; background-color:#000; z-index:1001' onclick='hiddenEventFilterModeMoreOption()'><div>");
    $bodyBottomHidingEventFilterMoreOption.animate({
        bottom: "0px"
    },300);
    $(".ui-gray-cover").animate({
        opacity: 0.15
    },300);
}

/* This function is designed to hide event filter modes for the event page
 */
function hiddenEventFilterModeMoreOption(){
    var $bodyBottomHidingEventFilterMoreOption = $("#body-bottom-hiding-event-filter-more-option");
    $bodyBottomHidingEventFilterMoreOption.animate({
        bottom: (-$bodyBottomHidingEventFilterMoreOption.height()).toString()+"px"
    },300,function(){
        $bodyBottomHidingEventFilterMoreOption.hide();
    });

    $(".ui-gray-cover").animate({
        opacity: 0
    },300, function(){
        $(".ui-gray-cover").remove();
    });
}

/* This function is designed to create user events.
 */
function createUserEvent(){
    var currentUser = Parse.User.current();
    var owner = currentUser.getUsername();

    var title = $("#body-input-create-event-title").val();
    var location = $("#body-input-create-event-location").val();
    var startTime = $("#body-input-create-event-startTime").val().replace("T", " ");
    var endTime = $("#body-input-create-event-endTime").val().replace("T", " ");
    var startTimeInMilliseconds = new Date($("#body-input-create-event-startTime").val()).getTime();
    var endTimeInMilliseconds = new Date($("#body-input-create-event-endTime").val()).getTime();
    var errorHandler = function(item) {
        var $bodyInputCreateEvent = $("#body-input-create-event-" + item);
        $bodyInputCreateEvent.focus().parent().addClass("ui-custom-event-create-focus");

        if ($("#body-input-create-event-" + item + "-alert").length == 0) {
            $bodyInputCreateEvent.parent().after("<p id='body-input-create-event-" + item + "-alert' class='event-create-alert'>*Field required</p>");
        }

        setTimeout(function(){
            $bodyInputCreateEvent.focus().parent().removeClass("ui-custom-event-create-focus");
        }, 500);

        $bodyInputCreateEvent.change(function(){
            $("#body-input-create-event-" + item + "-alert").remove();
            $bodyInputCreateEvent.unbind("change");
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

    $("#body-bottom-create-event-btn").unbind("click");

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

    var visibility = $("#body-input-create-event-visibility").val()=="on";
    var description = $("#body-input-create-event-description").val();
    var errorObject = $("#body-create-event-error");
    var destID = "#page-event";

    var displayFunction = function(object){  // object: single UserEvent object
        $("#body-input-create-event-title").val("");
        $("#body-input-create-event-location").val("");
        $("#body-input-create-event-startTime").val("");
        $("#body-input-create-event-endTime").val("");
        $("#body-input-create-event-description").val("");
        $("#body-input-create-event-visibility").val("on").flipswitch("refresh");
        $("#body-create-event-error").html("");

        var id = object.id;
        var holder = object.get("owner");
        var newElement = buildUserEventElement(object);
        $("#body-event-content-list").prepend(newElement);

        pullUserEventHolderInfo(holder, id); // display event owner's name, not the username (which is an email address)
    };
    ParseEventCreate(owner, title, location, time, startTimeInMilliseconds, endTimeInMilliseconds, visibility, description, errorObject, destID, displayFunction);
}

/* This function is designed to build up the comment elements when displaying event details..
 */
function buildCommentInEventDetail(object){
    var commentId = object.id;
    var ownerName = object.get("ownerName");
    var text = object.get("content");
    var time = object.createdAt;

    var newElement = "";
    newElement += "<div id='comment-"+commentId+"' class='ui-custom-comment-left' onclick='replyCommentToUser({id:\""+object.get('owner')+"\", name:\""+ownerName+"\"})'>";
    newElement += "<div class='ui-comment-owner'>"+ownerName+"</div>";
    newElement += "<div class='ui-comment-time'>"+convertTime(time)+"</div>";
    newElement += "<div class='ui-footer-bar-input-comment-content'>"+text+"</div>";
    newElement += "</div>";

    return newElement;
}

/* This function is designed to build up elements for displaying event details.
 */
function buildEventDetailElement(object){
    var title = object.get("title");
    var location = object.get("location");
    var time = object.get("time");
    var visibility = object.get("visibility");
    var description = object.get("description");
    var commentNumber = object.get("commentNumber");
    var holder = object.get("owner");
    var goingId = object.get("goingId");
    if (typeof(goingId) == "undefined") {
        goingId = [];
    }
    var goingNumber = goingId.length;
    var interestId = object.get("interestId");
    if (typeof(interestId) == "undefined") {
        interestId = [];
    }
    var interestNumber = interestId.length;
    var id = object.id;
    var newElement = "";
    newElement = newElement + "<div id=\'body-event-detail-"+id+"\'>";
    newElement = newElement + "<div class='custom-corners-public custom-corners'>";
    newElement = newElement + "<div class='ui-bar ui-bar-a' style='cursor:pointer' onclick=\"$.mobile.changePage(\'#page-display-user-profile\');\">";
    newElement = newElement + "<div><strong id=\'body-top-bar-event-detail-"+id+"-owner-name\'></strong></div>";
    newElement = newElement + "<div id=\'body-top-bar-event-detail-"+id+"-owner-gender\' class=\'ui-icon-custom-gender\'></div>";
    newElement = newElement + "</div>";
    newElement = newElement + "<div class='ui-body ui-body-a'>";
    newElement = newElement + "<p class='ui-custom-event-title'>" + title + "</p>";
    if (description.length == 0) {
        newElement = newElement + "<p class='ui-custom-event-description-less-margin'></br></p>";
    } else {
        newElement = newElement + "<p class='ui-custom-event-description'>" +  description.replace("\n","</br>") + "</p>";
    }
    newElement = newElement + "<p class='ui-custom-event-location'>" + location + "</p>";
    newElement = newElement + "<p class='ui-custom-event-time'>" + time + "</p>";
    newElement = newElement + "<div class='event-statistics comment-statistics-"+id+"' style='clear:both'>" + commentNumber + " Comments</div><div class='event-statistics interest-statistics-"+id+"'>" + interestNumber + " Interests</div><div class='event-statistics going-statistics-"+id+"'>" + goingNumber + " Goings</div>";
    newElement = newElement + "</div>";
    newElement = newElement + "<div class='ui-footer ui-bar-custom'>";
    if (interestId.indexOf(Parse.User.current().id) < 0) {
        newElement += "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-favor-false interest-button-"+id+"' onclick='addInterestEvent(\""+id+"\")'>"+"Interest"+"</a></div>"
    } else {
        newElement += "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-favor-true interest-button-"+id+"' onclick='removeInterestEvent(\""+id+"\")'>"+"Interest"+"</a></div>"
    }
    if (goingId.indexOf(Parse.User.current().id) < 0) {
        newElement = newElement + "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-going-false going-button-"+id+"' onclick='addGoingEvent(\""+id+"\")'>"+"Going"+"</a></div>";
    } else {
        newElement = newElement + "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-going-true going-button-"+id+"' onclick='removeGoingEvent(\""+id+"\")'>"+"Going"+"</a></div>";
    }
    newElement = newElement + "</div>";
    newElement = newElement + "</div>";
    newElement = newElement + "</div>";

    return newElement;
}

/* This function is designed to update the details of an event when displaying it.
 */
function updateEventDetail(id){
    $("#body-content-event-detail").html("");
    $("#footer-bar-event-id-label").html(id);

    // display the UserEvent object info
    var descendingOrderKey = "createdAt";
    var displayFunction = function(objects){  // objects: an array of UserEvent objects
        shareEvents(objects[0]);
        var id = objects[0].id;
        var holder = objects[0].get("owner");
        $("#body-content-event-detail").prepend(buildEventDetailElement(objects[0]));
        pullUserEventHolderInfo(holder, "detail-"+id); // display event owner's name, not the username (which is an email address)

        $(".ui-custom-report").on("click",function(){
            reportActivity(id);
        });
    };
    ParseSelectEvent(id, displayFunction);

    // display the comments in this event
    displayFunction = function(objects) { // objects: an array of Comment objects
        $("#body-content-event-detail").append("<div id='body-content-bottom-event-comments-list' class='ui-custom-comment-container'></div>");
        for (var i=0; i<=objects.length-1; i++) {
            // build the comment content
            var newElement = buildCommentInEventDetail(objects[i]);
            $("#body-content-bottom-event-comments-list").append(newElement);
            
            // build the user's profile photo
            var displayFunction1 = function(object, data) {  // object: single cachePhoto[i] object
                var photo120 = object.get("profilePhoto120");
                if (typeof(photo120) == "undefined") {
                    photo120 = "./content/png/Taylor-Swift.png";
                }
                $("#comment-"+data.commentId).css("backgroundImage", "url("+photo120+")")
            };
            CacheGetProfilePhotoByUserId(objects[i].get("owner"), displayFunction1, {commentId: objects[i].id});
        }
    };
    ParsePullEventComment(id, descendingOrderKey, displayFunction);
}

/* This function is designed to display the hidden options on event detail page.
 */
function displayEventDetailMoreOption(){
    $("#header-event-detail-more-option").removeClass("ui-header-more-option").addClass("ui-header-more-option-active");

    var $bodyBottomEventDetailMoreOption = $("#body-bottom-event-detail-more-option");
    $bodyBottomEventDetailMoreOption.css("position","fixed").css("bottom",(-$bodyBottomEventDetailMoreOption.height()).toString()+"px").show();

    $("body").append("<div class='ui-gray-cover' style='position:fixed; width:100%; height:100%; opacity:0; background-color:#000; z-index:4' onclick='hideEventDetailMoreOption()'><div>");
    $bodyBottomEventDetailMoreOption.animate({
        bottom: "0px"
    },300);
    $(".ui-gray-cover").animate({
        opacity: 0.2
    },300);
}

/* This function is designed to hide unnecessary options on event detail page.
 */
function hideEventDetailMoreOption(){
    $("#header-event-detail-more-option").addClass("ui-header-more-option").removeClass("ui-header-more-option-active");

    var $bodyBottomEventDetailMoreOption = $("#body-bottom-event-detail-more-option");
    $bodyBottomEventDetailMoreOption.animate({
        bottom: (-$bodyBottomEventDetailMoreOption.height()).toString()+"px"
    },300,function(){
        $bodyBottomEventDetailMoreOption.hide();
    });

    $(".ui-gray-cover").animate({
        opacity: 0
    },300, function(){
        $(".ui-gray-cover").remove();
    });
}

/* This function is designed to enable comment reply to a specific user and focus the comment input box
 */
function replyCommentToUser(replyTo) {
    $("#footer-bar-reply-to-id-label").html(replyTo.id);
    $("#footer-bar-input-comment-content").attr("placeholder","@"+replyTo.name);
    $("#footer-bar-form-comment > .custom-block-a").click();
}

/* This function is designed to send comments to Parse server database
 */
function sendComment(){
    var eventId = $("#footer-bar-event-id-label").html();
    var replyToUserId = $("#footer-bar-reply-to-id-label").html();
    if (typeof(replyToUserId) == "undefined") {
        replyToUserId = "";
    }

    var $footerBarInputCommentContent = $("#footer-bar-input-comment-content");
    var replyToUserName = $footerBarInputCommentContent.attr("placeholder");

    var currentUser = Parse.User.current();
    var owner = currentUser.id;
    var content = $footerBarInputCommentContent.val();
    if (content == "") {
        return;
    }

    if (replyToUserId.length > 0) {
        content = replyToUserName + "  " + content;
    }

    $footerBarInputCommentContent.val("");
    if (content.length==0) {
        return;
    }

    var errorFunction = function(error){
        $.mobile.loading( "show", {
            text: error,
            textVisible: true,
            theme: "a",
            textonly: true,
            html: ""
        });
        setTimeout( function(){$.mobile.loading( "hide" );}, 2000);
    };

    var successFunction = function(object, option){  // object: single Comment object
        var eventId = object.id;
        var ownerName = object.get("owner");
        var replyToUserId = option.replyToUserId;
        var commentNumber = object.get("commentNumber");
        updateEventDetail(eventId);
        $(".comment-statistics-"+eventId).each(function(){
            $(this).html(commentNumber.toString()+" Comments");
        });

        var title = object.get("title");
        if (title.length>10) {
            title = title.slice(0,6) + "...";
        }

        // push notification to the user been replied
        if (typeof(replyToUserId) != "undefined" && replyToUserId != null) {
            pushNotificationToDeviceByUserId(replyToUserId, 
                Parse.User.current().get("name")+" replied your comment on activity \'"+title+"\'.")
        }

        // push notification to owner
        var displayFunction = function(object, data) { // object: single cacheUser[i] object
            if (object.id.localeCompare(data.replyToUserId) != 0) {
                pushNotificationToDeviceByUserId(object.id, 
                    Parse.User.current().get("name")+" commented on your activity \'"+title+"\'.");
            }
        };
        CacheGetProfileByUsername(ownerName, displayFunction, {replyToUserId: replyToUserId});

        $("#footer-bar-input-comment-content").blur();
    };

    if (replyToUserId.length == 0) {
        replyToUserId = null;
    }

    ParseAddEventComment(eventId, owner, content, {
        replyToUserId: replyToUserId,
        errorFunction: errorFunction, 
        successFunction: successFunction
    });
}

/* This function is designed to report inappropriate activities
 */
function reportActivity(id){
    var hiddenUserEvent = function(object){ // object: single UserEvent object
        var id = object.id;
        $("#body-event-" + id).remove();
        $.mobile.changePage("#page-event");
    };
    ParseUpdateReport(id, hiddenUserEvent); 
}

/* This function is designed to build up elements for my events.
 */
function buildMyUserEventElement(object){
    var owner = object.get("owner");
    var title = object.get("title");
    var location = object.get("location");
    var time = object.get("time");
    var visibility = object.get("visibility");
    var description = object.get("description");
    var interestNumber = 0;
    if (typeof(object.get("interestId")) != "undefined")
        interestNumber = object.get("interestId").length;
    var commentNumber = object.get("commentNumber");
    var goingId = object.get("goingId");
    if (typeof(goingId) == "undefined"){
        goingId = [];
    }
    var goingNumber = goingId.length;
    var id = object.id;
    var newElement = "";
    newElement += "<div id='body-my-event-"+id+"'>";
    newElement += "<div class='custom-corners custom-corners-public'>";
    newElement += "<div class='ui-body ui-body-a' style='border-top-width: 0; margin-top: 0;'>";
    newElement += "<p class='ui-custom-event-title'>" + title + "</p>";
    if (location.length > 0) {
        newElement += "<p class='ui-custom-event-location'>" + location + "</p>";
    }
    if (time.length > 0) {
        newElement += "<p class='ui-custom-event-time'>" + time + "</p>";
    }
    if ((location.length == 0) && (time.length == 0)) {
        newElement += "<p class='ui-custom-event-description-less-margin'>" + description.replace("\n","</br>") + "</p>";
    } else {
        newElement += "<p class='ui-custom-event-description'>" + description.replace("\n","</br>") + "</p>";
    }
    newElement += "<div class='event-statistics comment-statistics-"+id+"'>" + commentNumber + " Comments</div><div class='event-statistics interest-statistics-"+id+"'>" + interestNumber + " Interests</div><div class='event-statistics going-statistics-"+id+"'>" + goingNumber + " Goings</div>";
    newElement += "</div>";
    newElement += "<div class='ui-footer ui-bar-custom'>";
    newElement += "<div class='ui-custom-float-left'><a href='#page-event-detail' data-transition='slide' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-comment' id='my-comment-button-"+id+"' onclick=\"updateEventDetail('"+id+"'); setCurrLocationHash('#page-event-delete')\">"+"Detail"+"</a></div>";
    newElement += "<div class='ui-custom-float-left'><a href='#page-event-delete' data-transition='slideup' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-delete' id='my-comment-button-"+id+"' onclick=\"deleteMyEvent('"+id+"'); setCurrLocationHash('#page-event-delete')\">"+"Delete"+"</a></div>";
    newElement += "<div class='ui-custom-float-left'><a href='#page-edit-event' data-transition='slide' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-edit' id='my-comment-button-"+id+"' onclick=\"editMyEvent('"+id+"'); setCurrLocationHash('#page-event-delete')\">"+"Edit"+"</a></div>";
    newElement += "</div>";
    newElement += "</div>";
    newElement += "</div>";

    return newElement;
}

/* This variable ...
 */
var selectedElement="";

/* This variable ...
 */
var animateDuration=150;

/* This function is designed to pull up my events.
 */
function pullMyEvent(beforeAt){
    var currentUser = Parse.User.current();
    var owner = currentUser.getUsername();
    var descendingOrderKey = "createdAt";

    var displayFunction = function(objects){ // objects: an array of UserEvent objects
        for (var i=objects.length-1; i >= 0; i--) {
            if ($("#body-my-event-list > #body-my-event-"+objects[i].id).length == 0) {
                $("#body-my-event-list").prepend(buildMyUserEventElement(objects[i]));
            } else {
                var commentNumber = objects[i].get("commentNumber");
                var interestNumber = 0;
                if (typeof(objects[i].get("interestId")) != "undefined")
                    interestNumber = objects[i].get("interestId").length;
                var goingId = objects[i].get("goingId");
                if (typeof(goingId) == "undefined"){
                    goingId = [];
                }
                var goingNumber = goingId.length;
                var id = objects[i].id;
                $(".comment-statistics-"+id).each(function(){$(this).html(commentNumber.toString()+" Comments");});
                $(".interest-statistics-"+id).each(function(){$(this).html(interestNumber.toString()+" Interests");});
                $(".going-statistics-"+id).each(function(){$(this).html(goingNumber.toString()+" Goings");});
            }
        }
    };
    ParsePullEvent({
        owner: owner,
        descendingOrderKey:descendingOrderKey,
        beforeAt: beforeAt,
        displayFunction: displayFunction
    });
}

/* This function is designed to delete my event.
 */
function deleteMyEvent(eventId){
    $(".ui-custom-delete-confirm").click(function(){
        var displayFunction = function(eventId){
            $("#body-my-event-"+eventId).slideUp("fast", function(){
                $("#body-event-"+eventId).remove();
                $("#body-my-event-"+eventId).remove();
            });
        };
        ParseDeleteEvent(eventId, displayFunction);
    });
}

/* This function is designed to edit my event.
 */
function editMyEvent(eventId){
    var displayFunction = function(objects){ // objects: an array of UserEvent objects
        $("#body-input-edit-event-title").val(objects[0].get("title"));
        $("#body-input-edit-event-location").val(objects[0].get("location"));
        var time = objects[0].get("time").split(" -- ");
        $("#body-input-edit-event-startTime").val(time[0].replace(" ", "T"));
        $("#body-input-edit-event-endTime").val(time[1].replace(" ", "T"));
        if(objects[0].get("visibility") == false){
            $("#body-select-edit-event-visibility").val("Friends");
        }
        $("#body-input-edit-event-description").val(objects[0].get("description"));
        $("#body-bottom-edit-event-save").on("click",function(){
            editSaveUserEvent(eventId);
        });
    };
    ParsePullEvent({eventId: eventId, displayFunction: displayFunction});
}

/* This function is designed to save my event after editing.
 */
function editSaveUserEvent(eventId){
    var currentUser = Parse.User.current();
    var owner = currentUser.getUsername();

    var title = $("#body-input-edit-event-title").val();
    var location = $("#body-input-edit-event-location").val();
    var startTime = $("#body-input-edit-event-startTime").val().replace("T", " ");
    var endTime = $("#body-input-edit-event-endTime").val().replace("T", " ");
    var startTimeInMilliseconds = new Date($("#body-input-edit-event-startTime").val()).getTime();
    var endTimeInMilliseconds = new Date($("#body-input-edit-event-endTime").val()).getTime();

    var errorHandler = function(item) {
        var $bodyInputEventEdit = $("#body-input-event-edit-" + item);
        $bodyInputEventEdit.focus().parent().addClass("ui-custom-event-edit-focus");

        if ($("#body-input-event-edit-" + item + "-alert").length == 0) {
            $bodyInputEventEdit.parent().after("<p id='body-input-event-edit-" + item + "-alert' class='event-edit-alert'>*Field required</p>");
        }

        setTimeout(function(){
            $bodyInputEventEdit.focus().parent().removeClass("ui-custom-event-edit-focus");
        }, 500);

        $bodyInputEventEdit.change(function(){
            $("#body-input-event-edit-" + item + "-alert").remove();
            $bodyInputEventEdit.unbind("change");
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

    $("#body-bottom-edit-event-save").unbind("click");

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

    var visibility = $("#body-select-edit-event-visibility").val()=="on";
    var description = $("#body-input-edit-event-description").val();
    var errorObject = $("#body-edit-event-error");
    var destID = "#page-event-my-event";

    var displayFunction = function(object){  // object: single UserEvent object

        // clear the page-event-my-event
        $("#body-input-edit-event-title").val("");
        $("#body-input-edit-event-location").val("");
        $("#event-edit-start-time").val("");
        $("#event-edit-end-time").val("");
        $("#body-input-edit-event-description").val("");
        $("#body-select-edit-event-visibility").val("on").flipswitch("refresh");
        $("#body-edit-event-error").html("");

        // rebuild element in page-event-my-event
        var id = object.id;
        var newElement = buildMyUserEventElement(object);
        var oldElement = $("#body-my-event"+id);
        oldElement.before(newElement);
        oldElement.remove();

        // rebuild element in page-event
        id = object.id;
        var holder = object.get("owner");
        newElement = buildUserEventElement(object);
        oldElement = $("#body-event"+id);
        oldElement.before(newElement);
        oldElement.remove();

        pullUserEventHolderInfo(holder, id); // display event owner's name, not the username (which is an email address)

        // push notification to users who are on the going list
        if (typeof(object.get("goingId")) == "undefined") {
            var goingId = [];
        } else {
            goingId = object.get("goingId");
        }
        var goingUsrId;
        var title = object.get("title");
        if (title.length>10) {
            title = title.slice(0,6) + "...";
        }
        for (var i=0; i< goingId.length; i++) {
            goingUsrId = goingId[i];
            pushNotificationToDeviceByUserId(goingUsrId, Parse.User.current().get("name")+" updated the activity \'" +title+ "\'.");
        }
    };
    ParseEventEditSave(owner, title, location, time, startTimeInMilliseconds, endTimeInMilliseconds, visibility, description, errorObject, destID, displayFunction, eventId);
}

/* This function is designed to share user event by email.
 */
function shareEvents(object){
     // var body = "<html><head><style></style></head><body> <div class = 'messagebody' style = 'background-color: #ffffff'></div>sgag</body></html>" ;
    // var body = "<html><head><style>.messagebody{  max-width:320px;height: 320px;margin: 100 auto;color: #DAB84F;} "  +
    //            ".eventtitle{font-size: 16px;} .event{font-size: 13px;}</style></head><body><div class = 'messagebody' style = 'background-image:url(\"letter320.png\"); background-color: #ffffff'>" ;
    //     body += "<p align = center class = 'event' style='padding-top:110px'>Please join us!</p>";
    //     body = body + "<p align = center class = 'eventtitle' style='padding-top:110px'><a href=\'"+ window.location.hostname + "/share.html?id="+object.id +"\'>" + object.get("title") + "</a></p>";
    // var time = object.get("time").split(" -- ")[0];
    // var date = time.substring(0, time.indexOf(" "));
    // var hour = time.substring(time.indexOf(" ")+1, time.length);
    //     body += "<p align = center class = 'event' >" + date + "</p>";
    //     body += "<p align = center class = 'event' >" + hour + "</p>";
    //     body += "<p align = center class = 'event' >" + object.get("location") + "</p>";
    //     body += "</div></body></html>"

    // var link = "mailto:?subject=There is a fantastic activity : " + object.get("title") + "&body="+ encodeURI(body);

    // $(".share-btn").attr("href", link);
    //   console.log("****" + $(".share-btn").attr("href"));
    // createSharePage(object);

    /******************* modified by Yaliang ********/
    //var eventLink = window.location.hostname + "/mi/share.html?id="+object.id;
    //var eventLink = window.location.pathname.split( '/' )[0] +  "/share.html?id="+object.id;
    var eventLink = "http://yuemeuni.tk/share.html?id="+object.id;
    console.log(window.location.href);
    console.log(eventLink);
    var time = object.get("time").split(" -- ")[0];
    var date = time.substring(0, time.indexOf(" "));
    var hour = time.substring(time.indexOf(" ")+1, time.length);
    /******************* modified by Yaliang ********/
    // var mailbody = "Please join us!\n\n Event: " + object.get("title") + "\nDate: " + date + " \nTime: " + hour;
    //     mailbody += "\n See detail on this link: " + eventLink;
    var mailbody = "Please join us!\n\nEvent: " + object.get("title") + "\nDate: " + date + " \nTime: " + hour;
        mailbody += "\nSee detail on this link:\n\n" + eventLink;
    var mail = "mailto:?subject=There is a fantastic activity : " + object.get("title") + "&body="+ encodeURI(mailbody);
    $(".share-via-mail").attr("href", mail);
    var smsbody = "Check out this event on Yueme:\n\n" + eventLink;
    var sms = "sms:";
    if ((deviceIsIOS) && (deviceIOSVersion == 8)) {
        sms += "&";
    } else if (deviceIsIOS) {
        sms += ";";
    } else {
        sms += "?";
    }
    sms += "body=";
    sms += encodeURI(smsbody)
    $(".share-via-sms").attr("href", sms);

    // hideEventDetailMoreOption();
}