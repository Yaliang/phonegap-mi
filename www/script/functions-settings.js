/* This variable ...
 */
var refreshPreviewPhoto = false;

/* This function is designed to refresh the preview of user's profile photo every 1.5 seconds.
 */
function refreshPreviewCanvas(){
    profilePhotoCrop();
    if (refreshPreviewPhoto) {
        setTimeout(function(){
            refreshPreviewCanvas();
        },1500);
    }
}

/* This function is designed to get my profile.
 */
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

        $("#body-input-edit-profile-name").val(name);
        var $bodySelectEditProfileGender = $("#body-select-edit-profile-gender");
        $bodySelectEditProfileGender.val(gender ? "on" : "off");
        if (!gender) {
            $bodySelectEditProfileGender.parent().removeClass("ui-flipswitch-active");
        } else {
            $bodySelectEditProfileGender.parent().addClass("ui-flipswitch-active");
        }
        $("#body-input-edit-profile-birthdate").val(birthdate);
        $("#body-input-edit-profile-motto").val(motto);
        $("#body-input-edit-profile-major").val(major);
        $("#body-input-edit-profile-school").val(school);
        $("#body-input-edit-profile-interest").val(interest);
        $("#body-input-edit-profile-location").val(location);
    };
    ParseUpdateCurrentUser(displayFunction, function(){});

    displayFunction = function(object, data){ // object: single cachePhoto[i] object
        var photo120 = object.get("profilePhoto120");
        if (typeof(photo120) == "undefined") {
            photo120 = "./content/png/Taylor-Swift.png";
        }
        var canvas = document.getElementById("body-profile-photo-preview-canvas");
        var context = canvas.getContext("2d");
        var image = new Image();
        image.onload = function(){
            context.drawImage(image, 0, 0);
        };
        image.src = photo120;        
    };
    CacheGetProfilePhotoByUserId(userId, displayFunction, {});
}

/* This function is designed to save my profile.
 */
function saveProfile(){
    refreshPreviewPhoto = false;
    $("#body-bottom-profile-save-btn").unbind("click");
    var currentUser = Parse.User.current();
    var owner = currentUser.getUsername();
    var id = currentUser.id;

    var fileUploadControl = $("#body-input-edit-profile-photo")[0];
    if (fileUploadControl.files.length > 0) {
        var canvas = document.getElementById("body-profile-photo-preview-canvas");
        var photo120 = canvas.toDataURL();
        var photo = fileUploadControl.files[0];
    } else {
        photo120 = null;
        photo = null;
    }

    var name = $("#body-input-edit-profile-name").val();
    var gender = $("#body-select-edit-profile-gender").val()=="on";
    var birthdate = $("#body-input-edit-profile-birthdate").val();
    var motto = $("#body-input-edit-profile-motto").val();
    var major = $("#body-input-edit-profile-major").val();
    var school = $("#body-input-edit-profile-school").val();
    var interest = $("#body-input-edit-profile-interest").val();
    var location = $("#body-input-edit-profile-location").val();

    var displayFunction = function(){
        ParseUpdateCurrentUser(function(){}, function(){});
    };

    ParseSaveProfile(name, gender, birthdate, motto, major, school, interest, location, displayFunction);
    ParseSaveProfilePhoto(id, photo, photo120, function(object){});
}

/* This function is designed to crop my profile photo.
 */
function profilePhotoCrop(){
    var fileUploadControl = $("#body-input-edit-profile-photo")[0];
    var file = fileUploadControl.files[0];
    if (typeof(file) == "undefined") {
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        var image = new Image();
        var canvas = document.getElementById("body-profile-photo-preview-canvas");
        var context = canvas.getContext("2d");
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
    };

    loadImage.parseMetaData(file,function (data) {
        if (typeof(data.exif) != "undefined"){
            var orientation = data.exif.get("Orientation");
            //console.log(orientation);
            var canvas = document.getElementById("body-profile-photo-preview-canvas");
            var context = canvas.getContext("2d");
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

/* This function is designed to change my account password.
 */
function changePassword(type, password, confirmPassword){
    //console.log("check");
    // check current password
    $.mobile.loading("show");
    if (type.localeCompare("old") == 0) {
        var successFunction = function(){
            $("#body-form-confirm-password").hide();
            $("#body-form-set-new-password").show();
            $("#body-confirm-password-btn").hide();
            $("#body-set-new-password-btn").show();
            $("#body-input-old-password").val("");
            $("#body-input-set-new-password").val("");
            $("#body-input-confirm-new-password").val("");
            $("#body-confirm-password-error").html("");
            $("#body-set-new-password-error").html("");
            $("#body-input-set-new-password").focus();
            $.mobile.loading("hide");
        };

        var errorFunction = function(error){
            var errorMessage = "";
            if (error.code == 101){
                errorMessage = "Password does not match your account."
            } else {
                errorMessage = "Failed to connect server, please try again.";
            }
            $("#body-input-old-password").val("");
            $("#body-confirm-password-error").html(errorMessage);
            $.mobile.loading("hide");
        };
        ParseConfirmPassword(password, successFunction, errorFunction);
    }
    // update new password
    if (type.localeCompare("new") == 0) {
        // conpare new password with new password confirm
        if (password.localeCompare(confirmPassword) != 0) {
            var errorMessage = "Password does not match. Please reenter password.";
            $("#body-set-new-password-error").html(errorMessage);
            $.mobile.loading("hide");
            return;
        }

        if (password.length < 6){
            errorMessage = "Password should be at least 6 characters. Please reenter password.";
            $("#body-set-new-password-error").html(errorMessage);
            $.mobile.loading("hide");
            return;
        }
        // save to server
        successFunction = function() {
            $("#body-form-confirm-password").show();
            $("#body-form-set-new-password").hide();
            $("#body-confirm-password-btn").show();
            $("#body-set-new-password-btn").hide();
            $("#body-input-old-password").val("");
            $("#body-input-set-new-password").val("");
            $("#body-input-set-new-password-confirm").val("");
            $("#body-confirm-password-error").html("");
            $("#body-set-new-password-error").html("");
            setCurrLocationHash("#page-setting");
            $.mobile.changePage("#page-setting");
            $.mobile.loading("hide");
        };
        errorFunction = function() {
            var errorMessage = "Failed to save password, please try again.";
            $("#body-set-new-password-error").html(errorMessage);
            $.mobile.loading("hide");
        };
        ParseChangePassword(password, successFunction, errorFunction);
    }
}