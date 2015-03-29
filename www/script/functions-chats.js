// general functions
function startPrivateChat(friendId){
    $("#page-chat-messages > .ui-content").html("");
    $("#header-chat-message-title").html("");
    $("#footer-bar-input-message-content").val("");    
    
    var memberId = [];
    memberId.push(friendId);
    memberId.push(Parse.User.current().id);
    var successFunction = function(object){
        var groupId = object.id;
        var currentId = Parse.User.current().id;
        $("#footer-bar-group-id-label").html(groupId);
        var successFunction = function(object){
            var groupId = object.get("groupId");
            var limitNum = 15;
            var descendingOrderKey = "createdAt";
            var displayFunction = function(objects, data){
                for (var i=objects.length-1; i>=0; i--) {
                    var newElement = buildElementInChatMessagesPage(objects[i]);
                    $("#page-chat-messages > .ui-content").append(newElement);
                    var displayFunction = function(object, data) {
                        var photo120 = object.get("profilePhoto120");
                        if (typeof(photo120) == "undefined") {
                            photo120 = "./content/png/Taylor-Swift.png";
                        }
                        $("#body-message-"+data.messageId).css("backgroundImage", "url("+photo120+")")
                    };
                    CacheGetProfilePhotoByUserId(objects[i].get("senderId"), displayFunction, {messageId: objects[i].id});
                }
                $.mobile.changePage( "#page-chat-messages");
            };
            //CachePullChatMessage(groupId, limitNum, null, displayFunction);
            ParsePullChatMessage(groupId, limitNum, descendingOrderKey, null, displayFunction, null)
        };
        ParseSetChatObjectAsRead(currentId, groupId, null, successFunction);
    };
    CacheGetGroupId(memberId,successFunction);
    //updateCashedPhoto120(friendId);
    updateChatTitle(friendId, "header-chat-message-title");
}

function startGroupChat(groupId){
    // clear the current chat 
    $("#page-chat-messages > .ui-content").html("");
    $("#header-chat-message-title").html("");
    $("#footer-bar-input-message-content").val("");

    // build new chat
    var successFunction = function(object){
        var memberId = object.get("memberId");
        for (var i=0; i<memberId.length; i++) {
            updateChatTitle(memberId[i], "header-chat-message-title");
        }
        var groupId = object.id;
        var currentId = Parse.User.current().id;
        $("#footer-bar-group-id-label").html(groupId);
        var successFunction = function(object){
            var groupId = object.get("groupId");
            var limitNum = 15;
            var descendingOrderKey = "createdAt";
            var displayFunction = function(objects, data){
                for (var i=objects.length-1; i>=0; i--) {
                    var newElement = buildElementInChatMessagesPage(objects[i]);
                    $("#page-chat-messages > .ui-content").append(newElement);
                    var displayFunction = function(object, data) {
                        var photo120 = object.get("profilePhoto120");
                        if (typeof(photo120) == "undefined") {
                            photo120 = "./content/png/Taylor-Swift.png";
                        }
                        $("#body-message-"+data.messageId).css("backgroundImage", "url("+photo120+")")
                    };
                    CacheGetProfilePhotoByUserId(objects[i].get("senderId"), displayFunction, {messageId: objects[i].id});
                }
                $.mobile.changePage( "#page-chat-messages");
                
            };
            //CachePullChatMessage(groupId, limitNum, null, displayFunction);
            ParsePullChatMessage(groupId, limitNum, descendingOrderKey, null, displayFunction, null)
        };
        ParseSetChatObjectAsRead(currentId, groupId, null, successFunction);
    };
    CacheGetGroupMember(groupId,successFunction);
    // CacheGetGroupId(newGroupChatMemberArray.memberId,successFunction);
}

var chatsInitializationNumber = 0;
function createGroupChat() {
    var successFunction = function(object){
        var groupId = object.id;
        var memberId = object.get("memberId");
        chatsInitializationNumber = memberId.length
        var successFunction = function(object) {
            var groupId = object.get("groupId");
            chatsInitializationNumber--;
            if (chatsInitializationNumber == 0) {
                startGroupChat(groupId);
            }
        }
        for (var i=0; i<memberId.length; i++) {
            ParseInitializeChatObjectInGroup({
                groupId:groupId, 
                ownerId:memberId[i],
                successFunction:successFunction
            });
        }
    }
    CacheGetGroupId(newGroupChatMemberArray.memberId,successFunction);
}

// #page-chat functions
function buildElementInChatListPage(object){
    var chatId = object.id;
    var groupId = object.get("groupId");
    var unreadNum = object.get("unreadNum");
    var newElement = "";
    newElement += "<div id='body-chat-"+chatId+"' class='chat-list'>";
    newElement += "<div class='chat-list-title'></div>";
    newElement += "<div class='chat-last-time'></div>";
    newElement += "<div class='chat-last-message'></div>";
    if (unreadNum > 0) {
        newElement += "<span class='ui-li-count'>"+unreadNum+"</span>";
    }
    newElement += "</div>";

    return newElement;
}

function pullMyChat(){
    if (!pullNotificationRunning) {
        pullNotification();
    }
    var ownerId = Parse.User.current().id;
    var displayFunction = function(objects){
        for (var i=objects.length-1; i>=0; i--) {
            if ($("#body-chat-"+objects[i].id).length == 0) {
                var newElement = buildElementInChatListPage(objects[i]);
                $("#page-chat > .ui-content").prepend(newElement);
                var chatId = objects[i].id;
                var data = {chatId: chatId};
                var groupId = objects[i].get("groupId");
                var successFunction = function(object, data){
                    var memberId = object.get("memberId");
                    var groupId = object.id;
                    if (memberId.length == 2) {
                        // this is a private chat
                        for (var i=0; i<memberId.length; i++) {
                            if (memberId[i] != Parse.User.current().id) {
                                updateChatTitle(memberId[i], "body-chat-"+data.chatId+"> .chat-list-title", 2);
                                data["friendId"] = memberId[i];
                                var displayFunction = function(object, data) {
                                    var photo120 = object.get("profilePhoto120");
                                    if (typeof(photo120) == "undefined") {
                                        photo120 = "./content/png/Taylor-Swift.png";
                                    }
                                    $("#body-chat-"+data.chatId).css("backgroundImage", "url("+photo120+")")
                                };
                                CacheGetProfilePhotoByUserId(data.friendId, displayFunction, data);
                                $("#body-chat-"+data.chatId).unbind("click");
                                $("#body-chat-"+data.chatId).on("click",function(){
                                    startPrivateChat(data.friendId);
                                });
                            }
                        }
                    } else {
                        // this is a group chat
                        for (var i=0; i<memberId.length; i++) {
                            updateChatTitle(memberId[i], "body-chat-"+data.chatId+"> .chat-list-title");
                        }
                        $("#body-chat-"+data.chatId).css("backgroundImage", "url(./content/png/groupchat.png)")
                        $("#body-chat-"+data.chatId).unbind("click");
                        $("#body-chat-"+data.chatId).on("click",function(){
                            startGroupChat(groupId);
                        });
                    }
                };
                CacheGetGroupMember(groupId, successFunction, data);
                updateLastMessage(groupId, data);
            } else {
                var chatId = objects[i].id;                
                var groupId = objects[i].get("groupId");
                var data = {chatId: chatId};
                var unreadNum = objects[i].get("unreadNum");
                // move the element to top of the list
                var element = $("#body-chat-"+data.chatId);
                $("#page-chat > .ui-content").prepend(element);
                // update unread number label
                var unreadNum_Current;
                if ($("#body-chat-"+data.chatId+"> .ui-li-count").length > 0) {
                    unreadNum_Current = parseInt($("#body-chat-"+data.chatId+"> .ui-li-count").html());
                } else {
                    unreadNum_Current = 0;
                }
                if ((unreadNum != unreadNum_Current) && (unreadNum > 0)){
                    if ($("#body-chat-"+data.chatId+"> .ui-li-count").length > 0) {
                        $("#body-chat-"+data.chatId+"> .ui-li-count").html(unreadNum.toString());
                    } else {
                        $("#body-chat-"+data.chatId).append("<span class='ui-li-count'>"+unreadNum.toString()+"</span>");
                    }
                } else {
                    if (($("#body-chat-"+data.chatId+"> .ui-li-count").length > 0) && (unreadNum == 0)) {
                        $("#body-chat-"+data.chatId+"> .ui-li-count").remove();                        
                        $("#body-chat-"+data.chatId+"> .chat-last-time").removeClass("chat-last-time-right-blank");
                    }
                }
                updateLastMessage(groupId, data);
                // update photo and title 
                /*var groupId = objects[i].get('groupId');
                var successFunction = function(object, data){
                    var memberId = object.get("memberId");
                    for (var i=0; i<memberId.length; i++) {
                        if (memberId[i] != Parse.User.current().id) {
                            updateChatTitle(memberId[i], "chat-"+data.chatId+"> .chat-list-title", 2);
                            data['friendId'] = memberId[i];
                            getCashedPhoto120(data.friendId,"#chat-"+data.chatId);
                            $("#chat-"+data.chatId).unbind("click");
                            $("#chat-"+data.chatId).on("click",function(){
                                startPrivateChat(data.friendId);
                            });
                        }
                    }
                }
                CacheGetGroupMember(groupId, successFunction, data);*/
            }
        }
    };
    CachePullMyChat(ownerId,displayFunction);
}

function updateLastMessage(groupId, data){
    if (($("#body-chat-"+data.chatId+"> .ui-li-count").length == 0) && (typeof(data.parse) == "undefined")) {
        var displayFunction = function(object, data){
            if (object != null) {
                var text = object.get("text");
                var time = object.get("createdAt");
                $("#body-chat-"+data.chatId+"> .chat-last-message").html(text);
                $("#body-chat-"+data.chatId+"> .chat-last-time").html(convertTime(time));    
                if ($("#body-chat-"+data.chatId+"> .ui-li-count").length > 0) {                    
                    $("#body-chat-"+data.chatId+"> .chat-last-time").addClass("chat-last-time-right-blank");
                }
            } else {
                data.parse = true;
                updateLastMessage(groupId, data);
            }
        };
        CacheGetLastestMessage(groupId, displayFunction, data);
    } else {
        var limitNum = 1;
        var descendingOrderKey = "createdAt";
        var displayFunction = function(object, data){
            if (object.length > 0) {
                var text = object[0].get("text");
                var time = object[0].createdAt;
                $("#body-chat-"+data.chatId+"> .chat-last-message").html(text);                            
                $("#body-chat-"+data.chatId+"> .chat-last-time").html(convertTime(time));
                if ($("#body-chat-"+data.chatId+"> .ui-li-count").length > 0) {
                    $("#body-chat-"+data.chatId+"> .chat-last-time").addClass("chat-last-time-right-blank");
                }
            }
        };
        ParsePullChatMessage(groupId, limitNum, descendingOrderKey, null, displayFunction, data);
    }
}

// #page-chat-messages functions
function buildElementInChatMessagesPage(object){
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
    newElement += "<p>"+text+"</p>";
    newElement += "</div>";

    return newElement;
}

function sendMessage(){
    var groupId = $("#footer-bar-group-id-label").html();
    var senderId = Parse.User.current().id;
    var text = $("#footer-bar-input-message-content").val();
    if (text == "") 
        return;
    // $(window).unbind("scroll");
    $("#footer-bar-input-message-content").val("");
    var displayFunction= function(object){
        var messageId = object.id;
        var senderId = object.get("senderId");
        var groupId = object.get("groupId");
        var text = object.get("text");
        var notificationFunction = function(senderId,text,receiverId){
            var displayFunction = function(object,data){
                if (typeof(object.get("GCMId")) != "undefined") {
                    data.GCMId = object.get("GCMId");
                }
                if (typeof(object.get("APNId")) != "undefined") {
                    data.APNId = object.get("APNId");
                }
                var displayFunction = function(object,data){
                    var message = object.get("name")+": " + data.message;
                    if ("GCMId" in data)
                        pushNotificationToDevice("gcm",data.GCMId,message);
                    if ("APNId" in data)
                        pushNotificationToDevice("apn",data.APNId,message);
                };
                CacheGetProfileByUserId(data.senderId, displayFunction, data);
            };
            var data = {senderId : senderId, message: text};
            CacheGetProfileByUserId(receiverId, displayFunction, data);
        };
        CacheSetGroupMemberChatObjectReadFalse(senderId, groupId, text, notificationFunction);
        var newElement = buildElementInChatMessagesPage(object);
        $("#page-chat-messages > .ui-content").append(newElement);
        var displayFunction = function(object, data){
            var photo120 = object.get("profilePhoto120");
            if (typeof(photo120) == "undefined") {
                photo120 = "./content/png/Taylor-Swift.png";
            }
            $("#body-message-"+data.messageId).css("backgroundImage","url('"+photo120+"')");
        };
        CacheGetProfilePhotoByUserId(senderId, displayFunction, {messageId : messageId});
        //$('#footer-bar-send-message').css("bottom",($("body").height()-$("#page-chat-messages").height()-44).toString()+"px");
        
        $("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
            duration: 750,
            complete : function(){
            }
        });
        if ($("#footer-bar-send-message").css("position") == "absolute") {
            $("#footer-bar-send-message").css("bottom", ($("body").height()-$("#page-chat-messages").height()-44).toString()+"px");
        }
    };

    ParseAddChatMessage(senderId, groupId, text, displayFunction);
}

function updateChatTitle(friendId, id, option){
    var displayFunction= function(ownerId, friendId, object) {
        if (typeof(object) == "undefined") {
            // is not the friend of current user
        } else {
            // is the friend of current user
            var alias = object.get("alias");
            if (typeof(alias) == "undefined") {
                var displayFunction = function(user){
                    if ((option)&&(option == 2)) {
                        $("#"+id).html(user.get("name"));
                    } else {
                        var titleString = $("#"+id).html();
                        if (titleString.length > 0) {
                            titleString += ", "+user.get("name");
                        } else {
                            titleString += user.get("name");
                        }
                        if (titleString.length > 15) {
                            titleString = titleString.substring(0,13)+"...";
                        }
                        $("#"+id).html(titleString);
                    }
                };
                CacheGetProfileByUserId(friendId, displayFunction)
            } else {
                if ((option)&&(option == 2)) {
                    $("#"+id).html(alias);
                } else {
                    var titleString = $("#"+id).html();
                    if (titleString.length > 0) {
                        titleString += ", "+alias;
                    } else {
                        titleString += alias;
                    }
                    if (titleString.length > 15) {
                        titleString = titleString.substring(0,13)+"...";
                    }
                    $("#"+id).html(titleString);
                }
            }
        }
    };
    // get the Friend object, in order to get alias of friend.
    CacheCheckFriend(friendId, Parse.User.current().id, displayFunction);
}

function updateChatMessage(object){
    var groupId = object.get("groupId");
    var beforeAt = object.updatedAt;
    var limitNum = object.get("unreadNum");
    var descendingOrderKey = "createdAt";
    var displayFunction = function(objects, data) {
        var currentId = Parse.User.current().id;
        for (var i=objects.length-1; i>=0; i--) {
            if ($("#body-message-"+objects[i].id).length == 0) {
                var newElement = buildElementInChatMessagesPage(objects[i]);
                $("#page-chat-messages > .ui-content").append(newElement);
                var displayFunction = function(object, data) {
                    var photo120 = object.get("profilePhoto120");
                    if (typeof(photo120) == "undefined") {
                        photo120 = "./content/png/Taylor-Swift.png";
                    }
                    $("#body-message-"+data.messageId).css("backgroundImage", "url("+photo120+")")
                };
                CacheGetProfilePhotoByUserId(objects[i].get("senderId"), displayFunction, {messageId: objects[i].id});
                var groupId = objects[i].get("groupId");
                ParseSetChatObjectAsRead(currentId, groupId, 1, function(){});
            }
        }
        $("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
            duration: 750,
            complete : function(){
            }
        });
        if ($("#footer-bar-send-message").css("position") == "absolute") {
            $("#footer-bar-send-message").css("bottom", ($("body").height()-$("#page-chat-messages").height()-44).toString()+"px");
        }
    };
    ParsePullChatMessage(groupId, limitNum, descendingOrderKey, beforeAt, displayFunction, null);
}

function displayChatMessageMoreOption(){
    $("#header-chat-message-more-option").removeClass("ui-header-more-option");
    $("#header-chat-message-more-option").addClass("ui-header-more-option-active");
    var groupId = $("#footer-bar-group-id-label").html();
    var displayFunction = function(object, data) {
        var memberId = object.get("memberId");
        var memberNum = memberId.length;
        if (memberNum == 2) {
            $("#body-bottom-private-chat-message-more-option").css("position","fixed");
            $("#body-bottom-private-chat-message-more-option").css("bottom",(-$("#body-bottom-private-chat-message-more-option").height()).toString()+"px");
            $("#body-bottom-private-chat-message-more-option").show();
            $("#body-bottom-private-chat-message-more-option").animate({
                bottom: "0px"
            },300);
        } else {
            $("#body-bottom-group-chat-message-more-option").css("position","fixed");
            $("#body-bottom-group-chat-message-more-option").css("bottom",(-$("#body-bottom-group-chat-message-more-option").height()).toString()+"px");
            $("#body-bottom-group-chat-message-more-option").show();
            $("#body-bottom-group-chat-message-more-option").animate({
                bottom: "0px"
            },300);
        }
        $("body").append("<div class='ui-gray-cover' style='position:fixed; width:100%; height:100%; opacity:0; background-color:#000; z-index:1001' onclick='hideChatMessageMoreOption()'><div>")
        $(".ui-gray-cover").animate({
            opacity: 0.3
        },300);
    }
    CacheGetGroupMember(groupId, displayFunction, {});
}

function hideChatMessageMoreOption(){
    $("#header-chat-message-more-option").addClass("ui-header-more-option");
    $("#header-chat-message-more-option").removeClass("ui-header-more-option-active");
    var groupId = $("#footer-bar-group-id-label").html();
    var displayFunction = function(object, data) {
        var memberId = object.get("memberId");
        var memberNum = memberId.length;
        if (memberNum == 2) {
            $("#body-bottom-private-chat-message-more-option").animate({
                bottom: (-$("#body-bottom-private-chat-message-more-option").height()).toString()+"px"
            },300,function(){
                $("#body-bottom-private-chat-message-more-option").hide();
            });
        } else {
            $("#body-bottom-group-chat-message-more-option").animate({
                bottom: (-$("#body-bottom-group-chat-message-more-option").height()).toString()+"px"
            },300,function(){
                $("#body-bottom-group-chat-message-more-option").hide();
            });
        }
        
        $(".ui-gray-cover").animate({
            opacity: 0
        },300, function(){
            $(".ui-gray-cover").remove();
        });
    }
    
    CacheGetGroupMember(groupId, displayFunction, {});
}

function selectANewPariticipant(event) {
    var id = event.data.id;
    newGroupChatMemberArray.memberId.push(id);
    newGroupChatMemberArray.newNum++;
    $("#header-add-participant-for-group-chat").html("OK("+newGroupChatMemberArray.newNum+")");
    $("#header-add-participant-for-group-chat").unbind("click").click(createGroupChat);
    $("#body-add-participants-list-"+id).children(".ui-add-participant-unchecked").removeClass("ui-add-participant-unchecked").addClass("ui-add-participant-checked");
    $("#body-add-participants-list-"+id).unbind("click");
    $("#body-add-participants-list-"+id).click({id: id},removeANewPariticipant);
}

function removeANewPariticipant(event) {
    var id = event.data.id;
    newGroupChatMemberArray.memberId = jQuery.grep(newGroupChatMemberArray, function(value) {
      return value != id;
    });
    newGroupChatMemberArray.newNum--;
    if (newGroupChatMemberArray.newNum > 0) {
        $("#header-add-participant-for-group-chat").html("OK("+newGroupChatMemberArray.newNum+")");
        $("#header-add-participant-for-group-chat").unbind("click").click(createGroupChat);
    } else {
        $("#header-add-participant-for-group-chat").html("OK");
        $("#header-add-participant-for-group-chat").unbind("click");
    }
    $("#body-add-participants-list-"+id).children(".ui-add-participant-checked").removeClass("ui-add-participant-checked").addClass("ui-add-participant-unchecked");
    $("#body-add-participants-list-"+id).unbind("click");
    $("#body-add-participants-list-"+id).click({id: id},selectANewPariticipant);
}