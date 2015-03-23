// general functions
function addInterestEvent(eventId){
    var displayFunction = function(object){
        var eventId = object.id;
        var ownerUsername = object.get('owner');
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
        var title = object.get('title');
        if (title.length>10) {
            title = title.slice(0,6) + "...";
        }
        pushNotificationToDeviceByUsername(ownerUsername, Parse.User.current().get('name')+" interested in your activity \""+title+"\".");
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
        var ownerUsername = object.get('owner');
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
        var title = object.get('title');
        if (title.length>10) {
            title = title.slice(0,6) + "...";
        }
        pushNotificationToDeviceByUsername(ownerUsername, Parse.User.current().get('name')+" wanna go with you in activity \""+title+"\"!");
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

        $("#"+data.elementIdBase+" > .custom-corners > .ui-bar").click(function(){
            displayUserProfile(userId);
        });
        $("#"+elementIdBase+"-owner-name").html(name);
        if (typeof(gender) == 'undefined') {
            //$("#"+eventId+"-owner-gender").html(gender.toString());
        } else if (gender) {
            $("#"+elementIdBase+"-owner-gender").css("backgroundImage","url('./content/customicondesign-line-user-black/png/male-white-20.png')");
            $("#"+elementIdBase+"-owner-gender").css("backgroundColor","#8970f1");
        } else {
            $("#"+elementIdBase+"-owner-gender").css("backgroundImage","url('./content/customicondesign-line-user-black/png/female1-white-20.png')");
            $("#"+elementIdBase+"-owner-gender").css("backgroundColor","#f46f75");
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
            $("#"+data.elementIdBase+" > .custom-corners").css("backgroundImage","url('"+photo120+"')");
            pullLastItem = pullLastItem - 1;
            if (pullLastItem == 0) {
                $("#event-content").removeClass("ui-hidden-accessible");
                $.mobile.loading("hide");
            }
        };
        CacheGetProfilePhoto(userId, displayFunction, data);
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
        goingId = new Array;
    }
    var goingNumber = goingId.length;
    var interestId = object.get("interestId");
    if (typeof(interestId) == "undefined") {
        interestId = new Array;
    }
    var interestNumber = interestId.length;
    var newElement = "";
    newElement = newElement + "<div id=\'"+id+"\'>";
    newElement = newElement + "<div class='custom-corners-public custom-corners'>";
    newElement = newElement + "<div class='ui-bar ui-bar-a' style='cursor:pointer' onclick=\"$.mobile.changePage(\'#page-display-user-profile\');\">";
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
    newElement = newElement + "<div class='event-statistics comment-statistics-"+id+"' style='clear:both'>" + commentNumber + " Comments</div><div class='event-statistics interest-statistics-"+id+"'>" + interestNumber + " Interests</div><div class='event-statistics going-statistics-"+id+"'>" + goingNumber + " Goings</div>";
    newElement = newElement + "</div>";
    newElement = newElement + "<div class='ui-footer ui-bar-custom'>";
    newElement = newElement + "<div class='ui-custom-float-left'><a href='#page-event-detail' data-transition='slide' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-comment' id='comment-button-"+id+"' onclick=\"updateEventDetail('"+id+"')\">"+"Detail"+"</a></div>";
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
        pullLastItem = 2 * objects.length;
        if (objects.length < limitNumber)
            $(".ui-load-more-activity").html("No More Activities");
        for (var i=0; i <= objects.length-1; i++) {
            if (Date.parse(currentLastEvent) > Date.parse(objects[i].createdAt))
                currentLastEvent = objects[i].createdAt
            if ($("#"+objects[i].id).length == 0) {
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
                    goingId = new Array;
                }
                var goingNumber = goingId.length;
                var interestId = objects[i].get("interestId");
                if (typeof(interestId) == "undefined") {
                    interestId = new Array;
                }
                var interestNumber = interestId.length;
                var holder = objects[i].get("owner");
                var id = objects[i].id;
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

function displayEventMoreOption(){
    $('#event-page-right-top-option-1').unbind("click");
    $('#event-page-right-top-option-2').unbind("click");
    $('#ui-icon-custom-right-top-more').attr("id","ui-icon-custom-right-top-more-active");
    $(window).unbind("scroll");
    $('#event-page-right-top-option-1').on('click',function(){
        var date = new Date().toISOString();
        var timeRes = date.split(":");
        time = timeRes[0]+":"+timeRes[1];
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

// #page-create-event functions

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
	var errorObject = $("#event-create-error");
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

// #page-event-detail functions

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
        goingId = new Array;
    }
    var goingNumber = goingId.length;
    var interestId = object.get("interestId");
    if (typeof(interestId) == "undefined") {
        interestId = new Array;
    }
    var interestNumber = interestId.length;
    var id = object.id;
    var newElement = "";
    newElement = newElement + "<div id=\'event-detail-"+id+"\'>";
    newElement = newElement + "<div class='custom-corners-public custom-corners'>";
    newElement = newElement + "<div class='ui-bar ui-bar-a' style='cursor:pointer' onclick=\"$.mobile.changePage(\'#page-display-user-profile\');\">";
    newElement = newElement + "<div><strong id=\'event-detail-"+id+"-owner-name\'></strong></div>";
    newElement = newElement + "<div id=\'event-detail-"+id+"-owner-gender\' class=\'ui-icon-custom-gender\'></div>";
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
    $("#event-detail-content").html("");
    $("#event-id-label").html(id);
    var descendingOrderKey = "createdAt";
    var displayFunction = function(object){
        var id = object[0].id;
        var holder = object[0].get("owner");
        $("#event-detail-content").prepend(buildEventDetailElement(object[0]));
        // display event holder's name | not the email one
        pullUserEventHolderInfo(holder, 'event-detail-'+id);
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

function displayEventDetailMoreOption(){
    $("#page-event-detail-more-option").css('position',"fixed");
    $("#page-event-detail-more-option").css('bottom',(-$("#page-event-detail-more-option").height()).toString()+"px");
    $("#page-event-detail-more-option").show();
    $("body").append("<div class='ui-gray-cover' style='position:fixed; width:100%; height:100%; opacity:0; background-color:#000; z-index:4' onclick='hideEventDetailMoreOption()'><div>")
    $("#page-event-detail-more-option").animate({
        bottom: "0px"
    },300);
    $(".ui-gray-cover").animate({
        opacity: 0.3
    },300);
}

function hideEventDetailMoreOption(){
    $('#page-event-detail-more-option').animate({
        bottom: (-$("#page-event-detail-more-option").height()).toString()+"px"
    },300,function(){
        $('#page-event-detail-more-option').hide();
    });
    $(".ui-gray-cover").animate({
        opacity: 0
    },300, function(){
        $('.ui-gray-cover').remove();
    });
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
        var ownerUsername = object.get('owner');
        var commentNumber = object.get("commentNumber");
        updateEventDetail(eventId);
        $(".comment-statistics-"+eventId).each(function(){
            $(this).html(commentNumber.toString()+" Comments");
        });
        $("#my-comment-statistics-"+eventId).html(commentNumber.toString()+" Comments");

        // push notification to owner
        var title = object.get('title');
        if (title.length>10) {
            title = title.slice(0,6) + "...";
        }
        pushNotificationToDeviceByUsername(ownerUsername, Parse.User.current().get('name')+" commented on your activity \""+title+"\".");
    };
    ParseAddEventComment(eventId, owner, content, errorFunction, successFunction);
}

//report inapproperiate activity
function reportActivity(id){
    var hiddenUserEvent = function(object){
        var id = object.id;
        $("#" + id).remove();
        $.mobile.changePage("#page-event");//window.location.hash = "#page-event";
    }
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
        goingId = new Array;
    }
    var goingNumber = goingId.length;
    var id = object.id;
    var newElement = "";
    newElement += "<div id='my-"+id+"'>";
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
    newElement += "<div class='ui-footer ui-bar-custom'>"
    newElement += "<div class='ui-custom-float-left'><a href='#page-event-detail' data-transition='slide' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-comment' id='my-comment-button-"+id+"' onclick=\"updateEventDetail('"+id+"'); setCurrLocationHash('#page-event-delete')\">"+"Detail"+"</a></div>";
    newElement += "<div class='ui-custom-float-left'><a href='#page-event-delete' data-transition='slideup' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-delete' id='my-comment-button-"+id+"' onclick=\"deleteMyEvent('"+id+"'); setCurrLocationHash('#page-event-delete')\">"+"Delete"+"</a></div>";
    newElement += "<div class='ui-custom-float-left'><a href='#page-event-edit' data-transition='slide' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-edit' id='my-comment-button-"+id+"' onclick=\"editMyEvent('"+id+"'); setCurrLocationHash('#page-event-delete')\">"+"Edit"+"</a></div>";
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
            if ($("#my-event-content > #my-"+objects[i].id).length == 0) {
                $("#my-event-content").prepend(buildMyUserEventElement(objects[i]));
            } else {
                var commentNumber = objects[i].get("commentNumber");
                var interestNumber = 0;
                if (typeof(object.get("interestId")) != "undefined")
                    interestNumber = object.get("interestId").length;
                var goingId = objects[i].get("goingId");
                if (typeof(goingId) == "undefined"){
                    goingId = new Array;
                }
                var goingNumber = goingId.length;
                var id = objects[i].id;
                $(".comment-statistics-"+id).each(function(){html(commentNumber.toString()+" Comments");});
                $(".interest-statistics-"+id).each(function(){html(interestNumber.toString()+" Interests");});
                $(".going-statistics-"+id).each(function(){html(goingNumber.toString()+" Goings");});
            }
        };
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
    var errorObject = $("#event-edit-error");
    var destID = "#page-event-my-event";
    var displayFunction = function(object){
        // clear page-event-edit
        $("#event-edit-title").val("");
        $("#event-edit-location").val("");
        $("#event-edit-start-time").val("");
        $("#event-edit-end-time").val("");
        $("#event-edit-description").val("");
        $("#event-edit-visibility").val("on").flipswitch('refresh');
        $("#event-edit-error").html("");
        // rebuilt element in page-event-my-event
        var id = object.id;
        var newElement = buildMyUserEventElement(object);
        var oldElement = $("#my-"+id);
        oldElement.before(newElement);
        oldElement.remove();
        // rebuilt element in page-event
        var id = object.id;
        var holder = object.get("owner");
        var newElement = buildUserEventElement(object);
        var oldElement = $("#"+id);
        oldElement.before(newElement);
        oldElement.remove();
        // display event holder's name | not the email one
        pullUserEventHolderInfo(holder, id);

        // push notification to users who are on the going list
        var goingId = object.get('goingId');
        if (typeof(goingId) == "undefined") {
            goingId == new Array;
        }
        var goingUsrId;
        var title = object.get('title');
        if (title.length>10) {
            title = title.slice(0,6) + "...";
        }
        for (var i=0; i< goingId.length; i++) {
            goingUsrId = goingId[i];
            pushNotificationToDeviceByUserId(goingUsrId, Parse.User.current().get('name')+" updated the activity \"" +title+ "\".");
        }
    };
    ParseEventEditSave(owner, title, location, time, visibility, description, errorObject, destID, displayFunction, eventId);
}