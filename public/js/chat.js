
(function (chatly, $, undefined) {

	/////////////////////////////////////////////////////////
	// Chat

	// Create a chat object
	var chat = new Chat();

	// Set chat callbacks
	chat.on('contactAdded',   handleContactAdded);
	chat.on('leftRoom',       handleLeftRoom);
	chat.on('gotChatMessage', handleChatMessage);

	// Start the chat engine!
	chat.start();

	// The last message in the room was sent by this user
	var lastUsername;

	/////////////////////////////////////////////////////////
	// Chat method proxies
	chatly.confirmRequest = chat.confirmFriendRequest.bind(chat);
	chatly.removeContact  = chat.removeContact.bind(chat);

	/////////////////////////////////////////////////////////
	// URL hash change handling
	function getDeparamedHash() {
		return $.deparam(window.location.hash.substring(1));
	}

	var handleHashChange = function () {
		$('#contact-list > .active')
			.removeClass('active');

		if (window.location.hash) {
			var hashObject = getDeparamedHash();

			if (hashObject.room) {
				chat.joinRoom(hashObject.room);
				$('#contact-list > [data-room="' + hashObject.room + '"]')
					.addClass('active');
			}
		} else {
			chat.leaveCurrentRoom();
		}
	}

	window.onhashchange = handleHashChange;
	handleHashChange();

	/////////////////////////////////////////////////////////
	// Add-contact-form-specific functions

	$(window).load(function() {
		var addContactForm = $('#add-contact-form');
		var usernameInput = addContactForm.children('[name="username"]');

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

	// Submit the add contact form
	chatly.submitAddContact = function (form) {
		var newContactUsername = form.children('[name="username"]').val();

		var handleAddContactSuccess = function () {
			form.collapse('hide');
		}

		var handleAddContactFailed = function (message) {
			form.children('[name="username"]').addClass('parsley-error');
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
	};

	/////////////////////////////////////////////////////////
	// Chat input specific functions
	chatly.submitChatMessage = function (form) {
		var inputElem = form.find('[name="message"]');
		var message = inputElem.val();
		inputElem.val('');
		chat.sendToRoom(message);
	};

	/////////////////////////////////////////////////////////
	// Chat callback handlers

	// Add a new contact to the HTML
	function handleContactAdded(newContact) {
		// Create a new contact element
		var contactStatus = $('<span class="glyphicon glyphicon-question-sign status-offline"></span>');
		
		var contactElem = $('<a class="item"></a>')
			.append(contactStatus)
			.append(document.createTextNode(" " + newContact.username))
		;

		var confirmElements = $('<span class="pull-right"></span>')
			.append($('<a>Confirm</a>')
				.attr({
					onclick: 'chatly.confirmRequest("' + newContact.username + '");'
				})
			)
			.append(document.createTextNode('/'))
			.append($('<a>Decline</a>')
				.attr({
					onclick: 'chatly.removeContact("' + newContact.username + '");'
				})
			)
		;

		var currentRoom = getDeparamedHash().room;
		if (newContact.confirmationState === currentRoom) {
			contactElem.addClass('active');
		}

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

	// Change the contact's appearance on a state change
	function handleContactStateChanged(opts) {
		var statusElem  = opts.statusElem;
		var confirmElem = opts.confirmElem;
		var contactElem = opts.contactElem;
		var loggedIn    = opts.loggedIn;
		var confirmed   = opts.confirmed;

		if (confirmed === "sent") {
			confirmElem.remove();
			statusElem.attr({class: "glyphicon glyphicon-question-sign status-offline"});
		} else if (confirmed === false) {
			statusElem.attr({class: "glyphicon glyphicon-question-sign status-unknown"});
			contactElem.append(confirmElem);
		} else if (confirmed) {
			confirmElem.remove();
			contactElem.attr({
				href       : '#' + $.param({room: confirmed}),
				'data-room': confirmed
			});

			if (loggedIn) {
				statusElem.attr({class: "glyphicon glyphicon-ok-sign status-online"});
			} else {
				statusElem.attr({class: "glyphicon glyphicon-minus-sign status-offline"});
			}
		}
	}

	// Add a new chat message to HTML
	function handleChatMessage(message) {
		// Get chat log container
		var chatLog = $('#chat-log');

		// Append the sender's username to the chat log if there were no chat
		// messages before or the last message was from another user
		var appendUsername = false;
		if (lastUsername) {
			if (lastUsername !== message.from) {
				appendUsername = true;
			}
		} else {
			appendUsername = true;
		}

		if (appendUsername) {
			lastUsername = message.from;

			// Create the username element
			var usernameElem = $('<p class="chat-log-username"></p>')
				.attr({'data-username': message.from})
				.append(document.createTextNode(message.from));

			// Append the username element to the chat log
			chatLog.append(usernameElem);
		}

		// Create the message element
		var timeElem = $('<p class="chat-message-time pull-right"></p>')
			.append(document.createTextNode(new Date(message.time).format('H:i')));

		var messageElem = $('<p class="chat-message-text"></p>')
			.append(document.createTextNode(message.data));

		var messageDivElem = $('<div class="chat-message"></div>')
			.append(timeElem)
			.append(messageElem);

		// Append the message element to the chat log
		chatLog.append(messageDivElem);
	}

	// Clear all messages from the chat log
	function handleLeftRoom() {
		$('#chat-log').html('');
		lastUsername = null;
	}

}(window.chatly = window.chatly || {}, jQuery));
