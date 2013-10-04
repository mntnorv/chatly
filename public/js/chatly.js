
(function (chatly, $, undefined) {

	/////////////////////////////////////////////////////////
	// Chat

	// Create a chat object
	var chat = new Chat();

	// Set chat callbacks
	chat.on('contactAdded',   handleContactAdded);
	chat.on('roomAdded',      handleRoomAdded);
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

	// Get the hash as an object
	function getDeparamedHash() {
		return $.deparam(window.location.hash.substring(1));
	}

	// Handles the hash change event
	var handleHashChange = function () {
		$('#contact-list > .active')
			.removeClass('active');
		$('#chat-rooms > .active')
			.removeClass('active');

		if (window.location.hash) {
			var hashObject = getDeparamedHash();

			if (hashObject.room) {
				chat.joinRoom(hashObject.room);
				$('#contact-list > [data-room="' + hashObject.room + '"]')
					.addClass('active');
				$('#chat-rooms > [data-room="' + hashObject.room + '"]')
					.addClass('active');
			}
		} else {
			chat.leaveCurrentRoom();
		}
	}

	// Set the hash change event handler
	window.onhashchange = handleHashChange;
	// Fire the event to handle the current hash
	handleHashChange();

	/////////////////////////////////////////////////////////
	// Sidebar-form-specific functions

	// Init a sidebar form with one input
	function initSidebarForm(formSelector, inputSelector) {
		var formElem = $(formSelector);
		var inputElem = formElem.children(inputSelector);

		// Focus the input when form shown
		formElem.on('shown.bs.collapse', function () {
			inputElem.focus();
		});

		// Clear input and remove errors when form hidden
		formElem.on('hide.bs.collapse', function () {
			inputElem.val('');

			if (inputElem.is(':focus')) {
				inputElem.blur();
			}

			removeFormErrors(formElem);
		});

		// Hide the form when input lost focus
		inputElem.focusout(function () {
			formElem.collapse('hide');
		});
	}

	// Initialize the sidebar forms
	$(window).load(function() {
		initSidebarForm('#add-contact-form', '[name="username"]');
		initSidebarForm('#create-room-form', '[name="roomname"]');
	});

	// Submit the add contact form
	chatly.submitAddContact = function (form) {
		var newContactUsername = form.children('[name="username"]').val();

		var handleAddContactSuccess = function () {
			form.collapse('hide');
		}

		var handleAddContactFailed = function (message) {
			setInputError(form.children('[name="username"]'), message);
		}

		chat.sendFriendRequest(
			newContactUsername,
			handleAddContactSuccess,
			handleAddContactFailed
		);
	};

	// Submit the create room form
	chatly.submitCreateRoom = function (form) {
		var newRoomName = form.children('[name="roomname"]').val();

		if (newRoomName) {
			form.collapse('hide');
			chat.createRoom(newRoomName);
		} else {
			setInputError(
				form.children('[name="roomname"]'),
				'Room name cannot be empty'
			);
		}
	}

	// Adds a div containing an error after the specified input
	// and adds a parsley-error class to the input
	function setInputError (input, error) {
		input.addClass('parsley-error');
		input.after(
			$('<div class="parsley-error-list"></div>').html(
				$('<li></li>').append(
					document.createTextNode(error)
				)
			)
		);
	}

	// Removes all errors in a form
	function removeFormErrors (form) {
		form.find('.parsley-error').removeClass('parsley-error');
		form.find('.parsley-error-list').remove();
	}

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

		// Highlight current room
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

	// Add a new room to HTML
	function handleRoomAdded(newRoom) {
		// Create the room's HTML element
		var roomElem = $('<a class="item"></a>')
			.attr({
				href       : '#' + $.param({room: newRoom.roomId}),
				'data-room': newRoom.roomId
			})
		;

		// Highlight current room
		var currentRoom = getDeparamedHash().room;
		if (newRoom.roomId === currentRoom) {
			roomElem.addClass('active');
		}

		// Change the room name
		var handleRoomNameChange = function (name) {
			roomElem.html(document.createTextNode(name));
		};

		// Remove room from HTML and leave if currently
		// in the room being removed
		var handleRoomRemoved = function () {
			if (newRoom.roomId === getDeparamedHash().room) {
				window.location.hash = "";
			}

			roomElem.remove();
		};

		// Set new room handlers
		newRoom.on('nameChanged', handleRoomNameChange);
		newRoom.on('removed',     handleRoomRemoved);

		// Add new contact element to HTML
		$('#chat-rooms').append(roomElem);
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
