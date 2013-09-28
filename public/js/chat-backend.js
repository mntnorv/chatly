
var chatlyRef = new Firebase("https://chatly.firebaseio.com/");

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
	this.connectedRef = chatlyRef.child(".info/connected");

	// Set callbacks
	this.on('gotUsername', this.handleGotUsername.bind(this));
}

// Add event functionality to Chat
asEvented.call(Chat.prototype);

/////////////////////////////////////////////////////////
// Chat methods

// Starts the chat
Chat.prototype.start = function() {
	this.getUsername();
};

// Get the username
Chat.prototype.getUsername = function() {
	var self = this;
	$.ajax("/user/getusername.php")
		.done(function (response) {
			if (response.username !== null) {
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

	this.userRef = chatlyRef.child("users").child(username);

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
			
			if (success !== null) {
				success();
			}
		} else {
			if (failure !== null) {
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

	chatlyRef
		.child('users')
		.child(username)
		.child('contacts')
		.child(this.username)
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

	chatlyRef
		.child('users')
		.child(username)
		.child('contacts')
		.child(this.username)
		.set(null)
	;
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
		username: snapshot.name(),
		contactRef: snapshot.ref()
	});

	this.contacts[snapshot.name()] = newContact;

	this.trigger('contactAdded', newContact);
};

Chat.prototype.handleContactRemoved = function(snapshot) {
	var contact = this.contacts[snapshot.name()];
	delete this.contacts[snapshot.name()];
	contact.trigger('removed');
};

Chat.prototype.handleSendFriendRequest = function(username) {
	this.userRef
		.child('contacts')
		.child(username)
		.transaction(function (current_value) {
			if (current_value === null) {
				return "sent";
			} else {
				return current_value;
			}
		})
	;

	chatlyRef
		.child('users')
		.child(username)
		.child('contacts')
		.child(this.username)
		.transaction(function (current_value) {
			console.log(current_value);
			if (current_value === null) {
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

	this.loggedIn = false;

	this.contactRef = opts.contactRef;
	this.contactRef.on('value', this.handleConfirmationStateChange.bind(this));

	this.connectionRef = chatlyRef.child('users').child(this.username).child('loggedIn');
	this.connectionRef.on('value', this.handleLoginStateChange.bind(this));
}

// Add event functionality to Contact
asEvented.call(Contact.prototype);

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
