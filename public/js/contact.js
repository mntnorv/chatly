
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
