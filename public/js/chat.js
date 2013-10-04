
/////////////////////////////////////////////////////////
// Chat

// Chat object constructor
function Chat(opts) {
	// Define options as an empty object if opts is null
	var options = opts || {};

	// Default configuration
	var config = this.config = {
		firebaseUrl: "https://chatly.firebaseio.com"
	};

	// Set config from options
	for (item in options) {
		this.config[item] = options[item];
	}

	// Contact array
	this.contacts = {};

	// User room array
	this.userRooms = {};

	// Create a new job queue
	this.queue = [];

	// Firebase connection reference
	this.connectedRef = new Firebase(this.config.firebaseUrl + "/.info/connected");

	// Set callbacks
	this.on('gotToken', this.handleGotToken.bind(this));
}

// Add event functionality to Chat
asEvented.call(Chat.prototype);

/////////////////////////////////////////////////////////
// Chat prototype methods

// Starts the chat
Chat.prototype.start = function() {
	this.getUserToken();
};

// Get the username
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

// Connect to the chat server
Chat.prototype.connect = function(username) {
	var self = this;

	this.userRef = new Firebase(this.config.firebaseUrl + "/users/"
		+ this.username);

	this.userRef.auth(this.token, function (error, result) {
		if (error) {
			console.error('Error: unable to login: ' + error);
		} else {
			console.log('Expires at: ' + new Date(result.expires * 1000))
			self.handleAuthSuccess.bind(self).call();
		}
	});
};

// Runs all of the queued jobs
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

// Send a friend request
Chat.prototype.sendFriendRequest = function(username, success, failure) {
	var handleResponse = function (data) {
		if (data.success === true) {
			this.handleSendFriendRequest(username);
			
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
		handleResponse.bind(this)
	);
};

// Confirm a friend request
Chat.prototype.confirmFriendRequest = function(username) {
	var roomName = new Firebase(this.config.firebaseUrl + "/rooms").push().name();

	this.userRef
		.child('contacts')
		.child(username)
		.transaction(function (current_value) {
			if (current_value === false) {
				return roomName;
			} else {
				return current_value;
			}
		})
	;

	new Firebase(this.config.firebaseUrl + "/users/" + username + "/contacts/" + this.username)
		.transaction(function (current_value) {
			if (current_value === "sent") {
				return roomName;
			} else {
				return current_value;
			}
		})
	;
};

// Remove a contact / decline a friend request
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

// Join a chat room
Chat.prototype.joinRoom = function(roomId) {
	var self = this;

	// Leave current room
	this.leaveCurrentRoom();

	if (this.userRef) {
		// Join a new room
		this.roomRef = new Firebase(this.config.firebaseUrl + "/rooms/" + roomId);
		this.roomRef.child('messages').limit(100).on('child_added', function (snapshot) {
			self.trigger('gotChatMessage', snapshot.val());
		});

		this.trigger('joinedRoom', roomId);
	} else {
		// Not connected to Firebase yet
		// Add this job to the queue
		this.queue.push({
			type: 'room',
			roomId: roomId
		});
	}
};

// Join a contact chat room
Chat.prototype.joinContactRoom = function(username) {
	var self = this;

	// Leave current room
	this.leaveCurrentRoom();

	if (this.userRef) {
		// Get the roomId associated wih the specified contact
		this.userRef.child('contacts').child(username).once('value', function (snapshot) {
			// Check if the contact is in the contact list
			if (snapshot.val() && snapshot.val() !== "sent") {
				// Finally, join the room
				self.joinRoom(snapshot.val());
			}
		});
	} else {
		// Not connected to Firebase yet
		// Add this job to the queue
		this.queue.push({
			type: 'contactRoom',
			username: username
		});
	}
};

// Create a new chat room
Chat.prototype.createRoom = function(name) {
	var roomData = {
		name: name,
		users: {}
	};
	roomData.users[this.username] = true;

	var newRoomRef = new Firebase(this.config.firebaseUrl + "/rooms").push();
	newRoomRef.set(roomData);

	this.userRef.child('rooms').child(newRoomRef.name()).set(true);
};

// Send a message to the specified room
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

// Leave current chat room if a room is joined
Chat.prototype.leaveCurrentRoom = function() {
	if (this.roomRef) {
		this.roomRef.child('messages').off();
		this.roomRef.off();
		this.roomRef = null;
	}

	this.trigger('leftRoom');
};

/////////////////////////////////////////////////////////
// Chat event handlers

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

// Event handlers
Chat.prototype.handleGotToken = function(response) {
	this.username = response.username;
	this.token = response.token;

	this.connect();
};

Chat.prototype.handleContactAdded = function(snapshot) {
	var newContact = new Contact({
		parent: this,
		username: snapshot.name(),
		contactRef: snapshot.ref()
	});

	this.contacts[snapshot.name()] = newContact;

	this.trigger('contactAdded', newContact);
};

Chat.prototype.handleContactRemoved = function(snapshot) {
	var contact = this.contacts[snapshot.name()];
	delete this.contacts[snapshot.name()];
	contact.stop();
	contact.trigger('removed');
};

Chat.prototype.handleRoomAdded = function(snapshot) {
	var newUserRoom = new UserRoom({
		parent: this,
		roomId: snapshot.name()
	});

	this.userRooms[snapshot.name()] = newUserRoom;

	this.trigger('roomAdded', newUserRoom);
};

Chat.prototype.handleRoomRemoved = function(snapshot) {
	var room = this.userRooms[snapshot.name()];
	delete this.userRooms[snapshot.name()];
	room.stop();
	room.trigger('removed');
};

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
