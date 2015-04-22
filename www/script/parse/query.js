/* This function call initializes settings for connecting to the Parse server.
 * @parameters: the first parameter is the Application ID; the second parameter is the JavaScript Key.
 * These Application Keys can be found on your Parse account under the "Settings/Keys" panel.
 */
Parse.initialize("uFgE3rx2fcIDcWXQgjzuE70VF5WBH76I3TFkwo7W", "21lb7CMEkfLUurx1ETYa805EVu6KYU2WeluLIJ73");

/* This function is designed to sign up new users by calling
 * Parse API "signUp" (instance method of Parse.User object)
 */
function ParseSignup(username, password, email, name, errorObject, destID, customFunction) {
    var user = new Parse.User();
    user.set("username",username);
    user.set("password",password);
    user.set("email",email);
    user.set("name",name);

    user.signUp(null, {
        success: function(user) {
            setCurrLocationHash(destID);
            $.mobile.changePage(destID);
            customFunction(user);
        },
        error: function(user,error) {
            $.mobile.loading("hide");
            errorObject.html(error.message);
            $("#body-input-signup-password").val("");
        }
    });
}

/* This function is designed to update the bridgeitId of current user
 * by calling Parse API "set" (instance method of Parse.User object)
 */
function ParseUpdateBridgeit(bridgeitId){
    var current = Parse.User.current();
    current.set("bridgeitId",bridgeitId);
    current.save();
}

/* This function is designed to create and save user profile photo object by calling Parse API
 * "set" and "save" (instance methods of Photo object. Photo is a customer-defined subclass of Parse.Object)
 */
function ParseCreateProfilePhotoObject(userId){
    var Photo = Parse.Object.extend("Photo");
    var photo = new Photo;
    photo.set("userId",userId);
    photo.save();
}

/* This function is designed to login to user account by calling
 * Parse API "logIn" (class method of Parse.User class)
 */
function ParseLogin(username, password, errorObject, destID, customFunction) {
    Parse.User.logIn(username,password,{
        success: function(user){
            setCurrLocationHash(destID);
            $.mobile.changePage(destID);
            customFunction();
            CacheUpdateUser(user);
        },
        error: function(user, error){
            $.mobile.loading("hide");
            $("#body-input-login-password").val("");
            var query = new Parse.Query(Parse.User);
            query.equalTo("username", username);

            // query.find method will return an array of Parse.User objects to be found
            query.find({
                  success: function(userList) {
                      if(userList.length == 0){
                          errorObject.html("Email does not exist.");
                      }else{
                           errorObject.html("Password does not match your email.");
                       }
                  },
                  error: function(){
                      errorObject.html("Failed to connect to server, please try again later.");
                  }
            });
        }
    });
}

/* This function is designed to confirm user account password by calling
 * Parse API "logIn" (class method of Parse.User class)
 */
function ParseConfirmPassword(password, successFunction, errorFunction) {
    Parse.User.logIn(Parse.User.current().getUsername(), password, {
        success: function(user){
            successFunction();
        },
        error: function(user, error){
            errorFunction(error);
        }
    });
}

/* This function is designed to change and save user account password by calling
 * Parse API "set" and "save" (instance methods of Parse.User object)
 */
function ParseChangePassword(newpassword, successFunction, errorFunction) {
    var currentUser = Parse.User.current();
    currentUser.set("password",newpassword);
    currentUser.save(null, {
        success: function(user){
            successFunction();
        },
        error: function(user, error){
            errorFunction(error);
        }
    });
}

/* This function is designed to remove the bridgeitId of current user by calling
 * Parse API "set" and "save" (instance methods of Parse.User object)
 */
function ParseRemoveCurrentBridgeitId() {
    var current = Parse.User.current();
    var empty;

    current.set("bridgeitId",empty);
    current.save();
}

/* This function is designed to log out user account by calling
 * Parse API "logOut" (class method of Parse.User class)
 */
function ParseLogout(destID) {
    Parse.User.logOut();
    setCurrLocationHash(destID);
    $.mobile.changePage(destID);
}

/* This function is designed to update current user by calling
 * Parse API "fetch" (instance method of Parse.User object)
 */
function ParseUpdateCurrentUser(successFunction, errorFunction) {
    var currentUser = Parse.User.current();

    // query.fetch method will return a single Parse.User object to be got
    currentUser.fetch({
        success: function(object) {
            successFunction();
            CacheUpdateUser(object);
        },
        error: function(object,error){
            errorFunction();
        }
    });
}

/* This function is designed to create and save user activities by calling Parse API "set" and "save"
 * (instance methods of UserEvent object. UserEvent is a customer-defined subclass of Parse.Object)
 */
function ParseEventCreate(owner, title, location, time, startTimeInMilliseconds, endTimeInMilliseconds, visibility, description, errorObject, destID, displayFunction) {
    var UserEvent = Parse.Object.extend("UserEvent");
    var userEvent = new UserEvent();

    userEvent.set("owner",owner);
    userEvent.set("title",title);
    userEvent.set("location",location);
    userEvent.set("time",time);
    userEvent.set("startTimeInMilliseconds", startTimeInMilliseconds);
    userEvent.set("endTimeInMilliseconds", endTimeInMilliseconds);
    userEvent.set("visibility",visibility);
    userEvent.set("description",description);
    userEvent.set("commentNumber",0);
    userEvent.set("reportNum", 0);

    userEvent.save(null, {
        success: function(userEvent) {
            displayFunction(userEvent);
            $.mobile.changePage(destID);
        },
        error: function(userEvent, error){
            errorObject.html("Error: " + error.code + " " + error.message);
        }
    });
}

/* This function is designed to edit and save existing user activities by calling Parse API "set" and "save"
 * (instance methods of UserEvent object. UserEvent is a customer-defined subclass of Parse.Object)
 */
function ParseEventEditSave(owner, title, location, time, startTimeInMilliseconds, endTimeInMilliseconds, visibility, description, errorObject, destID, displayFunction, eventId) {
    var UserEvent = Parse.Object.extend("UserEvent");
    var query = new Parse.Query(UserEvent);

    // query.get method will return a single UserEvent object to be got
    query.get(eventId, {
        success: function(userEvent){
            userEvent.set("owner",owner);
            userEvent.set("title",title);
            userEvent.set("location",location);
            userEvent.set("time",time);
            userEvent.set("startTimeInMilliseconds", startTimeInMilliseconds);
            userEvent.set("endTimeInMilliseconds", endTimeInMilliseconds);
            userEvent.set("visibility",visibility);
            userEvent.set("description",description);

            userEvent.save(null, {
                success: function(userEvent) {
                    displayFunction(userEvent);
                    $.mobile.changePage(destID);
                },
                error: function(userEvent, error){
                    errorObject.html("Error: " + error.code + " " + error.message);
                }
            });
        }
    });
}

/* This function is designed to update the reported number of user activities by calling Parse API "get" (instance method of
 * Parse.Query object, which is performed on UserEvent object. UserEvent is a customer-defined subclass of Parse.Object)
 */
function ParseUpdateReport(id, hiddenUserEvent){
    var UserEvent = Parse.Object.extend("UserEvent");
    var query = new Parse.Query(UserEvent);

    // query.get method will return a single UserEvent object to be got
    query.get(id, {
        success: function(userEvent){
            userEvent.increment("reportNum",1);
            userEvent.addUnique("reportUserId", Parse.User.current().id);
            userEvent.save(null, {
                success: function(userEvent){
                    //hide the report event
                    hiddenUserEvent(userEvent);
                }
            });
        }
    });
}

/* This function is designed to pull up user activities by calling Parse API "find" (instance method of Parse.Query
 * object, which is performed on UserEvent object. UserEvent is a customer-defined subclass of Parse.Object)
 *
 * Modified by Renpeng @ 17:00 4/19/2015
 */
function ParsePullEvent(obj) {
    //owner, limitNumber, descendingOrderKey, accessibility, beforeAt, displayFunction
    var UserEvent = Parse.Object.extend("UserEvent");
    var query = new Parse.Query(UserEvent);

    if (("owner" in obj) && (obj.owner != null)) {
        query.equalTo("owner",obj.owner);
    }else{
        query.lessThan("reportNum", 11);
        query.notEqualTo("reportUserId", Parse.User.current().id);
    }

    if (("limitNumber" in obj) && (obj.limitNumber != null)) {
        query.limit(obj.limitNumber);
    }

    if (("accessibility" in obj) && (obj.accessibility != null)) {
        if (obj.accessibility == "public") {
            query.equalTo("visibility",true);
        }
    }

    if (("descendingOrderKey" in obj) && (obj.descendingOrderKey != null)) {
        query.descending(obj.descendingOrderKey);
    }
    
    if (("beforeAt" in obj) && (typeof(obj.beforeAt) != "undefined") && (obj.beforeAt != null)) {
        query.lessThan("createdAt",obj.beforeAt);
    }

    // Note this part needs further consideration
    //if (("filterMode" in obj) && (typeof(obj.filterMode) != "undefined") && (obj.filterMode != null)) {
    //    if (filterMode == 1) {
    //
    //    } else if (filterMode == 2) {
    //
    //    } else if (filterMode == 3) {
    //
    //    }
    //}

    if(("eventId" in obj) && obj.eventId != null){
        query.equalTo("objectId", obj.eventId);
    }

    // query.find method will return an array of UserEvnet objects to be found
    query.find({
        success: function(userEvents) {
            obj.displayFunction(userEvents);
        }
    });
}

/* This function is designed to select user activities according to their id by calling Parse API "find" (instance method
 * of Parse.Query object, which is performed on UserEvent object. UserEvent is a customer-defined subclass of Parse.Object)
 */
function ParseSelectEvent(id, displayFunction) {
    var UserEvent = Parse.Object.extend("UserEvent");
    var query = new Parse.Query(UserEvent);
    query.equalTo("objectId",id);

    // query.find method will return an array of UserEvent objects to be found (since UserEvent id is unique, the array length will be 1 at most)
    query.find({
        success: function(userEvents) {
            displayFunction(userEvents);
        }
    });
}

/* This function is designed to pull up comments for user activities by calling Parse API "find" (instance method
 * of Parse.Query object, which is performed on Comment object. Comment is a customer-defined subclass of Parse.Object)
 */
function ParsePullEventComment(eventId, descendingOrderKey, displayFunction) {
    var comment = Parse.Object.extend("Comment");
    var query = new Parse.Query(comment);
    query.equalTo("eventId",eventId);
    query.ascending(descendingOrderKey);

    // query.find method will return an array of Comment objects to be found
    query.find({
        success: function(comments) {
            displayFunction(comments);
        }
    });
}

/* This function is designed to add and save comments for user activities by calling Parse API "set" adn "save"
 * (instance method of Comment object. Comment is a customer-defined subclass of Parse.Object)
 */
function ParseAddEventComment(eventId, owner, content, option) {
    var Comment = Parse.Object.extend("Comment");
    var comment = new Comment;
    var currentUser = Parse.User.current();
    comment.set("eventId", eventId);
    comment.set("owner",owner);
    comment.set("ownerName",currentUser.get("name"));
    comment.set("content",content);
    if (("replyToUserId" in option) && (option.replyToUserId != null)) {
        comment.set("replyToUserId", option.replyToUserId);
    }
    comment.save(null, {
        success: function(comment) {
            ParseUpdateEventCommentNumber(1, eventId, option);
        },
        error: function(comment, error){
            option.errorFunction("Error: " + error.code + " " + error.message);
        }
    });
}

/* This function is designed to update the comment number for user activities by calling Parse API "get" (instance method
 * of Parse.Query object, which is performed on UserEvent object. UserEvent is a customer-defined subclass of Parse.Object)
 */
function ParseUpdateEventCommentNumber(count, eventId, option){
    var UserEvent = Parse.Object.extend("UserEvent");
    var query = new Parse.Query(UserEvent);

    // query.get method will return a single UserEvent object to be got
    query.get(eventId, {
        success: function(userEvent){
            userEvent.increment("commentNumber",count);
            userEvent.save(null, {
                success: function(userEvent){
                    option.successFunction(userEvent,option);
                },
                error: function(comment, error){
                    option.errorFunction("Error: " + error.code + " " + error.message);
                }
            });
        },
        error: function(comment, error){
            option.errorFunction("Error: " + error.code + " " + error.message);
        }
    });
}

/* This function is designed to add and save interests for user activities by calling Parse API "get" (instance method
 * of Parse.Query object, which is performed on UserEvent object. UserEvent is a customer-defined subclass of Parse.Object)
 */
function ParseAddInterest(eventId, displayFunction){
    var UserEvent = Parse.Object.extend("UserEvent");
    var query = new Parse.Query(UserEvent);

    // query.get method will return a single UserEvent object to be got
    query.get(eventId, {
        success: function(object){
            object.addUnique("interestId",Parse.User.current().id);
            object.save(null, {
                success: function(object){
                    displayFunction(object);
                }
            });
        }
    });
}

/* This function is designed to remove interests for user activities by calling Parse API "get" (instance method
 * of Parse.Query object, which is performed on UserEvent object. UserEvent is a customer-defined subclass of Parse.Object)
 */
function ParseRemoveInterest(eventId, displayFunction){
    var UserEvent = Parse.Object.extend("UserEvent");
    var query = new Parse.Query(UserEvent);

    // query.get method will return a single UserEvent object to be got
    query.get(eventId, {
        success: function(object){
            object.remove("interestId",Parse.User.current().id);
            object.save(null, {
                success: function(object){
                    displayFunction(object);
                }
            });
        }
    });
}

/* This function is designed to add and save going intentions for user activities by calling Parse API "get" (instance method
 * of Parse.Query object, which is performed on UserEvent object. UserEvent is a customer-defined subclass of Parse.Object)
 */
function ParseAddGoing(eventId, displayFunction){
    var UserEvent = Parse.Object.extend("UserEvent");
    var query = new Parse.Query(UserEvent);

    // query.get method will return a single UserEvent object to be got
    query.get(eventId, {
        success: function(object){
            object.addUnique("goingId",Parse.User.current().id);
            object.save(null, {
                success: function(object){
                    displayFunction(object);
                }
            });
        }
    });
}

/* This function is designed to remove going intentions for user activities by calling Parse API "get" (instance method
 * of Parse.Query object, which is performed on UserEvent object. UserEvent is a customer-defined subclass of Parse.Object)
 */
function ParseRemoveGoing(eventId, displayFunction){
    var UserEvent = Parse.Object.extend("UserEvent");
    var query = new Parse.Query(UserEvent);

    // query.get method will return a single UserEvent object to be got
    query.get(eventId, {
        success: function(object){
            object.remove("goingId",Parse.User.current().id);
            object.save(null, {
                success: function(object){
                    displayFunction(object);
                }
            });
        }
    });
}

/* This function is designed to delete user activities according to their id by calling Parse API "get" (instance method
 * of Parse.Query object, which is performed on UserEvent object. UserEvent is a customer-defined subclass of Parse.Object)
 */
function ParseDeleteEvent(eventId, displayFunction){
    var UserEvent = Parse.Object.extend("UserEvent");
    var query = new Parse.Query(UserEvent);

    // query.get method will return a single UserEvent object to be got
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

/* This function is designed to get user profile according to their username by calling Parse API
 * "first" (instance method of Parse.Query object, which is performed on Parse.User object.)
 */
function ParseGetProfileByUsername(username, displayFunction, data){
    var query = new Parse.Query(Parse.User);
    query.equalTo("username", username);

    // query.first method will return a single Parse.User object to be found
    query.first({
        success: function(user) {
            displayFunction(user, data);
            CacheUpdateUser(user);
        }
    });
}

/* This function is designed to get user profile according to their Id by calling Parse API
 * "first" (instance method of Parse.Query object, which is performed on Parse.User object.)
 */
function ParseGetProfileByUserId(userId, displayFunction, data){
    var query = new Parse.Query(Parse.User);
    query.equalTo("objectId", userId);

    // query.first method will return a single Parse.User object to be found
    query.first({
        success: function(user) {
            displayFunction(user, data);
            CacheUpdateUser(user);
        }
    });
}

/* This function is designed to save user profile by calling
 * Parse API "save" (instance method of Parse.User object)
 */
function ParseSaveProfile(name, gender, birthdate, motto, major, school, interest, location, displayFunction) {
    var currentUser = Parse.User.current();
    
    currentUser.set("name",name);
    currentUser.set("gender",gender);
    currentUser.set("birthdate",birthdate);
    currentUser.set("motto",motto);
    currentUser.set("major",major);
    currentUser.set("school",school);
    currentUser.set("interest",interest);
    currentUser.set("location",location);
    currentUser.save(null,{
        success: function(object){
            displayFunction();
            CacheUpdateUser(object);
        }
    });
}

/* This function is designed to save user profile photo by calling Parse API "first" (instance method of
 * Parse.Query object, which is performed on Photo object. Photo is a customer-defined subclass of Parse.Object)
 */
function ParseSaveProfilePhoto(id, photo, photo120, displayFunction) {
    var Photo = Parse.Object.extend("Photo");
    var query = new Parse.Query(Photo);

    if (photo == null)
        return;
    query.equalTo("userId",id);

    // query.first method will return a single Photo object to be found
    query.first({
        success: function(photoObject) {
            photoObject.set("profilePhoto120",photo120);
            var parseFile = new Parse.File(photo.name, photo);
            parseFile.save().then(function(object) {
                photoObject.set("profilePhoto",object.url());
                photoObject.save(null,{
                    success: function(object){
                        displayFunction(object);
                        CacheUpdatePhoto(object);
                    }
                });
            }, function(error) {
                
            });
        }
    });
}

/* This function is designed to get user profile photo according to their Id by calling Parse API "first" (instance
 * method of Parse.Query object, which is performed on Photo object. Photo is a customer-defined subclass of Parse.Object)
 */
function ParseGetProfilePhotoByUserId(userId, displayFunction, data) {
    var Photo = Parse.Object.extend("Photo");
    var query = new Parse.Query(Photo);
    query.equalTo("userId",userId);

    // query.first method will return a single Photo object to be found
    query.first({
        success: function(object){
            displayFunction(object, data);
            CacheUpdatePhoto(object);
        }
    });
}

/* This function is designed to get user profile photo according to their username by calling Parse API "first" (instance
 * method of Parse.Query object, which is performed on User object. User is a customer-defined subclass of Parse.Object)
 */
function ParseGetProfilePhotoByUsername(username, displayFunction, data) {
    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.equalTo("username",username);

    // query.first method will return a single User object to be found
    query.first({
        success: function(object){
            ParseGetProfilePhotoByUserId(object.id, displayFunction, data);
        }
    });
}

/* This function is designed to pull up users according to their locations by calling Parse API "find"
 * (instance method of Parse.Query object, which is performed on Parse.User object.)
 */
function ParsePullUserByGeolocation(latitude,longitude,latitudeLimit,longitudeLimit,descendingOrderKey,displayFunction){
    var currentUser = Parse.User.current();
    currentUser.set("latitude",latitude);
    currentUser.set("longitude",longitude);
    currentUser.save();

    var query = new Parse.Query(Parse.User);
    query.notEqualTo("username", currentUser.getUsername());
    query.greaterThan("latitude",(latitude-latitudeLimit/2.0));
    query.lessThan("latitude",(latitude+latitudeLimit/2.0));
    query.greaterThan("longitude",(longitude-longitudeLimit/2.0));
    query.lessThan("longitude",(longitude+longitudeLimit/2.0));
    query.descending(descendingOrderKey);

    // query.find method will return an array of Parse.User objects to be found
    query.find({
        success: function(users){
            displayFunction(latitude,longitude,users);
        }
    });
}

/* This function is designed to send friend request by calling Parse API "first" (instance method of
 * Parse.Query object, which is performed on Friend object. Friend is a customer-defined subclass of Parse.Object)
 */
function ParseSendFriendRequest(ownerId, friendId, successFunction){
    var Friend = Parse.Object.extend("Friend");
    var query = new Parse.Query(Friend);
    query.equalTo("owner", ownerId);
    query.equalTo("friend",friendId);

    // query.first method will return a single Friend object to be found
    query.first({
        success: function(object){
            if (typeof(object)=="undefined") {
                var friend = new Friend;
                friend.set("owner", ownerId);
                friend.set("friend", friendId);
                friend.set("valid",false);
                friend.set("read",false);
                friend.save(null, {
                    success: function(friend){
                        successFunction(friend);
                        CacheUpdateFriend(friend);
                    }
                });

            } else {
                successFunction(object);
                CacheUpdateFriend(object);
            }
        }
    });
}

/* This function is designed to accept friend request by calling Parse API "first" (instance method of
 * Parse.Query object, which is performed on Friend object. Friend is a customer-defined subclass of Parse.Object)
 */
function ParseAcceptFriendRequest(friendObjectId, ownerId, friendId, successFunction){
    var Friend = Parse.Object.extend("Friend");
    var query = new Parse.Query(Friend);

    if (friendObjectId != null) {
        query.equalTo("objectId",friendObjectId);
    } else {
        query.equalTo("owner",ownerId);
        query.equalTo("friend",friendId);
    }

    // query.first method will return a Friend single object to be found
    query.first({
        success:function(object){
            // update friend's friend data
            object.set("valid",true);
            object.set("read",true);
            object.save(null, {
                success: function(object){
                    CacheUpdateFriend(object);
                    // try to update current user's data
                    var ownerId = object.get("friend");
                    var friendId = object.get("owner");
                    var query = new Parse.Query(Friend);
                    query.equalTo("owner",ownerId);
                    query.equalTo("friend",friendId);

                    // query.first method will return a Friend single object to be found
                    query.first({
                        success: function(object){
                            if (typeof(object) == "undefined") {
                                // if friend's data doesn't exist
                                var friend = new Friend;
                                friend.set("owner",ownerId);
                                friend.set("friend",friendId);
                                friend.set("valid",true);
                                friend.set("read",true);
                                friend.save(null, {
                                    success: function(object){
                                        successFunction(object);
                                        CacheUpdateFriend(object);
                                    }
                                });

                            } else {
                                // if existed
                                object.set("valid",true);
                                object.set("read",true);
                                object.save(null,{
                                    success: function(object){
                                        successFunction(object);
                                        CacheUpdateFriend(object);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });
}

/* This function is designed to reject friend request by calling Parse API "first" (instance method of
 * Parse.Query object, which is performed on Friend object. Friend is a customer-defined subclass of Parse.Object)
 */
function ParseRejectFriendRequest(friendObjectId, ownerId, friendId, successFunction){
    var Friend = Parse.Object.extend("Friend");
    var query = new Parse.Query(Friend);

    if (friendObjectId != null) {
        query.equalTo("objectId",friendObjectId);
    } else {
        query.equalTo("owner",ownerId);
        query.equalTo("friend",friendId);
    }

    // query.first method will return a single Friend object to be found
    query.first({
        success:function(object){
            CacheRemoveFriend(object);
            object.destroy({
                success: function(object){
                    successFunction(friendId);
                }
            });
        }
    });
}

/* This function is designed to pull up new friend request by calling Parse API "find" (instance method of
 * Parse.Query object, which is performed on Friend object. Friend is a customer-defined subclass of Parse.Object)
 */
function ParsePullNewFriendRequest(userId, descendingOrderKey, displayFunction) {
    var Friend = Parse.Object.extend("Friend");
    var query = new Parse.Query(Friend);
    query.equalTo("friend",userId);
    query.equalTo("valid",false);
    query.descending(descendingOrderKey);

    // query.find method will return an array of Friend objects to be found
    query.find({
        success: function(objects){
            displayFunction(objects);
            for (var i = 0; i < objects.length; i++) {
                CacheUpdateFriend(objects[i]);
            }
        }
    });
}

/* This function is designed to pull up unread friend request by calling Parse API "find" (instance method of
 * Parse.Query object, which is performed on Friend object. Friend is a customer-defined subclass of Parse.Object)
 */
function ParsePullUnreadFriendRequest(userId, displayFunction) {
    var Friend = Parse.Object.extend("Friend");
    var query = new Parse.Query(Friend);
    query.equalTo("friend",userId);
    query.equalTo("read",false);

    // query.find method will return an array of Friend objects to be found
    query.find({
        success: function(objects){
            displayFunction(objects);
            for (var i = 0; i < objects.length; i++) {
                CacheUpdateFriend(objects[i]);
            }
        }
    });
}

/* This function is designed to check if two users are friends or not by calling Parse API "first" (instance method of
 * Parse.Query object, which is performed on Friend object. Friend is a customer-defined subclass of Parse.Object)
 * Also refer to function CacheCheckFriend for detailed description how this function works.
 */
function ParseCheckFriend(ownerId, friendId, displayFunction) {
    var Friend = Parse.Object.extend("Friend");
    var query = new Parse.Query(Friend);
    query.equalTo("owner",ownerId);
    query.equalTo("friend",friendId);

    // query.first method will return a single Friend object to be found
    query.first({
        success: function(object){
            displayFunction(ownerId, friendId, object);
            CacheUpdateFriend(object);
        }
    });
}

/* This function is designed to pull up my friend list(those with friend requests accepted) by calling Parse API "find" (instance method of
 * Parse.Query object, which is performed on Friend object. Friend is a customer-defined subclass of Parse.Object)
 */
function ParsePullMyFriend(ownerId, descendingOrderKey, displayFunction) {
    var Friend = Parse.Object.extend("Friend");
    var query = new Parse.Query(Friend);
    query.equalTo("owner",ownerId);
    query.equalTo("valid",true);
    query.descending(descendingOrderKey);

    // query.find method will return an array of Friend objects to be found
    query.find({
        success: function(objects){
            displayFunction(objects);
            for (var i = 0; i < objects.length; i++) {
                CacheUpdateFriend(objects[i]);
            }
        }
    });
}

/* This function is designed to pull up all of my friends(including those who have received my friend requests but have not accepted and
 * those who have sent me friend requests but have not got accepted) by calling Parse API "first" (instance method of Parse.Query object,
 * which is performed on Friend object. Friend is a customer-defined subclass of Parse.Object)
 */
function ParsePullAllFriendObjectById(ownerId){
    var Friend = Parse.Object.extend("Friend");
    var queryAsOwner = new Parse.Query(Friend);
    queryAsOwner.equalTo("owner",ownerId);
    var queryAsFriend = new Parse.Query(Friend);
    queryAsFriend.equalTo("friend",ownerId);
    var query = Parse.Query.or(queryAsOwner,queryAsFriend);

    // query.find method will return an array of Friend objects to be found
    query.find({
        success: function(objects){
            for (var i = 0; i < objects.length; i++) {
                CacheUpdateFriend(objects[i]);
            }
        }
    });
}

/* This function is designed to search users according their name and email by calling Parse API "find"
 * (instance method of Parse.Query object, which is performed on Parse.User object.)
 */
function ParseSearchUserByEmailAndName(string, limitNumber, descendingOrderKey, displayFunction){
    var queryByEmail = new Parse.Query(Parse.User);
    var queryByName = new Parse.Query(Parse.User);
    var currentUser = Parse.User.current();

    queryByEmail.matches("username",".*"+string+".*");
    queryByName.matches("name",".*"+string+".*");

    var query = Parse.Query.or(queryByEmail, queryByName);
    query.notEqualTo("username", currentUser.getUsername());
    query.descending(descendingOrderKey);
    if (limitNumber != null) {
        query.limit(limitNumber);
    }

    // query.find method will return an array of Parse.User objects to be found
    query.find({
        success: function(objects){
            displayFunction(objects);
        }
    });
}

/* This function is designed to set the friend request as read by calling Parse API "get" (instance method of
 * Parse.Query object, which is performed on Friend object. Friend is a customer-defined subclass of Parse.Object)
 */
function ParseSetRequestRead(objectId){
    var Friend = Parse.Object.extend("Friend");
    var query = new Parse.Query(Friend);

    // query.get method will return a single Friend object to be got
    query.get(objectId,{
        success:function(object){
            object.set("read",true);
            object.save();
        }
    });
}

/* This function is designed to get the group Id by calling Parse API "first" (instance method of
 * Parse.Query object, which is performed on Group object. Group is a customer-defined subclass of Parse.Object)
 */
function ParseGetGroupIdInPrivateChat(memberId, successFunction){
    var Group = Parse.Object.extend("Group");
    var query = new Parse.Query(Group);
    query.containsAll("memberId",memberId);
    query.equalTo("isGroup", false);
    // query.equalTo("memberNum",memberId.length);

    // query.first method will return a single Group object to be found
    query.first({
        success: function(object){
            if (typeof(object) == "undefined") {
                var group = new Group;
                group.set("memberId",memberId);
                // group.set("memberNum",memberId.length);
                if (memberId.length > 2) {
                    group.set("isGroupChat",true);
                } else {
                    group.set("isGroupChat",false);
                }
                group.save(null,{
                    success: function(object){
                        successFunction(object);
                        CacheUpdateGroup(object)
                    }
                });
            } else {
                successFunction(object);
                CacheUpdateGroup(object)
            }
        }
    });
}

/* This function is designed to create a new group.
 * important !!! only create a new group(isGroup == true) for group chat, not a private chat
 * Create by Yaliang, 4/18/2015
 */
function ParseCreateNewGroup(memberId, successFunction){
    var Group = Parse.Object.extend("Group");
    var group = new Group;

    group.set("memberId",memberId);
    if (memberId.length > 2) {
        group.set("isGroupChat",true);
    } else {
        group.set("isGroupChat",false);
    }
    group.save(null, {
        success: function(object){
            successFunction(object);
            CacheUpdateGroup(object);
        }
    });
}

/* This function is designed to get the group members by calling Parse API "get" (instance method of
 * Parse.Query object, which is performed on Group object. Group is a customer-defined subclass of Parse.Object)
 */
function ParseGetGroupMember(groupId, successFunction, data){
    var Group = Parse.Object.extend("Group");
    var query = new Parse.Query(Group);

    // query.get method will return a single Group object to be got
    query.get(groupId,{
        success: function(object){
            successFunction(object, data);
            CacheUpdateGroup(object);
        }
    });
}

/* This function is designed to set the group name by calling Parse API "get" (instance method of
 * Parse.Query object, which is performed on Group object. Group is a customer-defined subclass of Parse.Object)
 */
function ParseSetGroupName(groupId, groupName, displayFunction){
    var Group = Parse.Object.extend("Group");
    var query = new Parse.Query(Group);

    // query.get method will return a single Group object to be got
    query.get(groupId,{
        success: function(object){
            object.set("groupName", groupName);
            object.save(null,{
                success: function(object){
                    displayFunction(object);
                    CacheUpdateGroup(object);
                }
            });
        }
    });
}

/* This function is designed to set the chatting message as read by calling Parse API "first" (instance method of
 * Parse.Query object, which is performed on Chat object. Chat is a customer-defined subclass of Parse.Object)
 */
function ParseSetChatObjectAsRead(ownerId, groupId, count, successFunction){
    var Chat = Parse.Object.extend("Chat");
    var query = new Parse.Query(Chat);
    query.equalTo("ownerId",ownerId);
    query.equalTo("groupId",groupId);

    // query.first method will return a single Chat object to be found
    query.first({
        success: function(object){
            if (typeof(object) == "undefined") {
                var chat = new Chat;
                chat.set("ownerId",ownerId);
                chat.set("groupId",groupId);
                chat.set("hidden",true);
                chat.set("unreadNum",0);
                chat.save(null, {
                    success: function(object){
                        successFunction(object);
                        CacheUpdateChat(object);
                    }
                });
            } else {
                if (count == null) {
                    count = object.get("unreadNum");
                }
                if (count != 0) {
                    object.increment("unreadNum",-count);
                    object.set("hidden",false);
                    object.save(null,{
                        success: function(object){
                            successFunction(object);
                            CacheUpdateChat(object);
                        }
                    });
                } else {
                    successFunction(object);
                    CacheUpdateChat(object);
                }
            }
        }
    });
}

/* This gunction is designed to add memebers to a group
 * The obj include (groupId, newMemberList and successFunction)
 * Create By Yaliang
 */
function ParseAddGroupMember(obj){
    //obj = {groupId:groupId, memeberId: newMemberList}
    var Group = Parse.Object.extend("Group");
    var query = new Parse.Query(Group);

    // query.get method will return a single Group object to be got
    query.get(obj.groupId,{
        success: function(object){
            for (var i=0; i<obj.newMemberList.length; i++) {
                object.addUnique("memberId",obj.newMemberList[i]);
            }
            // object.increment("memberNum", obj.newMemberList.length);
            object.set("isGroupChat",true);
            object.save(null,{
                success: function(object){
                    obj.successFunction(object);
                    CacheUpdateGroup(object);
                }
            });
        }
    });
}

/* This gunction is designed to remove some memebers of a group
 * The obj include (groupId, removeMemberList and successFunction)
 * Create By Yaliang
 */
function ParseRemoveGroupMember(obj){
    //obj = {groupId:groupId, memeberId: removeMemberList}
    var Group = Parse.Object.extend("Group");
    var query = new Parse.Query(Group);

    // query.get method will return a single Group object to be got
    query.get(obj.groupId,{
        success: function(object){
            for (var i=0; i<obj.removeMemberList.length; i++) {
                object.remove("memberId",obj.removeMemberList[i]);
            }
            // object.increment("memberNum", -obj.removeMemberList.length);
            object.save(null,{
                success: function(object){
                    obj.successFunction(object, obj.data);
                    CacheUpdateGroup(object);
                }
            });
        }
    });
}

/* This function is designed to initialize a chatting message by calling Parse API "first" (instance method of
 * Parse.Query object, which is performed on Chat object. Chat is a customer-defined subclass of Parse.Object)
 */
function ParseInitializeChatObjectInGroup(obj){
    //obj = {groupId:groupId, ownerId:memberId[i]}
    var Chat = Parse.Object.extend("Chat");
    var query = new Parse.Query(Chat);
    query.equalTo("ownerId",obj.ownerId);
    query.equalTo("groupId",obj.groupId);

    // query.first method will return a single Chat object to be found
    query.first({
        success: function(object) {
            if (typeof(object) == "undefined") {
                var Chat = Parse.Object.extend("Chat");
                var chat = new Chat;
                chat.set("ownerId", obj.ownerId);
                chat.set("groupId", obj.groupId);
                chat.set("hidden", false);
                chat.set("unreadNum",0);
                chat.save(null, {
                    success: function(object) {
                        CacheUpdateChat(object);
                        obj.successFunction(object);
                    }
                });
            } else {
                CacheUpdateChat(object);
                obj.successFunction(object);
            }
        }
    });
}

/* This function is designed to pull up users' chatting messages by calling Parse API "find" (instance method of
 * Parse.Query object, which is performed on Message object. Message is a customer-defined subclass of Parse.Object)
 */
function ParsePullChatMessage(groupId, limitNum, descendingOrderKey, beforeAt, displayFunction, data) {
    var Message = Parse.Object.extend("Message");
    var query = new Parse.Query(Message);
    query.equalTo("groupId",groupId);
    query.descending(descendingOrderKey);
    if (beforeAt != null) {
        query.lessThan("createdAt", beforeAt);
    }
    query.limit(limitNum);

    // query.find method will return an array of Message objects to be found
    query.find({
        success: function(objects){
            displayFunction(objects, data);
            for (var i = 0; i < objects.length; i++) {
                CacheUpdateMessage(objects[i]);
            }
        }
    });
}

/* This function is designed to pull up all chatting messages according to their group Id to update the local cache
 * by calling Parse API "find" (instance method of Parse.Query object, which is performed on Message object. Message
 * is a customer-defined subclass of Parse.Object)
 */
function ParsePullAllMessageByGroupIdForCache(groupId, limitNum, beforeAt, displayFunction){
    var Message = Parse.Object.extend("Message");
    var query = new Parse.Query(Message);
    query.equalTo("groupId",groupId);

    // query.find method will return an array of Message objects to be found
    query.find({
        success: function(objects){
            for (var i = 0; i < objects.length; i++) {
                CacheUpdateMessage(objects[i]);
            }
            CachePullChatMessage(groupId, limitNum, beforeAt, displayFunction);
        }
    });
}

/* This function is designed to save chatting messages by calling Parse API "save" (instance method of
 * Parse.Query object, which is performed on Message object.)
 */
function ParseAddChatMessage(senderId, groupId, text, displayFunction){
    var Message = Parse.Object.extend("Message");
    var message = new Message();
    message.set("senderId",senderId);
    message.set("groupId", groupId);
    message.set("text", text);
    message.save(null, {
        success: function(object){
            displayFunction(object);
            CacheUpdateMessage(object)
        }
    });
}

/* This function is designed to set and save chatting messages according to their group Id by calling Parse API "first" (instance method of
 * Parse.Query object, which is performed on Chat object. Chat is a customer-defined subclass of Parse.Object)
 */
function ParseSetChatObjectReadFalseByCurrentIndexAndGroupId(senderId, memberId, currentIndex, groupId, text, notificationFunction) {
    var Chat = Parse.Object.extend("Chat");
    var query = new Parse.Query(Chat);
    var ownerId = memberId[currentIndex];
    query.equalTo("ownerId", ownerId);
    query.equalTo("groupId", groupId);
    if (senderId != ownerId) {  // the sender is not the owner
        // query.first method will return a single Chat object to be found
        query.first({
            success:function(object){
                if (typeof(object) == "undefined") {
                    // create new chat object for members of group
                    var chat = new Chat;
                    chat.set("ownerId", ownerId);
                    chat.set("groupId", groupId);
                    chat.set("hidden", false);
                    chat.set("unreadNum", 1);
                    chat.save(null,{
                        success: function(object) {
                            notificationFunction(senderId,text,ownerId);
                            if (currentIndex + 1 < memberId.length) {
                                ParseSetChatObjectReadFalseByCurrentIndexAndGroupId(senderId, memberId, currentIndex+1, groupId, text, notificationFunction);
                            }
                        }
                    });
                } else {
                    // set unread number plus 1 for chat object
                    object.increment("unreadNum", 1);
                    object.set("hidden", false);
                    object.save(null, {
                        success: function(object) {
                            notificationFunction(senderId,text,ownerId);
                            if (currentIndex + 1 < memberId.length) {
                                ParseSetChatObjectReadFalseByCurrentIndexAndGroupId(senderId, memberId, currentIndex+1, groupId, text, notificationFunction);
                            }
                        }
                    });
                }
            }
        });
    } else { // the sender is the owner
        // query.first method will return a single Chat object to be found
        query.first({
            success: function(object){
                object.set("hidden", false);
                object.save(null, {
                    success: function(object) {
                        CacheUpdateChat(object);
                        if (currentIndex + 1 < memberId.length) {
                            ParseSetChatObjectReadFalseByCurrentIndexAndGroupId(senderId, memberId, currentIndex+1, groupId, text, notificationFunction);
                        }
                    }
                });
            }
        });
    }
}

/* This function is designed to set and save chatting messages according to their group Id by calling Parse API "first" (instance method of
 * Parse.Query object, which is performed on Group object. Group is a customer-defined subclass of Parse.Object)
 */
function ParseSetGroupMemberChatObjectReadFalse(senderId, groupId, text, notificationFunction) {
    var Group = Parse.Object.extend("Group");
    var query = new Parse.Query(Group);
    query.equalTo("objectId",groupId);

    // query.first method will return a single Group object to be found
    query.first({
        success: function(object){
            // get the group members' id
            CacheUpdateGroup(object);
            var memberId = object.get("memberId");
            ParseSetChatObjectReadFalseByCurrentIndexAndGroupId(senderId, memberId, 0, groupId, text, notificationFunction);
        }
    });
}

/* This function is designed to pull up my chatting messages by calling Parse API "find" (instance method of
 * Parse.Query object, which is performed on Chat object. Chat is a customer-defined subclass of Parse.Object)
 */
function ParsePullMyChat(ownerId,descendingOrderKey,displayFunction){
    var Chat = Parse.Object.extend("Chat");
    var query = new Parse.Query(Chat);
    query.equalTo("ownerId",ownerId);
    query.equalTo("hidden",false);
    query.descending(descendingOrderKey);

    // query.find method will return an array of Chat objects to be found
    query.find({
        success: function(objects){
            displayFunction(objects);
            for (var i=0; i<objects.length; i++) {
                CacheUpdateChat(objects[i]);
            }
        }
    });
}

/* This function is designed to pull up unread chatting messages by calling Parse API "find" (instance method of
 * Parse.Query object, which is performed on Chat object. Chat is a customer-defined subclass of Parse.Object)
 */
function ParsePullUnreadChat(ownerId, descendingOrderKey, displayFunction){
    var Chat = Parse.Object.extend("Chat");
    var query = new Parse.Query(Chat);
    query.equalTo("ownerId",ownerId);
    query.equalTo("hidden",false);
    query.descending(descendingOrderKey);
    query.greaterThan("unreadNum",0);

    // query.find method will return an array of Chat objects to be found
    query.find({
        success: function(objects){
            displayFunction(objects);
            for (var i=0; i<objects.length; i++) {
                CacheUpdateChat(objects[i]);
            }
        }
    });
}

/* This function is designed to set the hidden attribute of the chat object from
 * the Parse server to be true. The chat object is not destroyed and will be
 * available in later use. If you want to destroy the chat object, see ParseDeleteChat.
 */
function ParseHideChat(chatObjectId, ownerId, groupId, displayFunction) {
    var Chat = Parse.Object.extend("Chat");
    var query = new Parse.Query(Chat);

    if (chatObjectId != null) {
        query.equalTo("objectId", chatObjectId);
    } else {
        query.equalTo("ownerId", ownerUd);
        query.equalTo("groupId", groupId);
    }

    // query.first method will return a single Chat object to be found
    query.first({
        success:function(object){
            object.set("hidden", true);
            object.save(null,{
                success: function(object) {
                    CacheUpdateChat(object);
                    displayFunction(object);
                }
            });
        }
    });
}

/* This function is designed to delete the chat object from the Parse server.
 *  The chat object is destroyed and will no longer be available in later use.
 *  If you want to hide the chat object instead of destroying it, see ParseHideChat.
 */

/****************************************/
/* Modified by Yaliang 
/****************************************/
function ParseDeleteChat(chatObjectId, ownerId, groupId, displayFunction) {
    var Chat = Parse.Object.extend("Chat");
    var query = new Parse.Query(Chat);

    if (chatObjectId != null) {
        query.equalTo("objectId", chatObjectId);
    } else {
        query.equalTo("ownerId", ownerId);
        query.equalTo("groupId", groupId);
    }

    // query.first method will return a single Chat object to be found
    query.first({
        success:function(object){
            object.destroy({
                success:function(object){
                    CacheDeleteChat(object);
                    displayFunction(object);
                }
            });
        }
    });
}

/* This function is designed to update the local cache by calling Parse API "find" (instance method of
 * Parse.Query object, which is performed on customer-defined subclass of Parse.Object)
 */
function ParseUpdateCache(className, updateIdList,lastUpdate){
    var ClassObject = Parse.Object.extend(className);
    var query = new Parse.Query(ClassObject);
    query.containedIn("objectId",updateIdList);
    query.greaterThan("updatedAt",lastUpdate);

    // query.find method will return an array of objects to be found of custom-defined types
    query.find({
        success: function(objects){
            //console.log(className+": "+lastUpdate.toJSON()+" "+objects.length);
            for (var i = 0; i < objects.length; i++) {
                switch(className) {
                    case "Photo":
                        CacheUpdatePhoto(objects[i]);
                        break;
                    case "User":
                        CacheUpdateUser(objects[i]);
                        break;
                    case "Friend":
                        CacheUpdateFriend(objects[i]);
                        break;
                    case "Chat":
                        CacheUpdateChat(objects[i]);
                        break;
                    case "Group":
                        CacheUpdateGroup(objects[i]);
                        break;
                    case "Message":
                        CacheUpdateMessage(objects[i]);
                        break;
                    default:
                }
            }
        }
    });
}

/* This function is designed to update and save user GCMID by calling Parse API "set" and "save" (instance method of
 * Parse.User object.
 */
function ParseUpdateGCMId(regid, displayFunction){
    var currentUser = Parse.User.current();
    currentUser.set("GCMId",regid.toString());
    currentUser.save(null,{
        success: function(object){
            displayFunction(object);
            CacheUpdateUser(object);
        }
    });
}

/* This function is designed to update and save user APNId by calling Parse API "set" and "save" (instance method of
 * Parse.User object.
 */
function ParseUpdateAPNId(regid, displayFunction){
    var currentUser = Parse.User.current();
    currentUser.set("APNId",regid.toString());
    currentUser.save(null,{
        success: function(object){
            displayFunction(object);
            CacheUpdateUser(object);
        }
    });
}

/* This function is designed to update the name field in a comment by calling Parse API "find" (instance method of
 * Parse.Query object, which is performed on Comment object. Comment is a customer-defined subclass of Parse.Object)
 */
function ParseUserNameFieldUpdate(i){
    var Comment = Parse.Object.extend("Comment");
    var query = new Parse.Query(Comment);
    query.descending("createdAt");

    // query.find method will return an array of Comment objects to be found
    query.find({
        success: function(comments){
                var query = new Parse.Query(Parse.User);
                var userid = comments[i].get("owner");
                var objectId = comments[i].id;
                //console.log(email);
                query.equalTo("obejctId", userid);

                // query.find method will return an array of Parse.User objects to be found
                query.find({
                    success: function(user){
                        var ownerName = user[0].get("name");
                        //console.log(ownerName);
                        var Comment = Parse.Object.extend("Comment");
                        var query = new Parse.Query(Comment);

                        // query.get method will return a single Comment object to be got
                        query.get(objectId,{
                            success: function(comment){
                                //console.log(ownerName);
                                comment.set("ownerName",ownerName);
                                comment.save(null, {
                                    success: function(comments){
                                        //console.log("success");
                                    }
                                });
                            },
                            error: function(comment, error){
                                //console.log("Error: " + error.code + " " + error.message);
                            }
                        });
                    },
                    error: function(userEvent, error){
                        //console.log("Error: " + error.code + " " + error.message);
                    }
                });
        }
    });
}

/* This variable...
 */
var refreshNumber=0;

/* This variable...
 */
var ChatObjectSet;

/* This function is designed to refresh comments by calling function "ParseOwnerFieldUpdate"
 */
function ParseRefreshComment(){
    ParseOwnerFieldUpdate();
    refreshNumber = refreshNumber+1;
    if (refreshNumber == 293) {
        return;
    }

    setTimeout(function(){
        ParseRefreshComment();
    }, 1000);
}

/* This function is designed to refresh comments by calling Parse API "find" (instance method of
 * Parse.Query object, which is performed on Comment object. Comment is a customer-defined subclass of Parse.Object)
 */
function ParseOwnerFieldUpdate(){
    var Comment = Parse.Object.extend("Comment");
    var query = new Parse.Query(Comment);
    query.descending("createdAt");

    // query.find method will return an array of Comment objects to be found
    query.find({
        success: function(objects) {
            var username = objects[refreshNumber].get("owner");
            var displayFunction = function(object, data){
                data.comment.set("owner", object.id);
                data.comment.save(null, {
                    success: function(object) {
                        console.log(object.get('owner'));
                    }
                });
            };
            CacheGetProfileByUsername(username, displayFunction, {comment: objects[refreshNumber]});
        }
    });
}

/* This function is designed to create a basic user profile by calling Parse API "find" (instance method of
 * Parse.Query object, which is performed on Parse.User object.)
 */
function ParsePhotoClassCreateBaseUserObject(i){
    var query = new Parse.Query(Parse.User);
    query.descending("createdAt");

    // query.find method will return an array of Parse.User objects to be found
    query.find({
        success: function(user) {
            //console.log(i);
            var userId = user[i].id;
            var profilePhoto = user[i].get("photo");
            var profilePhoto120 = user[i].get("photo50");
            //console.log(userId);
            //console.log(profilePhoto);
            //console.log(profilePhoto120);
            var Photo = Parse.Object.extend("Photo");
            var photo = new Photo;

            photo.set("userId",userId);
            photo.set("profilePhoto",profilePhoto);
            photo.set("profilePhoto120",profilePhoto120);
            photo.save(null,{
                success: function() {
                    //console.log('success');
                }
            });
        }
    });
}

/* This function is designed to refresh user profile photo by calling function "ParsePhotoClassCreateBaseUserObject"
 */
function ParseRefreshUserProfilePhoto() {
    ParsePhotoClassCreateBaseUserObject(refreshNumber);
    refreshNumber = refreshNumber + 1;
    if (refreshNumber == 16) {
        return;
    }

    setTimeout(function(){
        ParseRefreshUserProfilePhoto();
    }, 5000);
}

/* This function is designed to clear empty chats by calling Parse API "find" (instance method of
 * Parse.Query object, which is performed on Chat object. Chat is a customer-defined subclass of Parse.Object) and
 * function "ParseCheckChatObject"
 */
function ParseClearChatWithoutMessage() {
    var Chat = Parse.Object.extend("Chat");
    var query = new Parse.Query(Chat);

    // query.find method will return an array of Chat objects to be found
    query.find({
        success: function(objects) {
            ChatObjectSet = objects;
            ParseCheckChatObject();
        }
    });
}

/* This function is designed to check if a chat is empty by calling Parse API "first" (instance method of
 * Parse.Query object, which is performed on Message object. Message is a customer-defined subclass of Parse.Object)
 */
function ParseCheckChatObject() {
    var object = ChatObjectSet[refreshNumber];
    var groupId = object.get("groupId");
    var Message = Parse.Object.extend("Message");
    var query = new Parse.Query(Message);
    query.descending("createdAt");
    query.equalTo("groupId",groupId);

    // query.first method will return a single Message object to be found
    query.first({
        success: function(object){
            if (typeof(object) == "undefined") {
                ChatObjectSet[refreshNumber].set("hidden",true);
                ChatObjectSet[refreshNumber].save({
                    success: function(){
                        //console.log("hidden:" + ChatObjectSet[refreshNumber].id)
                    }
                });
            }
        }
    });

    if (refreshNumber == ChatObjectSet.length - 1) {
        return;
    }

    setTimeout(function(){
        //console.log(ChatObjectSet[refreshNumber].id);
        refreshNumber += 1;
        ParseCheckChatObject();
    },5000)
}

/* This variable...
 */
var NoticeNewVersionObjects;

/* This function is designed to notify users that new versions of our app is available by calling Parse API "find" (instance method of
 * Parse.Query object, which is performed on User object. User is a customer-defined subclass of Parse.Object)
 */
function ParseNoticeNewVersion() {
    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    //query.equalTo("objectId", Parse.User.current().id);

    // query.find method will return an array of User objects to be found
    query.find({
        success: function(objects){
            NoticeNewVersionObjects = objects;
            SendNewVersionNotification(0);
        }
    });
}

/* This function is designed to send notifications to users' devices that new versions of our app is available for update.
 */
function SendNewVersionNotification(i) {
    if (i >= NoticeNewVersionObjects.length) {
        return;
    }

    var object = NoticeNewVersionObjects[i];
    console.log(object.id);
    if (typeof(object.get("GCMId")) != "undefined") {
        pushNotificationToDevice("gcm", object.get("GCMId"), "New version is available.");
        console.log("GCMId:" + object.get("GCMId"));
    }
    if (typeof(object.get("APNId")) != "undefined") {
        pushNotificationToDevice("apn", object.get("APNId"), "New version is available.");
        console.log("APNId:" + object.get("APNId"));
    }
    setTimeout(function(){
        SendNewVersionNotification(i+1)
    }, 1000);
}