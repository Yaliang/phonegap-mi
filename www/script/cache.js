/* cached variables for current user --
 * cacheUser:     an array of objects
 *
 * cachePhoto:    an array of objects
 *
 * cacheFriend:   an array of objects that represent users that are connected to current user, including users
 *                that are friends of current user, users that have received friend requests from current user
 *                but have not accepted yet, users that have sent friend requests to current user but have not
 *                been accepted.
 *
 * cacheChat:     an array of objects
 *
 * cacheMessage:  an array of objects
 *
 * cacheGroup:    an array of objects
 */
var cacheUser = [];
var cachePhoto = [];
var cacheFriend = [];
var cacheChat = [];
var cacheMessage = [];
var cacheGroup = [];
var cacheVersion = "1.0.4";

/* This function is designed to convert the raw data in the local storage to a more readable format so they can be
 * stored in the cache we defined above.
 */
function rawLocalToCache(object) {
    var item = {
        id: object.objectId,
        attributes: object,
        createdAt: object.createdAt,
        updatedAt: object.updatedAt
    };
    item["get"] = function(a) {
        return this.attributes[a];
    };
    item["toJSON"] = function() {
        return this.attributes;
    };

    return item;
}

/* This function is designed to clear the cahce when user logs out.
 */
function cacheClear() {
    cacheUser = [];
    cachePhoto = [];
    cacheFriend = [];
    cacheChat = [];
    cacheMessage = [];
    cacheGroup = [];
}

/* This function is designed to update the cache from local storage.
 */
function cacheInitialization() {
    cacheUser = [];
    cachePhoto = [];
    cacheFriend = [];
    cacheChat = [];
    cacheMessage = [];
    cacheGroup = [];
    var cachedList = ["User", "Photo", "Friend", "Chat", "Message", "Group"];
    var rawData;
    var lastUpdate;
    var objectList;
    var updateIdList;
    if ((typeof(localStorage.cacheVersion) == "undefined") || (localStorage.cacheVersion != cacheVersion)) {
        localStorage.clear();
        localStorage.cacheVersion = cacheVersion;
    }
    for (var n = 0; n < cachedList.length; n++) {
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
        switch (cachedList[n]){
            case "User":    cacheUser = objectList;    break;
            case "Photo":   cachePhoto = objectList;   break;
            case "Friend":  cacheFriend = objectList;  break;
            case "Chat":    cacheChat = objectList;    break;
            case "Message": cacheMessage = objectList; break;
            case "Group":   cacheGroup = objectList;   break;
            default:
        }
        ParseUpdateCache(cachedList[n], updateIdList, lastUpdate);
    }
}

/* This function is designed to get the cached user profile by user Id.
 */
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
        //console.log("User miss: "+userId);
        ParseGetProfileByUserId(userId, displayFunction, data);
    }
}

/* This function is designed to get the cached user profile by user name.
 */
function CacheGetProfileByUsername(username, displayFunction, data){
    var cached = false;
    for (var i = 0; i < cacheUser.length; i++) {
        if (cacheUser[i].get("username") == username) {
            displayFunction(cacheUser[i], data);
            cached = true;
            break;
        }
    }
    if (!cached) {
        //console.log("User miss: "+username);
        ParseGetProfileByUsername(username, displayFunction, data);
    }
}

/* This function is designed to get the cached user profile photo by user Id.
 */
function CacheGetProfilePhotoByUserId(userId, displayFunction, data) {
    var cached = false;
    for (var i = 0; i < cachePhoto.length; i++) {
        if (cachePhoto[i].get("userId") == userId) {
            displayFunction(cachePhoto[i], data);
            cached = true;
            break;
        }
    }
    if (!cached) {
        //console.log("Photo miss: "+userId);
        ParseGetProfilePhotoByUserId(userId, displayFunction, data);
    }
}

/* This function is designed to get the cached user profile photo by user name.
 */
function CacheGetProfilePhotoByUsername(username, displayFunction, data) {
    var cached = false;
    var userId = null;
    for (var i = 0; i < cacheUser.length; i++) {
        if (cacheUser[i].get("username") == username) {
            userId = cacheUser[i].id;
            break;
        }
    }

    if (userId != null) {
        for (i = 0; i < cachePhoto.length; i++) {
            if (cachePhoto[i].get("userId") == userId) {
                displayFunction(cachePhoto[i], data);
                cached = true;
                break;
            }
        }
    }

    if (!cached) {
        //console.log("Photo miss: "+username);
        ParseGetProfilePhotoByUsername(username, displayFunction, data);
    }
}

/* This function is designed to update the cached user.
 */
function CacheUpdateUser(object){
    if (typeof(object) == "undefined") {
        return;
    }

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

/* This function is designed to update the cached user profile photo.
 */
function CacheUpdatePhoto(object){
    if (typeof(object) == "undefined") {
        return;
    }

    object = rawLocalToCache(JSON.parse(JSON.stringify(object)));
    var cached = false;
    for (var i = 0; i < cachePhoto.length; i++) {
        if (cachePhoto[i].get("userId") == object.get("userId")) {
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

/* this function is designed to check whether two users are friends or not.
 * Note: there are four cases regarding friendship between two users:
 * 1. they are friends -- cacheFriend[i] object will not be null and "valid" field will be true;
 * 2. ownerId has sent a friend request to friendId but has not been accepted -- cacheFriend[i] object
 *                       will not be null but "valid" field will be false;
 * 3. ownerId has received a friend request from friendId but has not accepted -- cacheFriend[i] object
 *                       will be null and "valid" field will be false; but if you switch the friendId and
 *                       ownerId, you will get case 2.
 * 4. they are not friends and no friend request has been sent or received: cacheFriend[i] object will be
 *                       null and "valid" field will be false;
 *
 * CacheCheckFriend function can only tell if cacheFriend[i] object is null or not. If it's not null, then
 * you still need to check if "valid" field is true or not; but if it is null, then you need to switch
 * friendId and ownerId to check if friendId has sent a friend request to ownerId.
 */
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

/* This function is designed to pull up new friend requests and show it.
 */
function CachePullNewFriendRequest(userId, descendingOrderKey, displayFunction) {
    var requests = [];

    for (var i = 0; i < cacheFriend.length; i++) {
        if ((cacheFriend[i].get("friend") == userId) && (cacheFriend[i].get("valid") == false)) {
            requests.push(cacheFriend[i]);
        }
    }

    displayFunction(requests);
}

/* This function is designed to show the user's friends in natural order.
 */
function CachePullMyFriend(userId, descendingOrderKey, displayFunction) {
    var friends = [];

    for (var i = 0; i < cacheFriend.length; i++) {
        if ((cacheFriend[i].get("owner") == userId) && (cacheFriend[i].get("valid") == true)) {
            friends.push(cacheFriend[i]);
        }
    }
    friends.sort(function(a, b){return a.get("name") - b.get("name")});

    displayFunction(friends);
}

/* This function is designed to update the cached friend.
 */
function CacheUpdateFriend(object){
    if (typeof(object) == "undefined") {
        return;
    }

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

/* This function is designed to remove the friend object from the cacheFriend list.
 */
function CacheRemoveFriend(friendObject) {
    for (var i = 0; i < cacheFriend.length; i++) {
        if (cacheFriend[i].id == friendObject.id) {
            cacheFriend.splice(i, 1);
            break;
        }
    }
    localStorage.cacheFriend = JSON.stringify(cacheFriend);
}

/* This function is designed to pull up my chatting messages and show them by the order when they are
 * updated.
 */
function CachePullMyChat(ownerId,displayFunction) {
    var chats = [];
    for (var i = 0;  i<cacheChat.length; i++) {
        if ((cacheChat[i].get("ownerId") == ownerId) && !(cacheChat[i].get("hidden"))) {
            chats.push(cacheChat[i]);
        }
    }
    chats.sort(function(a,b){return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)});

    displayFunction(chats);
}

/* This function is designed to get the chat message by its group Id.
 */
function CacheGetChatByGroupId(ownerId, groupId, displayFunction, data) {
    var chat;
    for (var i = 0;  i<cacheChat.length; i++) {
        if ((cacheChat[i].get("ownerId") == ownerId) && (cacheChat[i].get("groupId") == groupId) && (cacheChat[i].get("hidden") == false)) {
            chat = cacheChat[i];
            break;
        }
    }

    displayFunction(chat, data);
}

/* This function is designed to update the cached chatting messages.
 */
function CacheUpdateChat(object){
    if (typeof(object) == "undefined") {
        return;
    }

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

/* This function is designed to delete the chat object from the cacheChat list.
 * The chat object will no longer be available in later use.
 */
function CacheDeleteChat(chatObject) {
    for (var i = 0; i < cacheChat.length; i++) {
        if (cacheChat[i].id == chatObject.id) {
            cacheChat.splice(i, 1);
            break;
        }
    }

    localStorage.cacheCat = JSON.stringify(cacheChat);
}

/* This function is designed to ...
 */
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
        //console.log("Group miss: "+groupId);
        ParseSetGroupMemberChatObjectReadFalse(senderId, groupId, text, notificationFunction);
    }
}

/* This function is designed to get the cached group of private chat Id by its member Id.
 * Modified by Yaliang. 4/18/2015
 */
function CacheGetGroupIdInPrivateChat(memberId, successFunction){
    var cached = false;
    for (var i = 0; i < cacheGroup.length; i++) {
        if ((cacheGroup[i].get("memberId").length == memberId.length) && (!cacheGroup[i].get("isGroup"))) {
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
        //console.log("Group miss: "+memberId);
        ParseGetGroupIdInPrivateChat(memberId, successFunction);
    }
}

/* This function is designed to get the cached group by its Id.
 */
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
        //console.log("Group miss: "+groupId);
        ParseGetGroupMember(groupId, successFunction, data)
    }
}

/* This function is designed to update the cached group.
 */
function CacheUpdateGroup(object){
    if (typeof(object) == "undefined")
        return;
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

/* This function is designed to pull up the group chat messages.
 */
function CachePullChatMessage(groupId, limitNum, beforeAt, displayFunction){
    var messages = [];
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

/* This function is designed to show the latest chat message in the group chat.
 */
function CacheGetLatestMessage(groupId, displayFunction,data){
    var afterAt = null;
    var message = null;
    for (var i = 0; i < cacheMessage.length; i++) {
        if ((cacheMessage[i].get("groupId") == groupId) && ((afterAt == null) || (Date.parse(cacheMessage[i].get("createdAt")) >= Date.parse(afterAt)))) {
            message = cacheMessage[i];
            afterAt = message.get("createdAt");
        }
    }
    displayFunction(message,data);
}

/* This function is designed to update the cached message.
 */
function CacheUpdateMessage(object){
    if (typeof(object) == "undefined") {
        return;
    }

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