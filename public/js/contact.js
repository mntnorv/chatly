
/////////////////////////////////////////////////////////
// Contact

/**
 * The Contact constructor
 * @param {object} opts - options
 * @param {string} opts.username - username of the contact
 * @param {Chat} opts.parent - the parent object
 * @param opts.contactRef - a Firebase reference to this contact in the contact list
 * @constructor
 */
function Contact(opts) {
	this.username = opts.username;
	this.parent = opts.parent;

	this.loggedIn = false;

	this.contactRef = opts.contactRef;
	this.contactRef.on('value', this.handleConfirmationStateChange.bind(this));
}

// Add event functionality to Contact
asEvented.call(Contact.prototype);

/////////////////////////////////////////////////////////
// Contact methods

/**
 * Remove all events from this contact.
 * This must be called if this Contact is no longer used.
 */
Contact.prototype.stop = function() {
	this.contactRef.off();
	this.contactRef = null;

    if (this.connectionRef) {
        this.connectionRef.off();
        this.connectionRef = null;
    }
};

/////////////////////////////////////////////////////////
// Contact event handlers

/**
 * Handle this contact's login state change
 * @param snapshot - a Firebase snapshot to the new login state
 */
Contact.prototype.handleLoginStateChange = function(snapshot) {
	this.isLoggedIn = (snapshot.val() === true);
	this.trigger('stateChanged', this.isLoggedIn, this.confirmationState);
};

/**
 * Handle this contact's confirmation state change
 * @param snapshot - a Firebase snapshot of the new confirmation state
 */
Contact.prototype.handleConfirmationStateChange = function(snapshot) {
	this.state = snapshot.val();

	if (this.state === true) {
		this.connectionRef = new Firebase(this.parent.config.firebaseUrl
			+ "/users/" + this.username + "/loggedIn");
		this.connectionRef.on('value', this.handleLoginStateChange.bind(this));
	}

	this.trigger('stateChanged');
};
