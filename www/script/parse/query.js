Parse.initialize("uFgE3rx2fcIDcWXQgjzuE70VF5WBH76I3TFkwo7W", "21lb7CMEkfLUurx1ETYa805EVu6KYU2WeluLIJ73");

function ParseSignup(username, password, email, name, errorObject, destID, customFunction) {
	var user = new Parse.User();
	user.set("username",username);
	user.set("password",password);
	user.set("email",email);
	user.set("name",name);

	user.signUp(null, {
		success: function(user) {
			window.location.hash = destID;
			customFunction();
		},
		error: function(user,error) {
			errorObject.html("Error: " + error.code + " " + error.message);
		}
	});
}

function ParseLogin(username, password, errorObject, destID, customFunction) {
	Parse.User.logIn(username,password,{
		success: function(user){
			window.location.hash = destID;
			customFunction();
		},
		error: function(user, error){
			errorObject.html("Error: " + error.code + " " + error.message);
		}
	});
}

function ParseLogout(destID) {
	Parse.User.logOut();
	window.location.hash = destID;
}

function ParseUpdateCurrentUser(successFunction, errorFunction) {
	var currentUser = Parse.User.current();
	currentUser.fetch({
		success: function(currentUser) {
			successFunction();
		},
		error: function(currentUser,error){
			errorFunction();
		}
	});
}

function ParseEventCreate(owner, title, location, time, visibility, description, errorObject, destID, clearFunction) {
	var UserEvent = Parse.Object.extend("UserEvent");
	var userEvent = new UserEvent();

	userEvent.set("owner",owner);
	userEvent.set("title",title);
	userEvent.set("location",location);
	userEvent.set("time",time);
	userEvent.set("visibility",visibility);
	userEvent.set("description",description);
	userEvent.set("interestNumber",0);
	userEvent.set("commentNumber",0);

	userEvent.save(null, {
		success: function(userEvent) {
			clearFunction();
			window.location.hash = destID;
		},
		error: function(userEvent, error){
			errorObject.html("Error: " + error.code + " " + error.message);
		}
	});
}

function ParsePullEvent(owner, limitNumber, descendingOrderKey, displayFunction) {
	var UserEvent = Parse.Object.extend("UserEvent");
	var query = new Parse.Query(UserEvent);
	if (owner != null) {
		query.equalTo("owner",owner);
	}
	if (limitNumber != null) {
		query.limit(limitNumber);
	}
	query.descending(descendingOrderKey);
	query.find({
		success: function(userEvents) {
			displayFunction(userEvents);
		}
	});
}

function ParseSelectEvent(id, displayFunction) {
	var UserEvent = Parse.Object.extend("UserEvent");
	var query = new Parse.Query(UserEvent);

	query.equalTo("objectId",id);
	query.find({
		success: function(userEvents) {
			displayFunction(userEvents);
		}
	});
}

function ParsePullEventComment(eventId, descendingOrderKey, displayFunction) {
	var comment = Parse.Object.extend("Comment");
	var query = new Parse.Query(comment);
	query.equalTo("eventId",eventId);
	query.descending(descendingOrderKey);
	query.find({
		success: function(comments) {
			displayFunction(comments);
		}
	});
}

function ParseAddEventComment(eventId, owner, content, errorFunction, successFunction) {
	var Comment = Parse.Object.extend("Comment");
	var comment = new Comment;
	var currentUser = Parse.User.current();
	
	comment.set("eventId", eventId);
	comment.set("owner",owner);
	comment.set("ownerName",currentUser.get("name"));
	comment.set("content",content);
	comment.save(null, {
		success: function(comment) {
			ParseUpdateEventCommentNumber(1, eventId, successFunction);
		},
		error: function(comment, error){
			errorFunction("Error: " + error.code + " " + error.message);
		}
	});
}

function ParseUpdateEventInterestNumber(count, eventId, displayFunction){
	var UserEvent = Parse.Object.extend("UserEvent");
	var query = new Parse.Query(UserEvent);
	
	query.get(eventId, {
		success: function(userEvent){
			userEvent.increment("interestNumber",count);
			userEvent.save(null, {
				success: function(userEvent){
					displayFunction(userEvent);
				}
			});
		}
	});
}

function ParseUpdateEventCommentNumber(count, eventId, displayFunction){
	var UserEvent = Parse.Object.extend("UserEvent");
	var query = new Parse.Query(UserEvent);
	
	query.get(eventId, {
		success: function(userEvent){
			userEvent.increment("commentNumber",count);
			userEvent.save(null, {
				success: function(userEvent){
					displayFunction(userEvent);
				}
			});
		}
	});
}

function ParseAddInterest(owner, eventId, displayFunction){
	var Interest = Parse.Object.extend("Interest");
	var interest = new Interest;

	interest.set("owner", owner);
	interest.set("eventId", eventId);
	interest.save(null, {
		success: function(interest){
			ParseUpdateEventInterestNumber(1, eventId, displayFunction);
		}
	});
}

function ParseCheckInterest(owner, eventId, successFunction){
	var Interest = Parse.Object.extend("Interest");
	var query = new Parse.Query(Interest);

	query.equalTo("owner", owner);
	query.equalTo("eventId", eventId);
	query.find({
		success: function(interest) {
			successFunction(eventId, interest);
		}
	});

}

function ParseRemoveInterest(objectId, owner, eventId, displayFunction){
	var Interest = Parse.Object.extend("Interest");
	var query = new Parse.Query(Interest);
	if (objectId == null) {
		query.equalTo("owner", owner);
		query.equalTo("eventId", eventId);
		query.find({
			success: function(interest){
				displayFunction(interest,eventId);
			}
		});
	} 
	else {
		query.get(objectId, {
			success: function(interest){
				interest.destroy({
					success: function(interest){
						ParseUpdateEventInterestNumber(-1, eventId, displayFunction);
					}
				});
			}
		});
	}
}

function ParseDeleteEvent(eventId, displayFunction){
	var UserEvent = Parse.Object.extend("UserEvent");
	var query = new Parse.Query(UserEvent);
	query.get(eventId,{
		success: function(userEvent){
			userEvent.destroy({
				success: function(userEvent){
					displayFunction(eventId);
				}
			});
		}
	});
}

function ParseUserNameFieldUpdate(i){
	console.log(i);
	var Comment = Parse.Object.extend("Comment");
	var query = new Parse.Query(Comment);

	query.descending("createdAt");
	query.find({
		success: function(comments){
				var query = new Parse.Query(Parse.User);
				var email = comments[i].get("owner");
				var objectId = comments[i].id;
				console.log(email);
				query.equalTo("username", email);
				query.find({
					success: function(user){
						var ownerName = user[0].get("name");
						console.log(ownerName);
						var Comment = Parse.Object.extend("Comment");
						var query = new Parse.Query(Comment);
						query.get(objectId,{
							success: function(comment){
								console.log(ownerName);
								comment.set("ownerName",ownerName);
								comment.save(null, {
									success: function(comments){
										console.log("success");
									}
								});
							},
							error: function(comment, error){
								console.log("Error: " + error.code + " " + error.message);
							}
						});
					},
					error: function(userEvent, error){
						console.log("Error: " + error.code + " " + error.message);
					}
				})
		}
	})
}

var refreshNumber=0;
function ParseRefreshComment(){
	ParseUserNameFieldUpdate(refreshNumber);
	refreshNumber = refreshNumber+1;
	if (refreshNumber == 100)
		return;
	setTimeout(function(){
		ParseRefreshComment();
	}, 5000);
}

function ParseGetProfile(owner, displayFunction){
	var query = new Parse.Query(Parse.User);

	query.equalTo("username", owner);
	query.find({
		success: function(myprofile) {
			displayFunction(myprofile);
		}
	});
}

function ParseSaveProfile(id, name, gender, birthdate, motto, major, school, interest, location, displayFunction) {
	var query = new Parse.Query(Parse.User);

	query.get(id,{
		success: function(userProfile){
			userProfile.set("name",name);
			userProfile.set("gender",gender);
			userProfile.set("birthdate",birthdate);
			userProfile.set("motto",motto);
			userProfile.set("major",major);
			userProfile.set("school",school);
			userProfile.set("interest",interest);
			userProfile.set("location",location);
			userProfile.save(null,{
				success: function(userProfile){
					displayFunction();
				}
			});
		}
	});	
}