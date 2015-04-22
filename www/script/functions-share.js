$(document).ready(function() {
    initialElementEventSetting();
    cacheInitialization();
    var eventid = getUrlParameter("id");

    var currentUser = Parse.User.current();
    if (currentUser) {
        updateEventDetail(eventid);
        $("#footer-bar-send-comment").css("position","fixed").css("bottom","0").show();
    } else {
        /*********** modified by Yaliang **********/
        // the code move to the below function
        pullEventDetailWithoutLogin(eventid);
    }
});

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}


function buildEventWithoutLogin(object){
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
    /**************************************************************************/
    /* The following two buttons of interest or going should have same "onclick" event, which ask user to login or signup in order to "interest"/"going" this event
    /* After the user successfully signup or login, it should display this event again, but with all functionalities.
    /**************************************************************************/
    newElement += "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-favor-false interest-button-"+id+"' onclick=''>"+"Interest"+"</a></div>"
    newElement = newElement + "<div class='ui-custom-float-left'><a href='#' class='ui-btn ui-bar-btn-custom ui-mini ui-icon-custom-going-false going-button-"+id+"' onclick=''>"+"Going"+"</a></div>";

    newElement = newElement + "</div>";
    newElement = newElement + "</div>";
    newElement = newElement + "</div>";

    return newElement;
}



function pullEventDetailWithoutLogin(eventid){
    $("#body-content-event-detail").html("");
    $("#footer-bar-event-id-label").html(eventid);

    // display the UserEvent object info
    var descendingOrderKey = "createdAt";
    var displayFunction = function(objects){  // objects: an array of UserEvent objects
        shareEvents(objects[0]);
        var id = objects[0].id;
        var holder = objects[0].get("owner");
        $("#body-content-event-detail").prepend(buildEventWithoutLogin(objects[0]));
        pullUserEventHolderInfo(holder, "detail-"+id); // display event owner's name, not the username (which is an email address)

        /************************************************************************/
        /* modified by Yaliang
        /* For user not sign in, shoud ask for signing in
        /************************************************************************/
        // $(".ui-custom-report").on("click",function(){
        //     reportActivity(id);
        // });
        $(".report-btn").addClass("ui-hidden-accessible");
    };
    ParseSelectEvent(eventid, displayFunction);

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
    ParsePullEventComment(eventid, descendingOrderKey, displayFunction);
}

/* This function is designed to initialize certain elements in the document, such as attaching events handlers,
 * preventing default events, showing default display, etc.
 * Created by Yaliang
 */
function initialElementEventSetting(){

    // set comment and message send bar disable
    var $footerBarInputCommentContent = $("#footer-bar-input-comment-content");
    $footerBarInputCommentContent.on("blur",function(){
        $footerBarInputCommentContent.prop("disabled", true);
        $("#footer-bar-send-comment").css("position","fixed").css("bottom","0");
        if ($footerBarInputCommentContent.val().length == 0) {
            $("#footer-bar-input-comment-content").attr("placeholder","comment...");
            $("#footer-bar-reply-to-id-label").html("");
        }
    });

    $footerBarInputCommentContent.prop("disabled", true);

    $("#footer-bar-form-comment").submit(function(event){
        event.preventDefault();
    });

    $("#body-form-login").submit(function(event){
        event.preventDefault();
    });

    $("#body-form-signup").submit(function(event){
        event.preventDefault();
    });

    // add function when the page #page-event-detail completed.
    $(document).on("pageshow","#page-event-detail",function(){
        $("#footer-bar-send-comment").css("position","fixed").css("bottom","0").show();
    });

    $(document).on("pagebeforehide","#page-event-detail",function(){
        $("#footer-bar-send-comment").hide();
    });

}

/* This function is designed to convert ISO time to relative time.
 * It's used to show the time a user was active in the past from now.
 */
function convertTime(rawTime){
    var minutes = 1000 * 60;
    var hours = minutes * 60;
    var days = hours * 24;
    var months = days * 30;
    var years = days * 365;
    var currentTime = new Date();
    var time = currentTime.getTime() - Date.parse(rawTime.toString());
    time = Math.max(time, 0);

    var y = Math.floor(time / years);
    time = time - years * y;

    var mon = Math.floor(time / months);
    time = time - months * mon;

    var d = Math.floor(time / days);
    time = time - days * d;

    var h = Math.floor(time / hours);
    time = time - hours * h;

    var m = Math.floor(time / minutes);

    var showtime = "";

    if (y > 0) {
        showtime = y.toString() + (y > 1 ? " years ago" : " year ago");
        //showtime = y.toString()+"y";
    }  else if (mon > 0) {
        showtime = mon.toString()+ (mon > 1 ? " months ago" : " month ago");
        //showtime = d.toString()+"d";
    }else if (d > 0) {
        showtime = d.toString()+ (d > 1 ? " days ago" : " day ago");
        //showtime = d.toString()+"d";
    }  else if (h > 0) {
        showtime = h.toString()+ (h > 1 ? " hours ago" : " hour ago");
        //showtime = h.toString()+"hour";
    } else if (m > 0) {
        showtime = m.toString()+(m > 1 ? " mins ago" : " min ago");
        //showtime = m.toString()+"m";
    } else {
        showtime = "just now";
        //showtime = "now";
    }
    return showtime;
}

/* This function is designed to ...
 */
function sendToolbarActiveKeyboard(object){
    $("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
        duration: 300,
        complete : function(){
            $(object.id).prop("disabled", false);
            $(object.bar).css("position","absolute");
            $(object.bar).css("bottom",($("body").height() - $(object.base).height()+object.bias).toString()+"px");
            $(object.id).trigger("focus");
        }
    });
}