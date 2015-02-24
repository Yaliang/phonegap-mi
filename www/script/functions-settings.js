// edit and update my profile
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
		image.onload = function(){
			context.drawImage(image, 0, 0);
		}
		image.src = photo120;		
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