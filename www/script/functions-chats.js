// this variable denotes the previous time shown in the message
var previousTimeShown;

/* This function is designed to start a private chat with a friend with id = friendId.
 */
function startPrivateChat(friendId){
    $("#page-chat-messages > .ui-content").html("");
    $("#header-chat-message-title").html("");
    $("#footer-bar-input-message-content").val("");
    
    var memberId = [];
    memberId.push(friendId);
    memberId.push(Parse.User.current().id);
    var successFunction = function(object){ // object: single cacheGroup[i] object
        var groupId = object.id;
        var currentId = Parse.User.current().id;
        $("#footer-bar-group-id-label").html(groupId);
        var successFunction1 = function(object){ // object: single Chat object
            var groupId = object.get("groupId");
            var limitNum = 15;
            var descendingOrderKey = "createdAt";
            var displayFunction = function(objects, data){ // objects: an array of Message objects
                for (var i=objects.length-1; i>=0; i--) {
                    var createdTime = new Date(objects[i].createdAt);
                    if (i == objects.length-1) {
                        previousTimeShown = createdTime.getTime();
                        $("#page-chat-messages > .ui-content").append("<div class='chat-message-time'>"
                                               + convertTimeFormatToHourMinute(createdTime) + "</div>");
                    } else {
                        if (createdTime.getTime() - previousTimeShown >= 180000) {
                            $("#page-chat-messages > .ui-content").append("<div class='chat-message-time'>"
                                                   + convertTimeFormatToHourMinute(createdTime) + "</div>");
                        }
                        previousTimeShown = createdTime.getTime();
                    }

                    var newElement = buildElementInChatMessagesPage(objects[i]);
                    $("#page-chat-messages > .ui-content").append(newElement);

                    var displayFunction1 = function(object, data) { // object: single cachePhoto[i] object
                        var photo120 = object.get("profilePhoto120");
                        if (typeof(photo120) == "undefined") {
                            photo120 = "./content/png/Taylor-Swift.png";
                        }
                        $("#body-message-"+data.messageId).css("backgroundImage", "url("+photo120+")")
                    };
                    CacheGetProfilePhotoByUserId(objects[i].get("senderId"), displayFunction1, {messageId: objects[i].id});
                }
                $.mobile.changePage("#page-chat-messages");
            };
            ParsePullChatMessage(groupId, limitNum, descendingOrderKey, null, displayFunction, null)
        };
        ParseSetChatObjectAsRead(currentId, groupId, null, successFunction1);
    };
    CacheGetGroupIdInPrivateChat(memberId,successFunction);
    updateChatTitle(friendId, "header-chat-message-title");
}

/* This function is designed to start a group chat with id = groupId.
 */
function startGroupChat(groupId){
    // clear the current chat
    $("#page-chat-messages > .ui-content").html("");
    $("#header-chat-message-title").html("");
    $("#footer-bar-input-message-content").val("");

    // build new chat
    var successFunction = function(object){  // object: single cacheGroup[i] object
        var memberId = object.get("memberId");
        var groupName = object.get("groupName");
        if (typeof(groupName) == "undefined") {
            for (var i=0; i<memberId.length; i++) {
                updateChatTitle(memberId[i], "header-chat-message-title");
            }
        } else {
            $("#header-chat-message-title").html(groupName);
        }
        var groupId = object.id;
        var currentId = Parse.User.current().id;
        $("#footer-bar-group-id-label").html(groupId);

        var successFunction1 = function(object){  // object: single Chat object
            var groupId = object.get("groupId");
            var limitNum = 15;
            var descendingOrderKey = "createdAt";
            var displayFunction = function(objects, data){  // objects: an array of Message objects
                for (var i=objects.length-1; i>=0; i--) {
                    var createdTime = new Date(objects[i].createdAt);
                    if (i == objects.length-1) {
                        previousTimeShown = createdTime.getTime();
                        $("#page-chat-messages > .ui-content").append("<div class='chat-message-time'>"
                                               + convertTimeFormatToHourMinute(createdTime) + "</div>");
                    } else {
                        if (createdTime.getTime() - previousTimeShown >= 180000) {
                            $("#page-chat-messages > .ui-content").append("<div class='chat-message-time'>"
                                                   + convertTimeFormatToHourMinute(createdTime) + "</div>");
                        }
                        previousTimeShown = createdTime.getTime();
                    }

                    var newElement = buildElementInChatMessagesPage(objects[i], true);
                    $("#page-chat-messages > .ui-content").append(newElement);

                    var displayFunction1 = function(object, data) {  // object: single cachePhoto[i] object
                        var photo120 = object.get("profilePhoto120");
                        if (typeof(photo120) == "undefined") {
                            photo120 = "./content/png/Taylor-Swift.png";
                        }
                        $("#body-message-"+data.messageId).css("backgroundImage", "url("+photo120+")")
                    };
                    CacheGetProfilePhotoByUserId(objects[i].get("senderId"), displayFunction1, {messageId: objects[i].id});
                }
                $.mobile.changePage("#page-chat-messages");
            };
            //CachePullChatMessage(groupId, limitNum, null, displayFunction);
            ParsePullChatMessage(groupId, limitNum, descendingOrderKey, null, displayFunction, null)
        };
        ParseSetChatObjectAsRead(currentId, groupId, null, successFunction1);
    };
    CacheGetGroupMember(groupId,successFunction);
    // CacheGetGroupIdInPrivateChat(newGroupChatMemberArray.memberId,successFunction);
}

/* This variable will be initialized with the total number of users in a group chat
 * and decrement as the chat object for each user is built. When its value reaches 0,
 * the group chat will be started.
 */
var chatsInitializationNumber = 0;

/* This function is designed to create a group chat.
 * Modified by Yaliang at 4/11/2015
 * Modified by Renpeng @ 19:32 4/18/2015
 */
function createGroupChat() {
    var successFunction = function(object){  // object: single cacheGroup[i] object
        var groupId = object.id;
        var memberId = object.get("memberId");
        chatsInitializationNumber = memberId.length;

        var successFunction1 = function(object) {  // object: single Chat object
            var groupId = object.get("groupId");
            chatsInitializationNumber--;
            if (chatsInitializationNumber == 0) {
                startGroupChat(groupId);
            }
        };

        for (var i=0; i<memberId.length; i++) {
            ParseInitializeChatObjectInGroup({
                groupId:groupId, 
                ownerId:memberId[i],
                successFunction:successFunction1
            });
        }
    };

    if (newGroupChatMemberArray.prevNum == 0) {
        if (newGroupChatMemberArray.newNum == 1) {
            startPrivateChat(newGroupChatMemberArray.newMemberList[0]);
        } else {
            newGroupChatMemberArray.newMemberList.push(Parse.User.current().id);
            newGroupChatMemberArray.newNum++;
            ParseCreateNewGroup(newGroupChatMemberArray.newMemberList, successFunction);
        }
    } else {
        if (newGroupChatMemberArray.isGroupChat) {
            // when it was a group chat and add new participant(s)
            // only change the current group
            ParseAddGroupMember({
                groupId:newGroupChatMemberArray.groupId,
                newMemberList:newGroupChatMemberArray.newMemberList,
                successFunction:successFunction
            });
        } else {
            // when it was a private chat and add new participant(s)
            // create a new group
            ParseCreateNewGroup($.merge(newGroupChatMemberArray.memberId, newGroupChatMemberArray.newMemberList), successFunction);
        }
    }
}

/* This function is designed to build up elements for the list of chats so they can be displayed on the Chats page.
 */
function buildElementInChatListPage(object){
    var chatId = object.id;
    var groupId = object.get("groupId");
    var unreadNum = object.get("unreadNum");
    var newElement = "";
    newElement += "<div id='body-chat-"+chatId+"' class='chat-list'>";
    if (unreadNum > 0) {
        var unreadNumLen = unreadNum.toString().length;
        var unreadNumWidth = Math.max(9*unreadNumLen-1, 11);
        var marginRight = "-"+(unreadNumWidth+8).toString()+"px";
        var right = (unreadNumWidth+9).toString()+"px";
        newElement += "<span class='ui-li-message-count' style='margin-right:"+marginRight+"; right:"+right+"'>"+unreadNum+"</span>";
    }
    newElement += "<div class='chat-list-title'></div>";
    newElement += "<div class='chat-last-time'></div>";
    newElement += "<div class='chat-last-message'></div>";
    
    newElement += "</div>";

    return newElement;
}

/* This function is designed to pull up my chats.
 */
function pullMyChat(){
    if (!pullNotificationRunning) {
        pullNotification();
    }
    var ownerId = Parse.User.current().id;
    var displayFunction = function(objects){ // objects: an array of Chat objects from cacheChat
        for (var i=objects.length-1; i>=0; i--) {
            if ($("#body-chat-"+objects[i].id).length == 0) {
                var newElement = buildElementInChatListPage(objects[i]);
                $("#page-chat > .ui-content").prepend(newElement);
                // $(".ui-li-message-count").each(function(){
                //     $(this).css("marginRight","-"+($(this).width()+8).toString()+"px");
                //     $(this).css("right",($(this).width()+18).toString()+"px");
                // })
                var chatId = objects[i].id;
                var data = {chatId: chatId};
                var groupId = objects[i].get("groupId");

                var successFunction = function(object, data){ // object: single cacheGroup[i] object
                    var memberId = object.get("memberId");
                    var groupId = object.id;
                    var groupName = object.get("groupName");
                    if (object.get("isGroupChat")) {
                        // this is a group chat
                        if (typeof(groupName) == "undefined") {
                            for (j=0; j<memberId.length; j++) {
                                updateChatTitle(memberId[j], "body-chat-"+data.chatId+"> .chat-list-title");
                            }
                        } else {
                            $("#body-chat-"+data.chatId+"> .chat-list-title").html(groupName);
                        }
                        $("#body-chat-"+data.chatId).css("backgroundImage", "url(./content/png/Taylor_Swift_-_Red.png)").unbind("click").on("click",function(){
                            $("#body-chat-"+data.chatId+"> .ui-li-message-count").remove();
                            startGroupChat(groupId);
                        });

                    } else {
                        // this is a private chat
                        for (var j=0; j<memberId.length; j++) {
                            if (memberId[j] != Parse.User.current().id) {
                                updateChatTitle(memberId[j], "body-chat-"+data.chatId+"> .chat-list-title", 2);
                                data["friendId"] = memberId[j];
                                var displayFunction = function(object, data) {  // object: single cachePhoto[i] object
                                    var photo120 = object.get("profilePhoto120");
                                    if (typeof(photo120) == "undefined") {
                                        photo120 = "./content/png/Taylor-Swift.png";
                                    }
                                    $("#body-chat-"+data.chatId).css("backgroundImage", "url("+photo120+")");
                                };
                                CacheGetProfilePhotoByUserId(data.friendId, displayFunction, data);

                                $("#body-chat-"+data.chatId).unbind("click").on("click",function(){
                                    $("#body-chat-"+data.chatId+"> .ui-li-message-count").remove();
                                    startPrivateChat(data.friendId);
                                });
                            }
                        }
                    }

                    // bind hiding chat event
                    $("#body-chat-"+data.chatId).on("taphold",function() {
                        $("#body-bottom-hiding-chat-confirm").unbind("click").on("click", function (){
                            removeChat(data.chatId);
                        });
                        $("#body-bottom-hiding-chat-cancel").unbind("click").on("click", function (){
                            hideHidingChatMoreOption(data.chatId);
                        });
                        displayHidingChatMoreOption(data.chatId);
                    });
                };
                CacheGetGroupMember(groupId, successFunction, data);
                updateLastMessage(groupId, data);

            } else {
                chatId = objects[i].id;
                groupId = objects[i].get("groupId");
                data = {chatId: chatId};

                // move the element to top of the list
                var element = $("#body-chat-"+data.chatId);
                $("#page-chat > .ui-content").prepend(element);

                // update group name
                successFunction = function(object, data){ // object: single cacheGroup[i] object
                    var memberId = object.get("memberId");
                    var groupId = object.id;
                    var groupName = object.get("groupName");
                    if ((memberId.length > 2)&&(typeof(groupName) == "undefined")) {
                        $("#body-chat-"+data.chatId+"> .chat-list-title").html("");
                        for (j=0; j<memberId.length; j++) {
                            updateChatTitle(memberId[j], "body-chat-"+data.chatId+"> .chat-list-title");
                        }
                    }
                };
                CacheGetGroupMember(groupId, successFunction, data);

                // update unread number icon and last message
                var $bodyChatUnreadMessageCount = $("#body-chat-"+data.chatId+"> .ui-li-message-count");
                var unreadNum = objects[i].get("unreadNum");
                if (unreadNum > 0) {
                    var unreadNumLen = unreadNum.toString().length;
                    var unreadNumWidth = Math.max(9*unreadNumLen-1, 11);
                    var marginRight = "-"+(unreadNumWidth+8).toString()+"px";
                    var right = (unreadNumWidth+9).toString()+"px";
                    var newUnreadMessageIcon = "<span class='ui-li-message-count' style='margin-right:"+marginRight+"; right:"+right+"'>"+unreadNum+"</span>";
                    if ($bodyChatUnreadMessageCount.length > 0) {
                        $bodyChatUnreadMessageCount.before(newUnreadMessageIcon);
                        // $(".ui-li-message-count").each(function(){
                        //     $(this).css("marginRight","-"+($(this).width()+8).toString()+"px");
                        //     $(this).css("right",($(this).width()+18).toString()+"px");
                        // })
                        $bodyChatUnreadMessageCount.remove();
                    } else {
                        element.prepend(newUnreadMessageIcon);
                    }
                } else {
                    if ($bodyChatUnreadMessageCount.length > 0) {
                        $bodyChatUnreadMessageCount.remove();
                        //$("#body-chat-"+data.chatId+"> .chat-last-time").removeClass("chat-last-time-right-blank");
                    }
                }
                updateLastMessage(groupId, data);
            }
        }
    };
    CachePullMyChat(ownerId,displayFunction);
}

/* This function is designed to update the last chatting message for each chat.
 */
function updateLastMessage(groupId, data){
    var isGroup = false;
    var displayFunction = function(object){  // single cacheGroup[i] object
        isGroup = object.get("isGroupChat");
        if (($("#body-chat-"+data.chatId+"> .ui-li-message-count").length == 0) && (typeof(data.parse) == "undefined")) {
            displayFunction = function(object, data){  // object: single cacheMessage[i] object
                if (object != null) {
                    $("#body-chat-"+data.chatId+"> .chat-last-time").html(convertTimeFormat(object.get("createdAt")));
                    if (isGroup && (Parse.User.current().id != object.get("senderId"))) {
                        var displayFunction1 = function(object, data) {  // object: single cacheUser[i] object
                            var text = "";
                            text += object.get("name") + ": ";
                            text += data.message_object.get("text");
                            $("#body-chat-"+data.chatId+"> .chat-last-message").html(text);
                        };
                        data["message_object"] = object;
                        CacheGetProfileByUserId(object.get("senderId"), displayFunction1, data);
                    } else {
                        var text = "";
                        text += object.get("text");
                        $("#body-chat-"+data.chatId+"> .chat-last-message").html(text);
                    }
                } else {
                    data.parse = true;
                    updateLastMessage(groupId, data);
                }
            };
            CacheGetLatestMessage(groupId, displayFunction, data);
        } else {
            var limitNum = 1;
            var descendingOrderKey = "createdAt";
            displayFunction = function(objects, data){  // objects: an array of Message objects
                if (objects.length > 0) {
                    $("#body-chat-"+data.chatId+"> .chat-last-time").html(convertTimeFormat(objects[0].createdAt));
                    if (isGroup && (Parse.User.current().id != objects[0].get("senderId"))) {
                        var displayFunction1 = function(object) {  // object: single cacheUser[i] object
                            var text = "";
                            text += object.get("name") + ": ";
                            text += data.message_object.get("text");
                            $("#body-chat-"+data.chatId+"> .chat-last-message").html(text);
                        };
                        data["message_object"] = objects[0];
                        CacheGetProfileByUserId(objects[0].get("senderId"), displayFunction1);
                    } else {
                        var text = "";
                        text += objects[0].get("text");
                        $("#body-chat-"+data.chatId+"> .chat-last-message").html(text);
                    }
                } else {
                    $("#body-chat-"+data.chatId+"> .chat-last-time").html(convertTimeFormat(object.createdAt));
                }
            };
            ParsePullChatMessage(groupId, limitNum, descendingOrderKey, null, displayFunction, data);
        }
    };
    CacheGetGroupMember(groupId, displayFunction);
}

/* This function is designed to build elements for chatting messages.
 * chatType can be true or false: true -- group chat; false -- private chat
 */
function buildElementInChatMessagesPage(object, chatType){
    var messageId = object.id;
    var senderId = object.get("senderId");
    var currentId = Parse.User.current().id;
    var text = object.get("text");
    var elementClass;

    var newElement = "";
    if (currentId == senderId) {
        elementClass = "ui-custom-message-right";
    } else {
        elementClass = "ui-custom-message-left";
    }
    newElement += "<div id='body-message-"+messageId+"' class='"+elementClass+"'>";

    if (chatType && currentId != senderId) {
        var displayFunction = function(object) {  // object: single cacheUser[i] object
            var userName = object.get("name");
            newElement += "<div class='body-message-username-in-group-chat'>"+userName+"</div>";
        };

        CacheGetProfileByUserId(senderId, displayFunction);
    }

    newElement += "<p>"+text+"</p>";
    newElement += "</div>";

    return newElement;
}

/* This function is designed to send message to other users.
 */
function sendMessage(){
    var groupId = $("#footer-bar-group-id-label").html();
    var senderId = Parse.User.current().id;

    var $footerBarInputMessageContent = $("#footer-bar-input-message-content");

    var text = $footerBarInputMessageContent.val();
    if (text == "") {
        return;
    }

    $footerBarInputMessageContent.val("");

    var displayFunction = function(object){  // object: single Message object
        var messageId = object.id;
        var senderId = object.get("senderId");
        var groupId = object.get("groupId");
        var text = object.get("text");
        var notificationFunction = function(senderId,text,receiverId){
            var displayFunction1 = function(object,data){
                if (typeof(object.get("GCMId")) != "undefined") {
                    data.GCMId = object.get("GCMId");
                }
                if (typeof(object.get("APNId")) != "undefined") {
                    data.APNId = object.get("APNId");
                }
                var displayFunction2 = function(object,data){
                    var message = object.get("name")+": " + data.message;
                    if ("GCMId" in data)
                        pushNotificationToDevice("gcm",data.GCMId,message);
                    if ("APNId" in data)
                        pushNotificationToDevice("apn",data.APNId,message);
                };
                CacheGetProfileByUserId(data.senderId, displayFunction2, data);
            };
            var data = {senderId : senderId, message: text};
            CacheGetProfileByUserId(receiverId, displayFunction1, data);
        };
        CacheSetGroupMemberChatObjectReadFalse(senderId, groupId, text, notificationFunction);

        var chatType = false;
        var displayFunction1 = function(object, data){  // single cacheGroup[i] object
            var createdTime = new Date(data.message_object.createdAt);
            if (createdTime.getTime() - previousTimeShown >= 180000) {
                $("#page-chat-messages > .ui-content").append("<div class='chat-message-time'>"
                                       + convertTimeFormatToHourMinute(createdTime) + "</div>");
            }
            previousTimeShown = createdTime.getTime();

            chatType = object.get("isGroupChat");
            var newElement = buildElementInChatMessagesPage(data.message_object, chatType);
            $("#page-chat-messages > .ui-content").append(newElement);
            var displayFunction3 = function(object, data){
                var photo120 = object.get("profilePhoto120");
                if (typeof(photo120) == "undefined") {
                    photo120 = "./content/png/Taylor-Swift.png";
                }
                $("#body-message-"+data.messageId).css("backgroundImage","url('"+photo120+"')");
            };
            CacheGetProfilePhotoByUserId(data.message_object.get("senderId"), displayFunction3, {messageId : data.message_object.id});
        };
        CacheGetGroupMember(object.get("groupId"), displayFunction1,{message_object:object});
        
        $("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
            duration: 750,
            complete : function(){}
        });

        var $footerBarSendMessage = $("#footer-bar-send-message");
        if ($footerBarSendMessage.css("position") == "absolute") {
            $footerBarSendMessage.css("bottom", ($("body").height()-$("#page-chat-messages").height()-44).toString()+"px");
        }
    };

    ParseAddChatMessage(senderId, groupId, text, displayFunction);
}

/* This function is designed to update chatting message titles.
 */
function updateChatTitle(friendId, elementId, option){
    if (friendId == Parse.User.current().id) 
        return;
    var displayFunction= function(ownerId, friendId, object) { // object: single cacheFriend[i] object
        if (typeof(object) != "undefined") {
            // user with friendId is a friend of current user
            var alias = object.get("alias");
            var $elementId = $("#"+elementId);
            if (typeof(alias) == "undefined") {
                var displayFunction1 = function(user){  // user: single cacheUser[i] object
                    var title = "";
                    if ((option)&&(option == 2)) {
                        title = user.get("name");
                    } else {
                        title = $elementId.html();
                        if (title.length > 0) {
                            title += ", "+user.get("name");
                        } else {
                            title += user.get("name");
                        }
                    }
                    $elementId.html(title);
                };
                CacheGetProfileByUserId(friendId, displayFunction1)
            } else {
                var title = "";
                if ((option)&&(option == 2)) {
                   title = alias;
                } else {
                    title = $elementId.html();
                    if (title.length > 0) {
                        title += ", "+alias;
                    } else {
                        title += alias;
                    }
                }
                $elementId.html(title);
            }
        } else {
            // user with friendId is not a friend of current user
            $elementId = $("#"+elementId);
            displayFunction1 = function(user){  // user: single cacheUser[i] object
                var title = "";
                if ((option)&&(option == 2)) {
                    title = user.get("name");
                } else {
                    title = $elementId.html();
                    if (title.length > 0) {
                        title += ", "+user.get("name");
                    } else {
                        title += user.get("name");
                    }
                }
                $elementId.html(title);
            };
            CacheGetProfileByUserId(friendId, displayFunction1);
        }
    };
    // get the Friend object, in order to get alias of friend.
    CacheCheckFriend(friendId, Parse.User.current().id, displayFunction);
}

/* This function is designed to update chatting messages.
 */
function updateChatMessage(object){
    var groupId = object.get("groupId");
    var beforeAt = object.updatedAt;
    var limitNum = object.get("unreadNum");
    var descendingOrderKey = "createdAt";

    var displayFunction = function(objects, data) {  // objects: an array of Message objects
        for (var i=objects.length-1; i>=0; i--) {
            if ($("#body-message-"+objects[i].id).length == 0) {
                var displayFunction1 = function(object, data){  // single cacheGroup[i] object
                    var currentId = Parse.User.current().id;
                    var isGroup = object.get("isGroupChat");
                    var newElement = buildElementInChatMessagesPage(objects[i], isGroup);
                    $("#page-chat-messages > .ui-content").append(newElement);
                    var displayFunction2 = function(object, data) { // object: single cachePhoto[i] object
                        var photo120 = object.get("profilePhoto120");
                        if (typeof(photo120) == "undefined") {
                            photo120 = "./content/png/Taylor-Swift.png";
                        }
                        $("#body-message-"+data.messageId).css("backgroundImage", "url("+photo120+")")
                    };
                    CacheGetProfilePhotoByUserId(objects[i].get("senderId"), displayFunction2, {messageId: objects[i].id});
                    var groupId = data.message_object.get("groupId");
                    ParseSetChatObjectAsRead(currentId, groupId, 1, function(){});
                };
                data['message_object'] = objects[i];
                CacheGetGroupMember(objects[i].get("groupId"), displayFunction1, data);
            }
        }
        $("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
            duration: 750,
            complete : function(){
            }
        });

        var $footerBarSendMessage = $("#footer-bar-send-message");
        if ($footerBarSendMessage.css("position") == "absolute") {
            $footerBarSendMessage.css("bottom", ($("body").height()-$("#page-chat-messages").height()-44).toString()+"px");
        }
    };
    ParsePullChatMessage(groupId, limitNum, descendingOrderKey, beforeAt, displayFunction, {});
}

/* This function is designed to show hidden options for chatting messages.
 */
function displayChatMessageMoreOption(){
    $("#header-chat-message-more-option").removeClass("ui-header-more-option").addClass("ui-header-more-option-active");
    var groupId = $("#footer-bar-group-id-label").html();

    var displayFunction = function(object, data) {  // object: single cacheGroup[i] object
        var memberId = object.get("memberId");
        if (object.get("isGroupChat")) {
            // this is a group chat
            var $bodyBottomGroupChatMessageMoreOption = $("#body-bottom-group-chat-message-more-option");
            $bodyBottomGroupChatMessageMoreOption.css("position","fixed")
            .css("bottom",(-$bodyBottomGroupChatMessageMoreOption.height()).toString()+"px").show().animate({
                bottom: "0px"
            },300);
        } else {
            // this is a private chat
            var $bodyBottomPrivateChatMessageMoreOption = $("#body-bottom-private-chat-message-more-option");
            $bodyBottomPrivateChatMessageMoreOption.css("position","fixed")
            .css("bottom",(-$bodyBottomPrivateChatMessageMoreOption.height()).toString()+"px").show().animate({
                bottom: "0px"
            },300);
        }
        $("body").append("<div class='ui-gray-cover' style='position:fixed; width:100%; height:100%; opacity:0; background-color:#000; z-index:1001' onclick='hideChatMessageMoreOption()'><div>");
        $(".ui-gray-cover").animate({
            opacity: 0.3
        },300);
    };
    CacheGetGroupMember(groupId, displayFunction, {});
}

/* This function is designed to hide unnecessary options for chatting messages.
 */
function hideChatMessageMoreOption(){
    $("#header-chat-message-more-option").addClass("ui-header-more-option").removeClass("ui-header-more-option-active");
    var groupId = $("#footer-bar-group-id-label").html();

    var displayFunction = function(object, data) {  // object: single cacheGroup[i] object
        var memberId = object.get("memberId");
        if (object.get("isGroupChat")) {
            // this is a group chat
            var $bodyBottomGroupChatMessageMoreOption = $("#body-bottom-group-chat-message-more-option");
            $bodyBottomGroupChatMessageMoreOption.animate({
                bottom: (-$bodyBottomGroupChatMessageMoreOption.height()).toString()+"px"
            },300,function(){
                $("#body-bottom-group-chat-message-more-option").hide();
            });
        } else {
            // this is a private chat
            var $bodyBottomPrivateChatMessageMoreOption = $("#body-bottom-private-chat-message-more-option");
            $bodyBottomPrivateChatMessageMoreOption.animate({
                bottom: (-$bodyBottomPrivateChatMessageMoreOption.height()).toString()+"px"
            },300,function(){
                $("#body-bottom-private-chat-message-more-option").hide();
            });
        }
        
        $(".ui-gray-cover").animate({
            opacity: 0
        },300, function(){
            $(".ui-gray-cover").remove();
        });
    };
    
    CacheGetGroupMember(groupId, displayFunction, {});
}

/* This function is designed to show hidden options for deleting chat message in the chatting list.
 */
function displayHidingChatMoreOption(chatId){
    $("#body-chat-" + chatId).addClass("chat-message-selected").removeClass("chat-message-deselected");

    var $bodyBottomHidingChatMoreOption = $("#body-bottom-hiding-chat-more-option");
    $bodyBottomHidingChatMoreOption.css("position","fixed").css("bottom",(-$bodyBottomHidingChatMoreOption.height()).toString()+"px").show();

    $("body").append("<div class='ui-gray-cover' style='position:fixed; width:100%; height:100%; opacity:0; background-color:#000; z-index:4'><div>");
    $(".ui-gray-cover").on("click", function(){
        hideHidingChatMoreOption(chatId);
    }).animate({
        opacity: 0.0
    },200);

    $bodyBottomHidingChatMoreOption.animate({
        bottom: "0px"
    },200);
}

/* This function is designed to hide unnecessary options for deleting chat message in the chatting list.
 */
function hideHidingChatMoreOption(chatId){
    //console.log("deselected");
    var $bodyBottomHidingChatMoreOption = $("#body-bottom-hiding-chat-more-option");
    $bodyBottomHidingChatMoreOption.animate({
        bottom: (-$bodyBottomHidingChatMoreOption.height()).toString()+"px"
    },300,function(){
        $bodyBottomHidingChatMoreOption.hide();
    });

    $(".ui-gray-cover").animate({
        opacity: 0
    },300, function(){
        $(".ui-gray-cover").remove();
    });

    $("#body-chat-" + chatId).addClass("chat-message-deselected").removeClass("chat-message-selected");
}

/* This function is designed to add new users to a group chat.
 * Modified by Renpeng @ 19:33 4/18/2015
 * Modified by Yaliang 11:27 4/18/2015
 */
function selectANewParticipant(event) {
    var id = event.data.id;
    newGroupChatMemberArray.newMemberList.push(id);
    newGroupChatMemberArray.newNum++;
    $("#header-add-participant-for-group-chat").html("OK("+newGroupChatMemberArray.newNum+")").unbind("click").click(createGroupChat);
    $("#body-add-participants-list-"+id).children(".ui-add-participant-unchecked").removeClass("ui-add-participant-unchecked").addClass("ui-add-participant-checked");
    $("#body-add-participants-list-"+id).unbind("click").click({id: id},removeANewParticipant);
}

/* This function is designed to remove selected users from a group chat.
 * Modified by Yaliang 11:27 4/18/2015
 */
function removeANewParticipant(event) {
    var id = event.data.id;
    newGroupChatMemberArray.newMemberList = jQuery.grep(newGroupChatMemberArray, function(value) {
      return value != id;
    });
    newGroupChatMemberArray.newNum--;
    if (newGroupChatMemberArray.newNum > 0) {
        $("#header-add-participant-for-group-chat").html("OK("+newGroupChatMemberArray.newNum+")").unbind("click").click(createGroupChat);
    } else {
        $("#header-add-participant-for-group-chat").html("OK").unbind("click");
    }
    $("#body-add-participants-list-"+id).children(".ui-add-participant-checked").removeClass("ui-add-participant-checked").addClass("ui-add-participant-unchecked")
    $("#body-add-participants-list-"+id).unbind("click").click({id: id},selectANewParticipant);
}

/* This function is designed to pull up the profile for a group.
 */
function pullGroupProfile(){
    var groupId = $("#footer-bar-group-id-label").html();
    $("#body-group-participants-list-toggle").html("Collapse List");
    $("#body-group-participants-list").show();
    pullParticipantsListInGroup();

    var displayFunction = function(object) {  // object: single cacheGroup[i] object
        var groupName = object.get("groupName");
        if (typeof(groupName) == "undefined") {
            groupName = "Not Set";
            $("#body-input-set-group-name").val("");
        } else {
            $("#body-input-set-group-name").val(groupName);
        }
        $("#body-group-name").html("<font style='padding-right:1em; color:#333'>Group Name:</font><font style='color:#AAA'>"+groupName+"</font>");
    };
    CacheGetGroupMember(groupId,displayFunction);
}

/* This function is designed to toggle user list in a group chat.
 */
function groupParticipantsListToggle(){
    var $bodyGroupParticipantsListToggle = $("#body-group-participants-list-toggle");
    var htmlString = $bodyGroupParticipantsListToggle.html();
    if (htmlString.localeCompare("Collapse List") == 0) {
        $bodyGroupParticipantsListToggle.html("Expand List");
        $("#body-group-participants-list").slideUp();
    } else {
        $bodyGroupParticipantsListToggle.html("Collapse List");
        $("#body-group-participants-list").slideDown();
    }
}

/* This function is designed to save the name of a group chat.
 */
function saveGroupName(){
    var groupName = $("#body-input-set-group-name").val();
    if (groupName.length == 0) {
        $.mobile.back();
        return
    }
    var groupId = $("#footer-bar-group-id-label").html();

    var displayFunction = function(object) {  // object: single Group object
        var groupId = object.id;
        var groupName = object.get("groupName");
        $("#body-input-set-group-name").val(groupName);
        $("#body-group-name").html("<font style='padding-right:1em'>Group Name:</font><font style='color:#AAA'>"+groupName+"</font>");
        $("#header-chat-message-title").html(groupName);
        var displayFunction = function(object, data){
            $("#body-chat-"+object.id+" > .chat-list-title").html(data.groupName);
        };
        CacheGetChatByGroupId(Parse.User.current().id, groupId, displayFunction, {groupName: groupName})
    };
    ParseSetGroupName(groupId, groupName, displayFunction);

    $.mobile.back();
}

/* This function is designed to hide the selected chat in the chatting list of page-chat.
 * Note: This function only prevents the selected chat from showing in the chatting list.
 * It does not destroy the corresponding chat object on the Parse server, instead it sets
 * the hidden attribute of the chat object to be true.
 */
function removeChat(chatObjectId) {
    var displayFunction = function(object) {  // object: single Chat object
        $("#body-chat-"+object.id).remove();
        hideHidingChatMoreOption(object.id);
    };

    ParseHideChat(chatObjectId, null, null, displayFunction);
}

/* This function is designed to delete chat object and remove member from a group chat.
 *
 */ 
function leaveGroup() {
    var groupId = $("#footer-bar-group-id-label").html();
    var removeMemberId = Parse.User.current().id;
    var successFunction =  function(object){ // object: single Chat object
        var chatId = object.id;
        var memberId = object.get("ownerId");
        var groupId = object.get("groupId");
        var successFunction1 = function(object, data){ // object: single Group object
            var chatId = data.chatId;
            $("#body-chat-"+chatId).remove();
        }
        ParseRemoveGroupMember({
            groupId : groupId,
            removeMemberList : [memberId],
            successFunction : successFunction1,
            data: {chatId: chatId}
        });
    }
    ParseDeleteChat(null, removeMemberId, groupId, successFunction);
}

/* This function is designed to display hidden options for the Chat page
 * Created by Renpeng @ 17:48 4/18/2015
 * Modified by Yaliang @ 23:45 4/18/2015
 * Modified by Yaliang @11:45 4/22/2015
 */
function displayChatMoreOption(){
    var $headerStartGroupChatOption = $("#header-start-group-chat-option");
    $headerStartGroupChatOption.unbind("click");

    $("#header-chat-more-option").removeClass("ui-header-more-option").addClass("ui-header-more-option-active");
    $(window).unbind("scroll");

    $headerStartGroupChatOption.on("click",function(){
        pullFriendListForSelectingParticipantsInNewGroup();
        hiddenChatMoreOption();
    });

    var $optionHiddenCoverLayer = $(".options-hidden-cover-layer");
    $optionHiddenCoverLayer.show();
    $(".page-right-top-options").fadeIn("fast");
    $optionHiddenCoverLayer.on("click",hiddenChatMoreOption).on("swipeleft",hiddenChatMoreOption).on("swiperight",hiddenChatMoreOption);
    $(window).scroll(hiddenChatMoreOption);
}

/* This function is designed to hide unnecessary options for the Chat page
 * Modified by Renpeng @ 17:57 4/18/2015
 */
function hiddenChatMoreOption(){
    $("#header-start-group-chat-option").unbind("click");
    $("#header-chat-more-option").removeClass("ui-header-more-option-active").addClass("ui-header-more-option");
    $(window).unbind("scroll");
    $(".options-hidden-cover-layer").hide();
    $(".page-right-top-options").fadeOut("fast");
}