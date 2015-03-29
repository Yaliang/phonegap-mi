// general functions
function addInterestEvent(eventId){
    var displayFunction = function(object){
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

function removeInterestEvent(eventId){
    var displayFunction = function(object) {
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

function addGoingEvent(eventId){
    var currentUser = Parse.User.current();
    var displayFunction = function(object){
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

function removeGoingEvent(eventId){
    var currentUser = Parse.User.current();
    var displayFunction = function(object){
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

// #page-event functions
var pullLastItem=0;

function pullUserEventHolderInfo(holder, elementIdBase){
    var displayFunction = function(object, data) {
        var name = object.get("name");
        var gender = object.get("gender");
        var userId = object.id;
        var elementIdBase = data.elementIdBase;

        $("#body-event-"+data.elementIdBase+" > .custom-corners > .ui-bar").click(function(){
            displayUserProfile(userId);
        });
        $("#body-top-bar-event-"+elementIdBase+"-owner-name").html(name);
        if (typeof(gender) == "undefined") {
            //$("#"+eventId+"-owner-gender").html(gender.toString());
        } else if (gender) {
            $("#body-top-bar-event-"+elementIdBase+"-owner-gender").css("backgroundImage","url('./content/customicondesign-line-user-black/png/male-white-20.png')");
            $("#body-top-bar-event-"+elementIdBase+"-owner-gender").css("backgroundColor","#8970f1");
        } else {
            $("#body-top-bar-event-"+elementIdBase+"-owner-gender").css("backgroundImage","url('./content/customicondesign-line-user-black/png/female1-white-20.png')");
            $("#body-top-bar-event-"+elementIdBase+"-owner-gender").css("backgroundColor","#f46f75");
        }
        
        pullLastItem = pullLastItem - 1;
        if (pullLastItem == 0) {
            $("#body-event-content-list").removeClass("ui-hidden-accessible");
            $.mobile.loading("hide");
        }

        var displayFunction = function(object, data){
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
    //ParseGetProfile(holder, displayFunction, eventId);
}

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
        goingId =     [];
    }
    var goingNumber = goingId.length;
    var interestId = object.get("interestId");
    if (typeof(interestId) == "undefined") {
        interestId =     [];
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

// #page-display-user-profile
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

function displayUserProfile(userId){
    $("#body-user-profile").html("<div id='body-user-photo-"+userId+"' class='ui-user-profile-photo'></div>");
    var displayFunction= function(object, data){
        $("#body-user-photo-"+data.userId).after(buildUserProfileDetailElement(object));
        var displayFunction1 = function(ownerId, friendId, cacheFriendObject) {
            if (ownerId !== friendId) {
                if (typeof(cacheFriendObject) == "undefined") {
                    var displayFunction2 = function(ownerId, friendId, cacheFriendObject) {
                        if (typeof(cacheFriendObject) == "undefined") {
                            $("#body-bottom-button-send-request").html("Send Friend Request").on("click", function(){
                                sendFriendRequest(ownerId);
                            });
                        } else {
                            $("#body-bottom-button-send-request").html("Friend Request Received").on("click", function(){
                                pullMyFriendRequests();
                                $.mobile.changePage("#page-my-friend-requests");
                                setCurrLocationHash("#page-my-friend-requests");
                            });
                        }
                    };
                    CacheCheckFriend(ownerId, friendId, displayFunction2);

                } else {
                    var valid = cacheFriendObject.get("valid");

                    if (valid) {
                        $("#body-bottom-button-send-request").html("Start Chat").on("click", function(){
                            startPrivateChat(friendId);
                        });
                    } else {
                        $("#body-bottom-button-send-request").html("Friend Request Sent");
                    }
                }

                // this report for activity not for user
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

    displayFunction= function(object, data){
        var photo120 = object.get("profilePhoto120");
        if (typeof(photo120) == "undefined") {
            photo120 = "./content/png/Taylor-Swift.png";
        }
        $("#body-user-photo-"+data.userId).html("<img src='"+photo120+"' height='100' width='100' style='border-radius: 3px;'>")
    };
    CacheGetProfilePhotoByUserId(userId, displayFunction, {userId: userId});


}

var currentLastEvent;

function pullUserEvent(beforeAt){
    currentLastEvent = new Date;
    pullLastItem = -1;
    var limitNumber = 15;
    var descendingOrderKey = "createdAt";
    //var ascendingOrderKey = "createdAt";
    if (typeof(beforeAt) == "undefined") {
        $("#body-event-content-list").addClass("ui-hidden-accessible");
        setTimeout(function(){
            if (pullLastItem != 0) {
                $.mobile.loading("show");
            }
        },350); 
    }
    var displayFunction = function(objects){
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
                // display event holder's name | not the email one
                pullUserEventHolderInfo(holder, id);

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

var imgArray = [];

function insertDescriptionPreviewPhoto(){
    
    var fileUploadControl = $("#body-input-insert-description-photo")[0];
    var file = fileUploadControl.files[0];
    console.log("imgArray length:" + imgArray.length);
    imgArray.push(file);
    console.log("after push length:" + imgArray.length);



    if (typeof(file) == "undefined"){
        console.log("dhsjkdfhskdfhksd");
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        console.log("onload start");
        var curIndex = imgArray.length;
        console.log("curIndex"+imgArray.length);
        var textValue = $("#body-input-create-event-description").val();
        $("#body-input-create-event-description").val( textValue + "\n");
        var caretPos = $("#body-input-create-event-description").textareaHelper('caretPos');
        var textareaPos = $("#body-input-create-event-description").offset();
       
        

        var image = new Image();
        image.src = e.target.result;
        var sourceWidth = image.width;
        var sourceHeight = image.height;
        var imgRatio = sourceWidth/sourceHeight;
        console.log("ori image width:" + sourceWidth+"  height:"+sourceHeight+" ratio:"+imgRatio);
        sourceWidth = $("#body-input-create-event-description").width();
        sourceHeight = sourceWidth/imgRatio;
        console.log("after image width:" + sourceWidth+"  height:"+sourceHeight+" ratio:"+imgRatio);
        console.log("before top:"+caretPos.top+"  left:"+caretPos.left);
        textValue = $("#body-input-create-event-description").val();
        var looptime = sourceHeight/22+1;
        console.log("looptime" + looptime);
        $("#body-input-create-event-description").val( textValue + "\nThe looptime is " + looptime);
        for(var i = looptime; i > 0; i--){
            console.log("in for loop");
            textValue = $("#body-input-create-event-description").val();
            $("#body-input-create-event-description").val( textValue + "\n");
        }
        //$("#body-input-create-event-description").val( textValue + "\n\n\n\n");
        var testPos = $("#body-input-create-event-description").textareaHelper('caretPos');
        $("body").append("<img id='body-description-img"+(curIndex-1).toString()+"' src='"+image.src+"' width='"+sourceWidth+"' height='"+sourceHeight+"'>");
        $("#body-description-img"+(curIndex-1).toString()).offset({ top: (caretPos.top+textareaPos.top), left: textareaPos.left });
        console.log("after top:"+testPos.top+"  left:"+testPos.left);
    };
    reader.readAsDataURL(file);
}

function displayEventMoreOption(){
    $("#header-create-new-event-option").unbind("click");
    $("#header-list-my-event").unbind("click");
    $("#header-event-more-option").removeClass("ui-header-event-more-option");
    $("#header-event-more-option").addClass("ui-header-event-more-option-active");
    $(window).unbind("scroll");
    $("#header-create-new-event-option").on("click",function(){
        var date = new Date().toISOString();
        var timeRes = date.split(":");
        time = timeRes[0]+":"+timeRes[1];
        $("#body-input-create-event-startTime").val(time);
        $("#body-input-create-event-endTime").val(time);

        $("#body-bottom-create-event-btn").on("click",function(){
            createUserEvent();
        });
        hiddenEventMoreOption();
    });
    $("#header-list-my-event").on("click",function(){
        pullMyEvent();
        hiddenEventMoreOption();
    });
    $(".options-hidden-cover-layer").show();
    $(".event-page-right-top-options").fadeIn("fast");
    $(".options-hidden-cover-layer").on("click",hiddenEventMoreOption);
    $(".options-hidden-cover-layer").on("swipeleft",hiddenEventMoreOption);
    $(".options-hidden-cover-layer").on("swiperight",hiddenEventMoreOption);
    $(window).scroll(hiddenEventMoreOption)
}

function hiddenEventMoreOption(){
    $("#header-create-new-event-option").unbind("click");
    $("#header-list-my-event").unbind("click");
    $("#header-event-more-option").removeClass("ui-header-event-more-option-active");
    $("#header-event-more-option").addClass("ui-header-event-more-option");
    $(window).unbind("scroll");
    $(".options-hidden-cover-layer").hide();
    $(".event-page-right-top-options").fadeOut("fast");
}

// #page-create-event functions
function createUserEvent(){
    var currentUser = Parse.User.current();
    var owner = currentUser.getUsername();

    var title = $("#body-input-create-event-title").val();
    var location = $("#body-input-create-event-location").val();
    var startTime = $("#body-input-create-event-startTime").val().replace("T", " ");
    var endTime = $("#body-input-create-event-endTime").val().replace("T", " ");

    var errorHandler = function(item) {
        $("#body-input-create-event-" + item).focus().parent().addClass("ui-custom-event-create-focus");
        if ($("#body-input-create-event-" + item + "-alert").length == 0) {
            $("#body-input-create-event-" + item).parent().after("<p id='body-input-create-event-" + item + "-alert' class='event-create-alert'>*Field required</p>");
        }

        setTimeout(function(){
            $("#body-input-create-event-" + item).focus().parent().removeClass("ui-custom-event-create-focus");
        }, 500);

        $("#body-input-create-event-" + item).change(function(){
            $("#body-input-create-event-" + item + "-alert").remove();
            $("#body-input-create-event-" + item).unbind("change");
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
    var displayFunction = function(object){
        $("#body-input-create-event-title").val("");
        $("#body-input-create-event-location").val("");
        $("#body-input-create-event-startTime").val("");
        $("#body-input-create-event-endTime").val("");
        $("#body-input-create-event-description").val("");
        $("#body-input-create-event-visibility").val("on").flipswitch("refresh");
        $("#body-create-event-error").html("");
        //pullUserEvent();
        var id = object.id;
        var holder = object.get("owner");
        var newElement = buildUserEventElement(object);
        $("#body-event-content-list").prepend(newElement);
        // display event holder's name | not the email one
        pullUserEventHolderInfo(holder, id);
    };
    ParseEventCreate(owner, title, location, time, visibility, description, errorObject, destID, displayFunction);
}

// #page-event-detail functions
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

// update the detail of event when the user clicked to the page-event-detail
function updateEventDetail(id){
    $("#body-content-event-detail").html("");
    $("#footer-bar-event-id-label").html(id);

    // display the UserEvent object info
    var descendingOrderKey = "createdAt";
    var displayFunction = function(object){
        var id = object[0].id;
        var holder = object[0].get("owner");
        $("#body-content-event-detail").prepend(buildEventDetailElement(object[0]));
        // display event holder's name | not the email one
        pullUserEventHolderInfo(holder, "detail-"+id);
        $(".ui-custom-report").on("click",function(){
            reportActivity(id);
        });
    };
    ParseSelectEvent(id, displayFunction);


    // display the comments in this event
    displayFunction = function(objects) {
        $("#body-content-event-detail").append("<div id='body-content-bottom-event-commnets-list' class='ui-custom-comment-container'></div>")
        for (var i=0; i<=objects.length-1; i++) {
            // build the comment content
            var newElement = buildCommentInEventDetail(objects[i]);
            $("#body-content-bottom-event-commnets-list").append(newElement);
            // build the user's profile photo
            var displayFunction = function(object, data) {
                var photo120 = object.get("profilePhoto120");
                if (typeof(photo120) == "undefined") {
                    photo120 = "./content/png/Taylor-Swift.png";
                }
                $("#comment-"+data.commentId).css("backgroundImage", "url("+photo120+")")
            };
            CacheGetProfilePhotoByUserId(objects[i].get("owner"), displayFunction, {commentId: objects[i].id});
        }
    };
    ParsePullEventComment(id, descendingOrderKey, displayFunction);
}

function displayEventDetailMoreOption(){
    $("#header-event-detail-more-option").removeClass("ui-header-event-more-option");
    $("#header-event-detail-more-option").addClass("ui-header-event-more-option-active");
    $("#body-bottom-event-detail-more-option").css("position","fixed");
    $("#body-bottom-event-detail-more-option").css("bottom",(-$("#body-bottom-event-detail-more-option").height()).toString()+"px");
    $("#body-bottom-event-detail-more-option").show();
    $("body").append("<div class='ui-gray-cover' style='position:fixed; width:100%; height:100%; opacity:0; background-color:#000; z-index:4' onclick='hideEventDetailMoreOption()'><div>");
    $("#body-bottom-event-detail-more-option").animate({
        bottom: "0px"
    },300);
    $(".ui-gray-cover").animate({
        opacity: 0.3
    },300);
}

function hideEventDetailMoreOption(){
    $("#header-event-detail-more-option").addClass("ui-header-event-more-option");
    $("#header-event-detail-more-option").removeClass("ui-header-event-more-option-active");
    $("#body-bottom-event-detail-more-option").animate({
        bottom: (-$("#body-bottom-event-detail-more-option").height()).toString()+"px"
    },300,function(){
        $("#body-bottom-event-detail-more-option").hide();
    });
    $(".ui-gray-cover").animate({
        opacity: 0
    },300, function(){
        $(".ui-gray-cover").remove();
    });
}

// set the comment reply to specific user and trigger the focus of send toolbar
function replyCommentToUser(replyTo) {
    $("#footer-bar-reply-to-id-label").html(replyTo.id);
    $("#footer-bar-input-comment-content").attr("placeholder","@"+replyTo.name);
    $("#footer-bar-form-comment > .custom-block-a").click();
}

// send comment to database
function sendComment(){
    var eventId = $("#footer-bar-event-id-label").html();
    var replyToUserId = $("#footer-bar-reply-to-id-label").html();
    var replyToUserName = $("#footer-bar-input-comment-content").attr("placeholder");
    if (typeof(replyToUserId) == "undefined") {
        replyToUserId = "";
    }
    var currentUser = Parse.User.current();
    var owner = currentUser.id;
    var content = $("#footer-bar-input-comment-content").val();
    if (content == "")
        return;
    if (replyToUserId.length > 0) {
        content = replyToUserName + "  " + content;
    }
    $("#footer-bar-input-comment-content").val("");
    if (content.length==0)
        return;
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
    var successFunction = function(object, option){
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

        // push notification to the user been replyed
        if (typeof(replyToUserId) != "undefined" && replyToUserId != null) {
            pushNotificationToDeviceByUserId(replyToUserId, 
                Parse.User.current().get("name")+" replyed your comment on activity \'"+title+"\'.")
        }

        // push notification to owner
        var displayFunction = function(object, data) {
            if (object.id.localeCompare(data.replyToUserId) != 0) {
                pushNotificationToDeviceByUserId(object.id, 
                    Parse.User.current().get("name")+" commented on your activity \'"+title+"\'.");
            };
        }
        CacheGetProfileByUsername(ownerName, displayFunction, {replyToUserId: replyToUserId});

        $("#footer-bar-input-comment-content").blur();
    };
    if (replyToUserId.length == 0) {
        replyToUserId = null;
    }
    ParseAddEventComment(eventId, owner, content, {
        replyToUserId: replyToUserId,
        errorFunction: errorFunction, 
        successFunction: successFunction,
    });
}

//report inapproperiate activity
function reportActivity(id){
    var hiddenUserEvent = function(object){
        var id = object.id;
        $("#body-event-" + id).remove();
        $.mobile.changePage("#page-event");//window.location.hash = "#page-event";
    };
    ParseUpdateReport(id, hiddenUserEvent); 
}

// #page-event-my-event functions
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

var selectedElement="";
var animateDuration=150;

function pullMyEvent(beforeAt){
    var currentUser = Parse.User.current();
    var owner = currentUser.getUsername();
    var descendingOrderKey = "createdAt";
    var displayFunction = function(objects){
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

function editMyEvent(eventId){
    var display = function(objs){
        $("#body-input-edit-event-title").val(objs[0].get("title"));
        $("#body-input-edit-event-location").val(objs[0].get("location"));
        var time = objs[0].get("time").split(" -- ");
        $("#body-input-edit-event-startTime").val(time[0].replace(" ", "T"));
        $("#body-input-edit-event-endTime").val(time[1].replace(" ", "T"));
        if(objs[0].get("visibility") == false){
            $("#body-select-edit-event-visibility").val("Friends");
        }
        $("#body-input-edit-event-description").val(objs[0].get("description"));
        $("#body-bottom-edit-event-save").on("click",function(){
            editSaveUserEvent(eventId);
        });
    };
    ParsePullEvent({eventId: eventId, displayFunction: display});
}

function editSaveUserEvent(eventId){
    var currentUser = Parse.User.current();
    var owner = currentUser.getUsername();

    var title = $("#body-input-edit-event-title").val();
    var location = $("#body-input-edit-event-location").val();
    var startTime = $("#body-input-edit-event-startTime").val().replace("T", " ");
    var endTime = $("#body-input-edit-event-endTime").val().replace("T", " ");

    var errorHandler = function(item) {
        $("#body-input-event-edit-" + item).focus().parent().addClass("ui-custom-event-edit-focus");
        if ($("#body-input-event-edit-" + item + "-alert").length == 0) {
            $("#body-input-event-edit-" + item).parent().after("<p id='body-input-event-edit-" + item + "-alert' class='event-edit-alert'>*Field required</p>");
        }

        setTimeout(function(){
            $("#body-input-event-edit-" + item).focus().parent().removeClass("ui-custom-event-edit-focus");
        }, 500);

        $("#body-input-event-edit-" + item).change(function(){
            $("#body-input-event-edit-" + item + "-alert").remove();
            $("#body-input-event-edit-" + item).unbind("change");
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

    var visibility = $("#body-select-edit-event-visibility").val()=="on" ? true : false ;
    var description = $("#body-input-edit-event-description").val();
    var errorObject = $("#body-edit-event-error");
    var destID = "#page-event-my-event";
    var displayFunction = function(object){
        // clear page-edit-event
        $("#body-input-edit-event-title").val("");
        $("#body-input-edit-event-location").val("");
        $("#event-edit-start-time").val("");
        $("#event-edit-end-time").val("");
        $("#body-input-edit-event-description").val("");
        $("#body-select-edit-event-visibility").val("on").flipswitch("refresh");
        $("#body-edit-event-error").html("");
        // rebuilt element in page-event-my-event
        var id = object.id;
        var newElement = buildMyUserEventElement(object);
        var oldElement = $("#body-my-event"+id);
        oldElement.before(newElement);
        oldElement.remove();
        // rebuilt element in page-event
        var id = object.id;
        var holder = object.get("owner");
        var newElement = buildUserEventElement(object);
        var oldElement = $("#body-event"+id);
        oldElement.before(newElement);
        oldElement.remove();
        // display event holder's name | not the email one
        pullUserEventHolderInfo(holder, id);

        // push notification to users who are on the going list
        if (typeof(object.get("goingId")) == "undefined") {
            var goingId = [];
        } else {
            var goingId = object.get("goingId");
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
    ParseEventEditSave(owner, title, location, time, visibility, description, errorObject, destID, displayFunction, eventId);
}