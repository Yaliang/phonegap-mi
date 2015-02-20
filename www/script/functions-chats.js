// general functions
function startPrivateChat(friendId){
	$("#page-chat-messages > .ui-content").html("");
	$("#chat-messages-title").html("");
	$("#message-content").val("");	
	
	var memberId = new Array;
	memberId.push(friendId);
	memberId.push(Parse.User.current().id);
	var successFunction = function(object){
		var groupId = object.id;
		var currentId = Parse.User.current().id;
		$("#group-id-label").html(groupId);
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
						$("#message-"+data.messageId).css("backgroundImage", "url("+photo120+")")
					};
					CacheGetProfilePhoto(objects[i].get('senderId'), displayFunction, {messageId: objects[i].id});
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
	updateChatTitle(friendId, "chat-messages-title");
}

// #page-chat functions

function buildElementInChatListPage(object){
	var chatId = object.id;
	var groupId = object.get('groupId');
	var unreadNum = object.get("unreadNum");
	var newElement = "";
	newElement += "<div id='chat-"+chatId+"' class='chat-list'>";
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
			if ($("#chat-"+objects[i].id).length == 0) {
				var newElement = buildElementInChatListPage(objects[i]);
				$("#page-chat > .ui-content").prepend(newElement);
				var chatId = objects[i].id;
				var data = {chatId: chatId};
				var groupId = objects[i].get('groupId');
				var successFunction = function(object, data){
					var memberId = object.get("memberId");
					for (var i=0; i<memberId.length; i++) {
						if (memberId[i] != Parse.User.current().id) {
							updateChatTitle(memberId[i], "chat-"+data.chatId+"> .chat-list-title", 2);
							data['friendId'] = memberId[i];
							var displayFunction = function(object, data) {
								var photo120 = object.get("profilePhoto120");
								if (typeof(photo120) == "undefined") {
									photo120 = "./content/png/Taylor-Swift.png";
								}
								$("#chat-"+data.chatId).css("backgroundImage", "url("+photo120+")")
							};
							CacheGetProfilePhoto(data.friendId, displayFunction, data);
							$("#chat-"+data.chatId).unbind("click");
							$("#chat-"+data.chatId).on("click",function(){
								startPrivateChat(data.friendId);
							});
						}
					}
				};
				CacheGetGroupMember(groupId, successFunction, data);
				updateLastMessage(groupId, data);
			} else {
				var chatId = objects[i].id;				
				var groupId = objects[i].get('groupId');
				var data = {chatId: chatId};
				var unreadNum = objects[i].get('unreadNum');
				// move the element to top of the list
				var element = $("#chat-"+data.chatId);
				$("#page-chat > .ui-content").prepend(element);
				// update unread number label
				var unreadNum_Current;
				if ($("#chat-"+data.chatId+"> .ui-li-count").length > 0) {
					unreadNum_Current = parseInt($("#chat-"+data.chatId+"> .ui-li-count").html());
				} else {
					unreadNum_Current = 0;
				}
				if ((unreadNum != unreadNum_Current) && (unreadNum > 0)){
					if ($("#chat-"+data.chatId+"> .ui-li-count").length > 0) {
						$("#chat-"+data.chatId+"> .ui-li-count").html(unreadNum.toString());
					} else {
						$("#chat-"+data.chatId).append("<span class='ui-li-count'>"+unreadNum.toString()+"</span>");
					}
				} else {
					if (($("#chat-"+data.chatId+"> .ui-li-count").length > 0) && (unreadNum == 0)) {
						$("#chat-"+data.chatId+"> .ui-li-count").remove();						
						$("#chat-"+data.chatId+"> .chat-last-time").removeClass("chat-last-time-right-blank");
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
	if (($("#chat-"+data.chatId+"> .ui-li-count").length == 0) && (typeof(data.parse) == "undefined")) {
		var displayFunction = function(object, data){
			if (object != null) {
				var text = object.get("text");
				var time = object.get("createdAt");
				$("#chat-"+data.chatId+"> .chat-last-message").html(text);
				$("#chat-"+data.chatId+"> .chat-last-time").html(convertTime(time));	
				if ($("#chat-"+data.chatId+"> .ui-li-count").length > 0) {					
					$("#chat-"+data.chatId+"> .chat-last-time").addClass("chat-last-time-right-blank");
				}
			} else {
				data.parse = true;
				updateLastMessage(groupId, data);
			}
		}
		CacheGetLastestMessage(groupId, displayFunction, data);
	} else {
		var limitNum = 1;
		var descendingOrderKey = "createdAt";
		var displayFunction = function(object, data){
			if (object.length > 0) {
				var text = object[0].get("text");
				var time = object[0].createdAt;
				$("#chat-"+data.chatId+"> .chat-last-message").html(text);							
				$("#chat-"+data.chatId+"> .chat-last-time").html(convertTime(time));
				if ($("#chat-"+data.chatId+"> .ui-li-count").length > 0) {
					$("#chat-"+data.chatId+"> .chat-last-time").addClass("chat-last-time-right-blank");
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
	var text = object.get('text');
	var elementClass;

	var newElement = "";
	if (currentId == senderId) {
		elementClass = "ui-custom-message-right";
	} else {
		elementClass = "ui-custom-message-left";
	}
	newElement += "<div id='message-"+messageId+"' class='"+elementClass+"'>";
	newElement += "<p>"+text+"</p>";
	newElement += "</div>";

	return newElement;
}

function sendMessage(){
	var groupId = $("#group-id-label").html();
	var senderId = Parse.User.current().id;
	var text = $("#message-content").val();
	if (text == "") 
		return;
	// $(window).unbind("scroll");
	$("#message-content").val("");
	var displayFunction= function(object){
		var messageId = object.id;
		var senderId = object.get("senderId");
		var groupId = object.get("groupId");
		var text = object.get('text');
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
					if ('GCMId' in data)
						pushNotificationToDevice('gcm',data.GCMId,message);
					if ('APNId' in data)
						pushNotificationToDevice('apn',data.APNId,message);
				}
				CacheGetProfileByUserId(data.senderId, displayFunction, data);
			}
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
			$("#message-"+data.messageId).css("backgroundImage","url('"+photo120+"')");
		};
		CacheGetProfilePhoto(senderId, displayFunction, {messageId : messageId});
		//$('#send-message-bar').css("bottom",($("body").height()-$("#page-chat-messages").height()-44).toString()+"px");
		
		$("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
			duration: 750,
			complete : function(){
			}
		});
		if ($("#send-message-bar").css("position") == "absolute") {
			$('#send-message-bar').css("bottom", ($("body").height()-$("#page-chat-messages").height()-44).toString()+"px");
		}
		
	};

	ParseAddChatMessage(senderId, groupId, text, displayFunction);
}

function updateChatTitle(friendId, id, option){
	var displayFunction= function(ownerId, friendId, object) {
		var alias = object.get('alias');
		if (typeof(alias) == "undefined") {
			var displayFunction = function(user){
				if ((option)&&(option == 2)) {
					$('#'+id).html(user.get("name"));
				} else {
					$('#'+id).append(user.get("name"));
				}
			};
			CacheGetProfileByUserId(friendId, displayFunction)
		} else {
			if ((option)&&(option == 2)) {
				$('#'+id).html(alias);
			} else {
				$('#'+id).append(alias);
			}
		}
	};
	// get the Friend object, in order to get alias of friend.
	CacheCheckFriend(friendId, Parse.User.current().id, displayFunction);
}

function updateChatMessage(object){
	var groupId = object.get('groupId');
	var beforeAt = object.updatedAt;
	var limitNum = object.get("unreadNum");
	var descendingOrderKey = "createdAt";
	var displayFunction = function(objects, data) {
		var currentId = Parse.User.current().id;
		for (var i=objects.length-1; i>=0; i--) {
			if ($("#message-"+objects[i].id).length == 0) {
				var newElement = buildElementInChatMessagesPage(objects[i]);
				$("#page-chat-messages > .ui-content").append(newElement);
				var displayFunction = function(object, data) {
					var photo120 = object.get("profilePhoto120");
					if (typeof(photo120) == "undefined") {
						photo120 = "./content/png/Taylor-Swift.png";
					}
					$("#message-"+data.messageId).css("backgroundImage", "url("+photo120+")")
				}
				CacheGetProfilePhoto(objects[i].get('senderId'), displayFunction, {messageId: objects[i].id});
				var groupId = objects[i].get('groupId');
				ParseSetChatObjectAsRead(currentId, groupId, 1, function(){});
			}
		}
		$("html body").animate({ scrollTop: $(document).height().toString()+"px" }, {
			duration: 750,
	        complete : function(){
	        }
	    });
	    if ($("#send-message-bar").css("position") == "absolute") {
			$('#send-message-bar').css("bottom", ($("body").height()-$("#page-chat-messages").height()-44).toString()+"px");
		}
	}
	ParsePullChatMessage(groupId, limitNum, descendingOrderKey, beforeAt, displayFunction, null);

}
