
/////////////////////////////////////////////////////////
// Add-contact-form-specific functions
$(window).load(function() {
	var addContactForm = $('#add-contact-form');
	var usernameInput = addContactForm.children('input:first');

	// Focus the input when form shown
	addContactForm.on('shown.bs.collapse', function () {
		usernameInput.focus();
	});

	// Clear input and remove errors when form hidden
	addContactForm.on('hidden.bs.collapse', function () {
		usernameInput
			.val('')
			.removeClass('parsley-error')
			.blur();

		addContactForm.children('.parsley-error-list').html('');
	});

	// Hide the form when input lost focus
	usernameInput.focusout(function () {
		addContactForm.collapse('hide');
	});
});

function submitAddContact(form) {
	var newContactUsername = form.children('input:first').val();

	var handleAddContactSuccess = function () {
		form.collapse('hide');
	}

	var handleAddContactFailed = function (message) {
		form.children('input:first').addClass('parsley-error');
		form.children('.parsley-error-list')
			.html($('<li></li>')
				.append(document.createTextNode(message))
			)
		;
	}

	chat.sendFriendRequest(
		newContactUsername,
		handleAddContactSuccess,
		handleAddContactFailed
	);
}

/////////////////////////////////////////////////////////
// Chat

// Create a chat object
var chat = new Chat();
chat.start();

// Set chat callbacks
chat.on('contactAdded', handleContactAdded);

/////////////////////////////////////////////////////////
// Chat callback handlers

function handleContactAdded(newContact) {
	// Create a new contact element
	var contactStatus = $('<span class="glyphicon glyphicon-question-sign status-offline"></span>');
	
	var contactElem = $('<a class="item" href="#"></a>')
		.append(contactStatus)
		.append(document.createTextNode(" " + newContact.username))
	;

	var confirmElements = $('<span class="pull-right"></span>')
		.append($('<a href="#">Confirm</a>')
			.attr({onclick: 'chat.confirmFriendRequest("' + newContact.username + '");'})
		)
		.append(document.createTextNode('/'))
		.append($('<a href="#">Decline</a>')
			.attr({onclick: 'chat.removeContact("' + newContact.username + '");'})
		)
	;

	// Handle contact state change
	var handleStateChange = function (loggedIn, confirmed) {
		handleContactStateChanged({
			loggedIn: loggedIn,
			confirmed: confirmed,
			statusElem: contactStatus,
			confirmElem: confirmElements,
			contactElem: contactElem
		});
	};

	// Handle contact removal
	var handleContactRemoved = function () {
		contactElem.remove();
	};

	// Add new contact element to HTML
	$('#contact-list').append(contactElem);

	// Set contact event handlers
	newContact.on('stateChanged', handleStateChange);
	newContact.on('removed', handleContactRemoved);

	// Set first state
	handleContactStateChanged({
		loggedIn: newContact.isLoggedIn,
		confirmed: newContact.confirmationState,
		statusElem: contactStatus,
		confirmElem: confirmElements,
		contactElem: contactElem
	});
}

function handleContactStateChanged(opts) {
	var statusElem  = opts.statusElem;
	var confirmElem = opts.confirmElem;
	var contactElem = opts.contactElem;
	var loggedIn = opts.loggedIn;
	var confirmed = opts.confirmed;

	if (confirmed === true) {
		confirmElem.remove();
		if (loggedIn) {
			statusElem.attr({class: "glyphicon glyphicon-ok-sign status-online"});
		} else {
			statusElem.attr({class: "glyphicon glyphicon-minus-sign status-offline"});
		}
	} else if (confirmed === false) {
		statusElem.attr({class: "glyphicon glyphicon-question-sign status-unknown"});
		contactElem.append(confirmElem);
	} else if (confirmed === "sent") {
		confirmElem.remove();
		statusElem.attr({class: "glyphicon glyphicon-question-sign status-offline"});
	}
}
