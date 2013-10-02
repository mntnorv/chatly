
/////////////////////////////////////////////////////////
// UserRoom

// UserRoom constructor
function UserRoom(opts) {
	this.roomid = opts.roomid;
	this.parent = opts.parent;

	this.roomNameRef = new Firebase(this.parent.config.firebaseUrl + "/rooms/"
		+ this.roomId + "/name");
}

// Add event functionality to UserRoom
asEvented.call(UserRoom.prototype);

/////////////////////////////////////////////////////////
// UserRoom methods

UserRoom.prototype.handleRoomNameChanged = function(snapshot) {
	this.roomName = snapshot.val();
	this.trigger('roomNameChanged', snapshot.val());
};
