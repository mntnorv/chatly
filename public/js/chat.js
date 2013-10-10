
/////////////////////////////////////////////////////////
// Chat

/**
 * Firebase chat function handler
 * @constructor
 * @param {object} [opts] - chat options
 * @param {string} [opts.firebaseUrl] - firebase URL of the chat
 */
function Chat(opts) {
	// Define options as an empty object if opts is null
	var options = opts || {};

	// Default configuration
	this.config = {
		firebaseUrl: "https://chatly.firebaseio.com"
	};

	// Set config from options
	for (var item in options) {
        if (options.hasOwnProperty(item)) {
		    this.config[item] = options[item];
        }
	}

	// Contact array
	this.contacts = {};

    // Users in the room
    this.roomUsers = {};

	// User room array
	this.userRooms = {};

	// Job queue
	this.queue = [];

	// Firebase connection reference
	this.connectedRef = new Firebase(this.config.firebaseUrl + "/.info/connected");

	// Set callbacks
	this.on('gotToken', this.handleGotToken.bind(this));
}

// Add event functionality to Chat
asEvented.call(Chat.prototype);

/////////////////////////////////////////////////////////
// Getters

/**
 * Get the name of the 'oneContactRoom' with this user
 * @param {string} username - name of the other user
 * @returns {string} The room name
 */
Chat.prototype.getRoomNameWith = function(username) {
	var roomName;
	if (this.username < username) {
		roomName = this.username + '&' + username;
	} else {
		roomName = username + '&' + this.username;
	}
	return roomName;
};

/**
 * Get the current list of contacts
 * @returns {{?: Contact}} A list of contacts
 */
Chat.prototype.getContacts = function() {
	return this.contacts;
};

/////////////////////////////////////////////////////////
// Chat control

/**
 * Start the chat engine
 */
Chat.prototype.start = function() {
	this.getUserToken();
};

/**
 * Get the user token
 * @fires Chat#event:gotToken
 */
Chat.prototype.getUserToken = function() {
	var self = this;
	$.ajax("/user/gettoken.php")
		.done(function (response) {
			if (response.username && response.token) {
				self.trigger("gotToken", response);
			}
		})
		.fail(function() {
			alert("Error: unable to get your username.");
		});
};

/**
 * Connect to the Firebase chat.
 * Requires Chat#getUserToken to be called before this.
 */
Chat.prototype.connect = function() {
	var self = this;

	this.userRef = new Firebase(this.config.firebaseUrl + "/users/"
		+ this.username);

	this.userRef.auth(this.token, function (error, result) {
		if (error) {
			console.error('Error: unable to login: ' + error);
		} else {
			console.log('Expires at: ' + new Date(result.expires * 1000));
			self.authenticated = true;
			self.handleAuthSuccess.bind(self).call();
		}
	});
};

/////////////////////////////////////////////////////////
// Job queue

/**
 * Run all of the queued jobs.
 * This is used to queue all of the jobs that require the chat to be connected,
 * but it is not yet connected.
 */
Chat.prototype.runQueuedJobs = function() {
	for (var i = this.queue.length - 1; i >= 0; i--) {
		switch (this.queue[i].type) {
			case 'room':
				this.joinRoom(this.queue[i].roomId);
				break;
			case 'contactRoom':
				this.joinContactRoom(this.queue[i].username);
				break;
		}

		delete this.queue[i];
	}
};

/////////////////////////////////////////////////////////
// Contact management methods

/**
 * Send a friend request
 * @param {string} username - The username of the contact to send the request to
 * @param success - the success callback
 * @param failure - the failure callback (with an error message)
 */
Chat.prototype.sendFriendRequest = function(username, success, failure) {
    var self = this;

	var handleResponse = function (data) {
		if (data.success === true) {
			self.handleSendFriendRequest(username);
			
			if (success) {
				success();
			}
		} else {
			if (failure) {
				failure(data.error);
			}
		}
	}

	$.post(
		"/ajax/check_contact_username.php",
		{username: username},
		handleResponse
	);
};

/**
 * Confirm a friend request
 * @param {string} username - the username of the contact to confirm the friend request from
 */
Chat.prototype.confirmFriendRequest = function(username) {
	var roomName = this.getRoomNameWith(username);

	var roomData = {
		type: 'oneContactRoom',
		users: {}
	};
	roomData.users[this.username] = true;
	roomData.users[username]      = true;

	// Create the user room
	new Firebase(this.config.firebaseUrl + "/rooms/" + roomName)
		.set(roomData);

	// Update contact states
	this.userRef
		.child('contacts')
		.child(username)
		.transaction(function (current_value) {
			if (current_value === false) {
				return true;
			} else {
				return current_value;
			}
		})
	;

	new Firebase(this.config.firebaseUrl + "/users/" + username + "/contacts/" + this.username)
		.transaction(function (current_value) {
			if (current_value === "sent") {
				return true;
			} else {
				return current_value;
			}
		})
	;
};

/**
 * Remove a contact from the contact list
 * @param {string} username - the username of the contact to remove
 */
Chat.prototype.removeContact = function(username) {
	this.userRef
		.child('contacts')
		.child(username)
		.set(null)
	;

	new Firebase(this.config.firebaseUrl + "/users/" + username + "/contacts/" + this.username)
		.set(null)
	;
};

/////////////////////////////////////////////////////////
// Room management methods

/**
 * Join a chat room
 * @param {string} roomId - id of the room to join
 */
Chat.prototype.joinRoom = function(roomId) {
	var self = this;

	// Leave current room
	this.leaveCurrentRoom();

	if (this.authenticated) {
		// Join a new room
		this.roomRef = new Firebase(this.config.firebaseUrl + "/rooms/" + roomId);
		this.roomRef.child('messages').limit(100).on('child_added', function (snapshot) {
			self.trigger('gotChatMessage', snapshot.val());
		});

        this.roomRef.child('users').on('child_added',
            this.handleRoomContactAdded.bind(this));
        this.roomRef.child('users').on('child_removed',
            this.handleRoomContactRemoved.bind(this));

        this.roomRef.child('type').on('value', function (snapshot) {
        	self.trigger('joinedRoom', roomId, snapshot.val());
        });
	} else {
		// Not connected to Firebase yet
		// Add this job to the queue
		this.queue.push({
			type: 'room',
			roomId: roomId
		});
	}
};

/**
 * Join a one-contact room
 * @param {string} username - the username of the contact to join a room with
 */
Chat.prototype.joinContactRoom = function(username) {
	if (this.authenticated) {
		this.joinRoom(this.getRoomNameWith(username));
	} else {
		// Not connected to Firebase yet
		// Add this job to the queue
		this.queue.push({
			type: 'contactRoom',
			username: username
		});
	}
};

/**
 * Create a new multiple-contact room
 * @param {string} name - the name of the new room
 */
Chat.prototype.createRoom = function(name) {
	var roomData = {
		name: name,
		type: 'multipleContactRoom',
		users: {}
	};
	roomData.users[this.username] = true;

	var newRoomRef = new Firebase(this.config.firebaseUrl + "/rooms").push();
	newRoomRef.set(roomData);

	this.userRef.child('rooms').child(newRoomRef.name()).set(true);
};

/**
 * Send a message to the current room
 * @param {string} message
 */
Chat.prototype.sendToRoom = function(message) {
	if (this.roomRef) {
		this.roomRef.child('messages').push().setWithPriority({
			data: message,
			from: this.username,
			time: Firebase.ServerValue.TIMESTAMP
		}, Firebase.ServerValue.TIMESTAMP);
	} else {
		console.warn('Tried to send message when no room is joined');
	}
};

/**
 * Leave the current room
 * @fires Chatly#event:leftRoom
 */
Chat.prototype.leaveCurrentRoom = function() {
	if (this.roomRef) {
		this.roomRef.child('messages').off();
        this.roomRef.child('contacts').off();
		this.roomRef.off();
		this.roomRef = null;
	}

    for (var username in this.roomUsers) {
        if (this.roomUsers.hasOwnProperty(username)) {
            this.roomUsers[username].stop();
            delete this.roomUsers[username];
        }
    }

	this.trigger('leftRoom');
};

/**
 * Leave the current room and remove it from the user's room list.
 */
Chat.prototype.removeCurrentRoom = function() {
	var roomId  = this.roomRef.name();
	var roomRef = this.roomRef;

	this.leaveCurrentRoom();

	this.userRef.child('rooms').child(roomId)
		.set(null);
	roomRef.child('users').child(this.username)
		.set(null);
	roomRef = null;
};

/////////////////////////////////////////////////////////
// Room contact methods

Chat.prototype.addContactToRoom = function(username) {
	this.roomRef
		.child('users').child(username)
		.set(true);

	new Firebase(this.config.firebaseUrl + "/users/" + username + "/rooms/" + 
		this.roomRef.name()).set(true);
};

/////////////////////////////////////////////////////////
// Chat event handlers

/**
 * Handle authentication success.
 * Subscribes to contact add/remove/change events, room add/remove/change events and
 * changes the current user's login state to 'true'.
 */
Chat.prototype.handleAuthSuccess = function() {
	var self = this;

	this.connectedRef.on('value', function(snapshot) {
		if (snapshot.val() === true) {
			console.log("Connected to Firebase...");

			// On disconnect
			self.userRef.child('loggedIn').onDisconnect().set(null);

			// Set login state
			self.userRef.child('loggedIn').set(true);

			// Contact handlers
			self.userRef.child('contacts').on('child_added',
				self.handleContactAdded.bind(self));
			self.userRef.child('contacts').on('child_removed',
				self.handleContactRemoved.bind(self));

			// Room handlers
			self.userRef.child('rooms').on('child_added',
				self.handleRoomAdded.bind(self));
			self.userRef.child('rooms').on('child_removed',
				self.handleRoomRemoved.bind(self));

			// Do jobs in queue
			self.runQueuedJobs.bind(self).call();
		}
	});
};

/**
 * Handle the 'gotToken' event
 * @param {object} response - the parsed response from the server
 */
Chat.prototype.handleGotToken = function(response) {
	this.username = response.username;
	this.token = response.token;

	this.connect();
};

/**
 * Handle a send friend request event
 * @param {string} username - the name of the user to send the friend request to
 */
Chat.prototype.handleSendFriendRequest = function(username) {
    this.userRef
        .child('contacts')
        .child(username)
        .transaction(function (current_value) {
            if (current_value === null || current_value === undefined) {
                return "sent";
            } else {
                return current_value;
            }
        })
    ;

    new Firebase(this.config.firebaseUrl + "/users/" + username + "/contacts/" + this.username)
        .transaction(function (current_value) {
            if (current_value === null  || current_value === undefined) {
                return false;
            } else {
                return current_value;
            }
        })
    ;
};

/////////////////////////////////////////////////////////
// Firebase event handlers

/**
 * Handle a new contact added event
 * @param snapshot - the Firebase snapshot of the new contact
 */
Chat.prototype.handleContactAdded = function(snapshot) {
	var newContact = new Contact({
		parent: this,
		username: snapshot.name(),
		contactRef: snapshot.ref()
	});

	this.contacts[snapshot.name()] = newContact;
	this.trigger('contactAdded', newContact);
};

/**
 * Handle a contact removed event
 * @param snapshot - the Firebase snapshot of the removed contact
 */
Chat.prototype.handleContactRemoved = function(snapshot) {
	var contact = this.contacts[snapshot.name()];
	delete this.contacts[snapshot.name()];
	contact.stop();
	contact.trigger('removed');
};

/**
 * Handle a new room contact added event
 * @param snapshot - the Firebase snapshot of the new contact
 */
Chat.prototype.handleRoomContactAdded = function(snapshot) {
    if (snapshot.name() !== this.username) {
    	var ref = this.userRef.child('contacts').child(snapshot.name());

        var newContact = new Contact({
            parent: this,
            username: snapshot.name(),
            contactRef: ref
        });

        this.roomUsers[snapshot.name()] = newContact;
        this.trigger('roomContactAdded', newContact);
    }
};

/**
 * Handle a room contact removed event
 * @param snapshot - the Firebase snapshot of the removed contact
 */
Chat.prototype.handleRoomContactRemoved = function(snapshot) {
    var contact = this.roomUsers[snapshot.name()];
    delete this.roomUsers[snapshot.name()];
    contact.stop();
    contact.trigger('removed');
};

/**
 * Handle a new room added event
 * @param snapshot - the Firebase snapshot of the room added
 */
Chat.prototype.handleRoomAdded = function(snapshot) {
	var newUserRoom = new UserRoom({
		parent: this,
		roomId: snapshot.name()
	});

	this.userRooms[snapshot.name()] = newUserRoom;

	this.trigger('roomAdded', newUserRoom);
};

/**
 * Handle a room removed event
 * @param snapshot - the Firebase snapshot of the room removed
 */
Chat.prototype.handleRoomRemoved = function(snapshot) {
	var room = this.userRooms[snapshot.name()];
	delete this.userRooms[snapshot.name()];
	room.stop();
	room.trigger('removed');
};
