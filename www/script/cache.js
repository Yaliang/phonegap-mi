var cachePhoto = new Array;
var cacheUser = new Array;

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
		ParseGetProfilePhoto(userId, displayFunction, data);
	}
}

function CacheUpdatePhoto(object){
	var cached = false;
	for (var i = 0; i < cachePhoto.length; i++) {
		if (cachePhoto[i].get('userId') == userId) {
			cachePhoto.splice(i, 1, object);
			cached = true;
			break;
		}
	}
	if (!cached) {
		CacheAddPhoto(object);
	}
}

function CacheAddPhoto(object){
	cachePhoto.push(object);
}

function CacheGetProfileByUsername(username, displayFunction, data){
	var cached = false;
	for (var i = 0; i < cacheUser.length; i++) {
		if (cacheUser[i].getUsername() == username) {
			displayFunction(cacheUser[i], data);
			cached = true;
			break;
		}
	}
	if (!cached) {
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
		ParseGetProfileByUserId(userId, displayFunction, data);
	}
}

function CacheUpdateUser(object){
	var cached = false;
	for (var i = 0; i < cacheUser.length; i++) {
		if (cacheUser[i].id == object.id) {
			cacheUser.splice(i, 1, object);
			cached = true;
			break;
		}
	}
	if (!cached) {
		CacheAddUser(object);
	}
}

function CacheAddUser(object) {
	cacheUser.push(object);
}