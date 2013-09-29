
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

	// Firebase connection reference
	this.connectedRef = new Firebase(this.config.firebaseUrl + "/.info/connected");

	// Set callbacks
	this.on('gotUsername', this.handleGotUsername.bind(this));
}

// Add event functionality to Chat
asEvented.call(Chat.prototype);

/////////////////////////////////////////////////////////
// Chat prototype methods

// Starts the chat
Chat.prototype.start = function() {
	this.getUsername();
};

// Get the username
Chat.prototype.getUsername = function() {
	var self = this;
	$.ajax("/user/getusername.php")
		.done(function (response) {
			if (response.username) {
				self.trigger("gotUsername", response.username);
			}
		})
		.fail(function() {
			alert("Error: unable to get your username.");
		});
};

// Connect to the chat server
Chat.prototype.connect = function(username) {
	var self = this;

	this.userRef = new Firebase(this.config.firebaseUrl + "/users/" + username);

	this.connectedRef.on('value', function(snapshot) {
		if (snapshot.val() === true) {
			console.log("Connected to Firebase...");

			// On disconnect
			self.userRef.child('loggedIn').onDisconnect().set(null);

			// Join room
			self.userRef.child('loggedIn').set(true);

			// Contact handlers
			self.userRef.child('contacts').on('child_added', self.handleContactAdded.bind(self));
			self.userRef.child('contacts').on('child_removed', self.handleContactRemoved.bind(self));
		}
	});
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
			if (current_value == "sent") {
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
Chat.prototype.joinRoom = function(roomName) {
	var self = this;
	this.leaveCurrentRoom();

	this.roomRef = new Firebase(this.config.firebaseUrl + "/rooms/" + roomName);
	this.roomRef.limit(100).on('child_added', function (snapshot) {
		self.trigger('gotChatMessage', snapshot.val());
	});

	this.trigger('joinedRoom', roomName);
};

Chat.prototype.sendToRoom = function(message) {
	if (this.roomRef) {
		this.roomRef.push().setWithPriority({
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
		this.roomRef.off();
		this.roomRef = null;
	}

	this.trigger('leftRoom');
};

/////////////////////////////////////////////////////////
// Chat event handlers

// Event handlers
Chat.prototype.handleGotUsername = function(username) {
	this.username = username;
	this.connect(username);
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
// Contact

// Contact constructor
function Contact(opts) {
	this.username = opts.username;
	this.parent = opts.parent;

	this.loggedIn = false;

	this.contactRef = opts.contactRef;
	this.contactRef.on('value', this.handleConfirmationStateChange.bind(this));

	this.connectionRef = new Firebase(this.parent.config.firebaseUrl + "/users/" + this.username + "/loggedIn");
	this.connectionRef.on('value', this.handleLoginStateChange.bind(this));
}

// Add event functionality to Contact
asEvented.call(Contact.prototype);

/////////////////////////////////////////////////////////
// Contact methods

Contact.prototype.stop = function() {
	this.contactRef.off();
	this.connectionRef.off();
	this.contactRef = null;
	this.connectionRef = null;
};

/////////////////////////////////////////////////////////
// Contact event handlers
Contact.prototype.handleLoginStateChange = function(snapshot) {
	this.isLoggedIn = (snapshot.val() === true);
	this.trigger('stateChanged', this.isLoggedIn, this.confirmationState);
};

Contact.prototype.handleConfirmationStateChange = function(snapshot) {
	this.confirmationState = snapshot.val();
	this.trigger('stateChanged', this.isLoggedIn, this.confirmationState);
};
