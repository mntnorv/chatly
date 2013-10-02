
/////////////////////////////////////////////////////////
// UserRoom

// UserRoom constructor
function UserRoom(opts) {
	this.roomId = opts.roomId;
	this.parent = opts.parent;

	this.roomNameRef = new Firebase(this.parent.config.firebaseUrl + "/rooms/"
		+ this.roomId + "/name");
	this.roomNameRef.on('value', this.handleRoomNameChanged.bind(this));
}

// Add event functionality to UserRoom
asEvented.call(UserRoom.prototype);

/////////////////////////////////////////////////////////
// UserRoom methods

UserRoom.prototype.stop = function() {
	this.roomNameRef.off();
	this.roomNameRef = null;
};

UserRoom.prototype.handleRoomNameChanged = function(snapshot) {
	this.name = snapshot.val();
	this.trigger('nameChanged', snapshot.val());
};
