
// Chat constructor
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

	// Firebase connection reference
	this.connectedRef = new Firebase("https://chatly.firebaseio.com/.info/connected");

	// Set callbacks
	this.on('gotUsername', this.handleGotUsername.bind(this));
}

// Add event functionality to WebRTC
asEvented.call(Chat.prototype);

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

	this.userRef = new Firebase("https://chatly.firebaseio.com/users/" + username);

	this.connectedRef.on('value', function(snapshot) {
		if (snapshot.val() === true) {
			console.log("Connected to Firebase...");

			// On disconnect
			self.userRef.child('loggedIn').set(null);

			// Join room
			self.userRef.child('loggedIn').set(true);
		}
	});
};

// Event handlers
Chat.prototype.handleGotUsername = function(username) {
	this.connect(username);
};
