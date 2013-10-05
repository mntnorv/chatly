
/////////////////////////////////////////////////////////
// UserRoom

/**
 * The constructor of UserRoom
 * @param {object} opts
 * @param {string} opts.roomId - a unique id of the room
 * @param {Chat} opts.parent - the parent Chat object
 * @constructor
 */
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

/**
 * Removes all listeners from this room.
 * Must be called when this room is no longer used.
 */
UserRoom.prototype.stop = function() {
	this.roomNameRef.off();
	this.roomNameRef = null;
};

/**
 * Handle a room name change
 * @param snapshot - a Firebase snapshot of the new room name
 * @fires UserRoom#event:nameChanged
 */
UserRoom.prototype.handleRoomNameChanged = function(snapshot) {
	this.name = snapshot.val();
	this.trigger('nameChanged', snapshot.val());
};
