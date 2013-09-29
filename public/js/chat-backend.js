
/////////////////////////////////////////////////////////
// Chat

// Chat object constructor
function Chat(opts) {
	// Define options as an empty object if opts is null
	var options = opts || {};

	// Default configuration
	var config = this.config = {
	};

	// Set config from options
	for (item in options) {
		this.config[item] = options[item];
	}

	// Contact array
	this.contacts = {};

	// Firebase connection reference
	this.connectedRef = new Firebase(Chat.getFirebaseUrl() + "/.info/connected");

	// Set callbacks
	this.on('gotUsername', this.handleGotUsername.bind(this));
}

// Add event functionality to Chat
asEvented.call(Chat.prototype);

// Get the Firebase URL
Chat.getFirebaseUrl = function() {
	return "https://chatly.firebaseio.com";
}

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

	this.userRef = new Firebase(Chat.getFirebaseUrl() + "/users/" + username);

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

	new Firebase(Chat.getFirebaseUrl() + "/users/" + username + "/contacts/" + this.username)
		.transaction(function (current_value) {
			if (current_value == "sent") {
				return true;
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

	new Firebase(Chat.getFirebaseUrl() + "/users/" + username + "/contacts/" + this.username)
		.set(null)
	;
};

// Join a chat room
Chat.prototype.joinRoom = function(roomName) {
	this.leaveCurrentRoom();

	this.roomRef = new Firebase(Chat.getFirebaseUrl() + "/rooms/" + roomName);
	this.roomRef.on('child_added', function (snapshot) {
		this.trigger('gotChatMessage', snapshot.val());
	});

	this.trigger('joinedRoom', roomName);
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

	new Firebase(Chat.getFirebaseUrl() + "/users/" + username + "/contacts/" + this.username)
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

	// Generate a unique room name known to both of the contacts
	this.roomName = (this.username < this.parent.username) ?
		this.username + "-" + this.parent.username :
		this.parent.username + "-" + this.username;

	this.contactRef = opts.contactRef;
	this.contactRef.on('value', this.handleConfirmationStateChange.bind(this));

	this.connectionRef = new Firebase(Chat.getFirebaseUrl() + "/users/" + this.username + "/loggedIn");
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
