var cachePhoto = new Array;
var cacheUser = new Array;
var cacheFriend = new Array;
var cacheChat = new Array;
var cacheGroup = new Array;
var cacheMessage = new Array;
var cacheVersion = "1.0.1";

function rawLocalToCache(object) {
	var item = {
		id: object.objectId, 
		attributes: object, 
		createdAt: object.createdAt,
		updatedAt: object.updatedAt
	};
	item['get'] = function(a) {
		return this.attributes[a];
	};
	item['toJSON'] = function() {
		return this.attributes;
	};

	return item;
}

function cacheClear() {
	cachePhoto = new Array;
	cacheUser = new Array;
	cacheFriend = new Array;
	cacheChat = new Array;
	cacheGroup = new Array;
	cacheMessage = new Array;
}

// reload from localStorage and update
function cacheInitialization() {
	cachePhoto = new Array;
	cacheUser = new Array;
	cacheFriend = new Array;
	cacheChat = new Array;
	cacheGroup = new Array;
	cacheMessage = new Array;
	var cachedList = ["Photo", "User", "Friend", "Chat", "Group", "Message"];
	var rawData;
	var lastUpdate;
	var objectList;
	var updateIdList;
	if ((typeof(localStorage.cacheVersion) == "undefined") || (localStorage.cacheVersion != cacheVersion)) {
		localStorage.clear();
		localStorage.cacheVersion = cacheVersion;		
	}
	for (var n = 0; n< cachedList.length; n++) {
		rawData = [];
		lastUpdate = 0;
		objectList = [];
		updateIdList = [];
		switch (cachedList[n]){
			case "Photo":   if (typeof(localStorage.cachePhoto) == "undefined")   {break;} rawData = JSON.parse(localStorage.cachePhoto);   break;
			case "User":    if (typeof(localStorage.cacheUser) == "undefined")    {break;} rawData = JSON.parse(localStorage.cacheUser);    break;
			case "Friend":  if (typeof(localStorage.cacheFriend) == "undefined")  {break;} rawData = JSON.parse(localStorage.cacheFriend);  break;
			case "Chat":    if (typeof(localStorage.cacheChat) == "undefined")    {break;} rawData = JSON.parse(localStorage.cacheChat);    break;
			case "Group":   if (typeof(localStorage.cacheGroup) == "undefined")   {break;} rawData = JSON.parse(localStorage.cacheGroup);   break;
			case "Message": if (typeof(localStorage.cacheMessage) == "undefined") {break;} rawData = JSON.parse(localStorage.cacheMessage); break;
			default:
		}
		if (rawData.length == 0)  {
			//console.log("empty: "+cachedList[n]);
			continue;
		}
		for (var i=0; i < rawData.length; i++) {
			var rawObject = rawData[i];
			objectList.push(rawLocalToCache(rawObject));
			updateIdList.push(rawData[i].objectId);
			if (Date.parse(rawObject.updatedAt) > lastUpdate)
				lastUpdate = Date.parse(rawObject.updatedAt);
		}
		lastUpdate = new Date(lastUpdate);
		//console.log(lastUpdate.toJSON());
		switch (cachedList[n]){
			case "Photo":   cachePhoto = objectList;   break;
			case "User":    cacheUser = objectList;    break;
			case "Friend":  cacheFriend = objectList;  break;
			case "Chat":    cacheChat = objectList;    break;
			case "Group":   cacheGroup = objectList;   break;
			case "Message": cacheMessage = objectList; break;
			default:
		}
		ParseUpdateCache(cachedList[n], updateIdList, lastUpdate);
	}
}

// functions of cachedPhoto
function CacheGetProfilePhoto(userId, displayFunction, data) {
	var cached = false;
	for (var i = 0; i < cachePhoto.length; i++) {
		if (cachePhoto[i].get('userId') == userId) {
			displayFunction(cachePhoto[i], data);
			cached = true;
			break;
		}
	}
	if (!cached) {
		console.log("Photo miss: "+userId);
		ParseGetProfilePhoto(userId, displayFunction, data);
	}
}

function CacheGetProfilePhotoByUsername(username, displayFunction, data) {
	var cached = false;
	var userId = null;
	for (var i = 0; i < cacheUser.length; i++) {
		if (cacheUser[i].get('username') == username) {
			userId = cacheUser[i].id;
			break;
		}
	}
	if (userId != null) {
		for (var i = 0; i < cachePhoto.length; i++) {
			if (cachePhoto[i].get('userId') == userId) {
				displayFunction(cachePhoto[i], data);
				cached = true;
				break;
			}
		}
	}
	if (!cached) {
		console.log("Photo miss: "+username);
		ParseGetProfilePhotoByUsername(username, displayFunction, data);
	}
}

function CacheUpdatePhoto(object){
	if (typeof(object) == "undefined")
		return
	object = rawLocalToCache(JSON.parse(JSON.stringify(object)));
	var cached = false;
	for (var i = 0; i < cachePhoto.length; i++) {
		if (cachePhoto[i].get('userId') == object.get('userId')) {
			cachePhoto.splice(i, 1, object);
			cached = true;
			break;
		}
	}
	if (!cached) {
		cachePhoto.push(object);
	}
	localStorage.cachePhoto = JSON.stringify(cachePhoto);
}

// functions of cachedUser
function CacheGetProfileByUsername(username, displayFunction, data){
	var cached = false;
	for (var i = 0; i < cacheUser.length; i++) {
		if (cacheUser[i].get('username') == username) {
			displayFunction(cacheUser[i], data);
			cached = true;
			break;
		}
	}
	if (!cached) {
		console.log("User miss: "+username);
		ParseGetProfileByUsername(username, displayFunction, data);
	}
}

function CacheGetProfileByUserId(userId, displayFunction, data){
	var cached = false;
	for (var i = 0; i < cacheUser.length; i++) {
		if (cacheUser[i].id == userId) {
			displayFunction(cacheUser[i], data);
			cached = true;
			break;
		}
	}
	if (!cached) {
		console.log("User miss: "+userId);
		ParseGetProfileByUserId(userId, displayFunction, data);
	}
}

function CacheUpdateUser(object){
	if (typeof(object) == "undefined")
		return
	object = rawLocalToCache(JSON.parse(JSON.stringify(object)));
	var cached = false;
	for (var i = 0; i < cacheUser.length; i++) {
		if (cacheUser[i].id == object.id) {
			cacheUser.splice(i, 1, object);
			cached = true;
			break;
		}
	}
	if (!cached) {
		cacheUser.push(object);
	}
	localStorage.cacheUser = JSON.stringify(cacheUser);
}

// functions of cachedFriend
function CacheCheckFriend(friendId, ownerId, displayFunction){
	var cached = false;
	for (var i = 0; i < cacheFriend.length; i++) {
		if ((cacheFriend[i].get("friend") == friendId) && (cacheFriend[i].get("owner") == ownerId)) {
			displayFunction(ownerId, friendId, cacheFriend[i]);
			cached = true;
			break;
		}
	}
	if (!cached) {
		displayFunction(ownerId, friendId);
	}
}

function CachePullNewFriendRequest(userId, descendingOrderKey, displayFunction) {
	var requests = new Array;

	for (var i = 0; i < cacheFriend.length; i++) {
		if ((cacheFriend[i].get("friend") == userId) && (cacheFriend[i].get("valid") == false)) {
			requests.push(cacheFriend[i]);
		}
	}

	displayFunction(requests);
}

function CachePullMyFriend(userId, descendingOrderKey, displayFunction) {
	var friends = new Array;

	for (var i = 0; i < cacheFriend.length; i++) {
		if ((cacheFriend[i].get("owner") == userId) && (cacheFriend[i].get("valid") == true)) {
			friends.push(cacheFriend[i]);
		}
	}
	friends.sort(function(a, b){return a.get('name') - b.get('name')});

	displayFunction(friends);
}

function CacheUpdateFriend(object){
	if (typeof(object) == "undefined")
		return
	object = rawLocalToCache(JSON.parse(JSON.stringify(object)));
	var cached = false;
	for (var i = 0; i < cacheFriend.length; i++) {
		if (cacheFriend[i].id == object.id) {
			cacheFriend.splice(i, 1, object);
			cached = true;
			break;
		}
	}
	if (!cached) {
		cacheFriend.push(object);
	}
	localStorage.cacheFriend = JSON.stringify(cacheFriend);
}

function CacheRemoveFriend(object) {
	for (var i = 0; i < cacheFriend.length; i++) {
		if (cacheFriend[i].id == object.id) {
			cacheFriend.splice(i, 1);
			break;
		}
	}
	localStorage.cacheFriend = JSON.stringify(cacheFriend);
}

// functions of cachedChat
function CachePullMyChat(ownerId,displayFunction) {
	var chats = new Array;
	for (var i = 0;  i<cacheChat.length; i++) {
		if ((cacheChat[i].get("ownerId") == ownerId) && (cacheChat[i].get("hidden") == false)) {
			chats.push(cacheChat[i]);
		}
	}
	chats.sort(function(a,b){return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)});

	displayFunction(chats);
}

function CacheUpdateChat(object){
	if (typeof(object) == "undefined")
		return
	object = rawLocalToCache(JSON.parse(JSON.stringify(object)));
	var cached = false;
	for (var i = 0; i < cacheChat.length; i++) {
		if (cacheChat[i].id == object.id) {
			cacheChat.splice(i, 1, object);
			cached = true;
			break;
		}
	}
	if (!cached) {
		cacheChat.push(object);
	}
	localStorage.cacheChat = JSON.stringify(cacheChat);
}

// functions of cachedGroup
function CacheSetGroupMemberChatObjectReadFalse(senderId, groupId, text, notificationFunction){
	var cached = false;
	for (var i = 0; i < cacheGroup.length; i++) {
		if (cacheGroup[i].id == groupId) {
			ParseSetChatObjectReadFalseByCurrentIndexAndGroupId(senderId, cacheGroup[i].get("memberId"), 0, groupId, text, notificationFunction);
			cached = true;
			break;
		}
	}
	if (!cached) {
		console.log("Group miss: "+groupId);
		ParseSetGroupMemberChatObjectReadFalse(senderId, groupId, text, notificationFunction);
	}
}

function CacheGetGroupId(memberId, successFunction){
	var cached = false;
	for (var i = 0; i < cacheGroup.length; i++) {
		if (cacheGroup[i].get("memberNum") == memberId.length) {
			cached = true;
			var GroupMemberId = cacheGroup[i].get("memberId");
			for (var j = 0; j < memberId.length; j++) {
				if (GroupMemberId.indexOf(memberId[j]) == -1) {
					cached = false;
					break;
				}
			}
			if (cached) {
				successFunction(cacheGroup[i]);
				break;
			}
		}
	}

	if (!cached) {
		console.log("Group miss: "+memberId);
		ParseGetGroupId(memberId, successFunction);
	}

}

function CacheGetGroupMember(groupId, successFunction, data){
	var cached = false;
	for (var i = 0; i < cacheGroup.length; i++) {
		if (cacheGroup[i].id == groupId) {
			successFunction(cacheGroup[i], data);
			cached = true;
			break;
		}
	}
	if (!cached) {
		console.log("Group miss: "+groupId);
		ParseGetGroupMember(groupId, successFunction, data)
	}
}

function CacheUpdateGroup(object){
	if (typeof(object) == "undefined")
		return
	object = rawLocalToCache(JSON.parse(JSON.stringify(object)));
	var cached = false;
	for (var i = 0; i < cacheGroup.length; i++) {
		if (cacheGroup[i].id == object.id) {
			cacheGroup.splice(i, 1, object);
			cached = true;
			break;
		}
	}
	if (!cached) {
		cacheGroup.push(object);
	}
	localStorage.cacheGroup = JSON.stringify(cacheGroup);
}

// functions for Message
function CachePullChatMessage(groupId, limitNum, beforeAt, displayFunction){
	var messages = new Array;
	for (var i = 0; i < cacheMessage.length; i++) {
		if ((cacheMessage[i].get("groupId") == groupId) && ((beforeAt == null) || (Date.parse(cacheMessage[i].get("createdAt")) < Date.parse(beforeAt)))) {
			messages.push(cacheMessage[i]);
		}
	}

	messages.sort(function(a,b){return Date.parse(b.createdAt) - Date.parse(a.createdAt)});
	if (messages.length > limitNum) {
		var cutLen = messages.length - limitNum;
		messages.splice(limitNum, cutLen);
	}
	if (messages.length == 0) {
		ParsePullAllMessageByGroupIdForCache(groupId, limitNum, beforeAt, displayFunction);
	} else {
		displayFunction(messages);
	}
	
}

function CacheGetLastestMessage(groupId, displayFunction,data){
	var afterAt = null;
	var message = null;
	for (var i = 0; i < cacheMessage.length; i++) {
		if ((cacheMessage[i].get('groupId') == groupId) && ((afterAt == null) || (Date.parse(cacheMessage[i].get("createdAt")) >= Date.parse(afterAt)))) {
			message = cacheMessage[i];
			afterAt = message.get("createdAt");
		}
	}
	displayFunction(message,data);
}

function CacheUpdateMessage(object){
	if (typeof(object) == "undefined")
		return
	object = rawLocalToCache(JSON.parse(JSON.stringify(object)));
	var cached = false;
	for (var i = 0; i < cacheMessage.length; i++) {
		if (cacheMessage[i].id == object.id) {
			cacheMessage.splice(i, 1, object);
			cached = true;
			break;
		}
	}
	if (!cached) {
		cacheMessage.push(object);
	}
	localStorage.cacheMessage = JSON.stringify(cacheMessage);
}