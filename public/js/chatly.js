
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

    /**
     * Describes the current chat state
     * @property {string} lastUsername - name of the user the last message was received from
     * @property {string} currentRoom - the id of the current room
     * @property {string} currentContactRoom - name of the contact with which a one-contact room is joined
     */
	var state = {
		lastUsername: null,
		currentRoom: null,
		currentContactRoom: null
	};

	/////////////////////////////////////////////////////////
	// Chat method proxies
	chatly.confirmRequest = chat.confirmFriendRequest.bind(chat);
	chatly.removeContact  = chat.removeContact.bind(chat);

	/////////////////////////////////////////////////////////
	// URL hash change handling

    /**
     * Get the current hash, deparamed
     * @returns {object}
     */
	function getDeparamedHash() {
		return $.deparam(window.location.hash.substring(1));
	}

    /**
     * Handle the hash change event
     */
	var handleHashChange = function () {
		var contactList = $('#contact-list');
		var chatRooms = $('#chat-rooms');

		contactList.children('.active')
			.removeClass('active');

        chatRooms.children('a > a[data-toggle="modal"]')
            .remove();
		chatRooms.children('.active')
			.removeClass('active');

		var hashObject = getDeparamedHash();
		state.currentRoom = hashObject.room;
		state.currentContactRoom = hashObject.contact;

		if (state.currentRoom) {
			chat.joinRoom(state.currentRoom);
			chatRooms.children('[data-room="' + state.currentRoom + '"]')
				.addClass('active');
		} else if (state.currentContactRoom) {
			chat.joinContactRoom(state.currentContactRoom);
			contactList.children('[data-contact="' + state.currentContactRoom + '"]')
				.addClass('active');
		} else {
			chat.leaveCurrentRoom();
		}
	};

	// Set the hash change event handler
	window.onhashchange = handleHashChange;
	// Fire the event to handle the current hash
	handleHashChange();

	/////////////////////////////////////////////////////////
	// Sidebar-form-specific functions

    /**
     * Initialize a sidebar form with one input
     * @param {string} formSelector - selector of the form to initialize
     * @param {string} inputSelector - selector of the one input, relative to the form
     */
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

    /**
     * Submit the add contact form.
     * Sends a friend request.
     * @param form - the form to submit
     */
	chatly.submitAddContact = function (form) {
		var newContactUsername = form.children('[name="username"]').val();

		var handleAddContactSuccess = function () {
			form.collapse('hide');
		};

		var handleAddContactFailed = function (message) {
			setInputError(form.children('[name="username"]'), message);
		};

		chat.sendFriendRequest(
			newContactUsername,
			handleAddContactSuccess,
			handleAddContactFailed
		);
	};

    /**
     * Submit the create room form.
     * Creates a new room.
     * @param form - the form to submit
     */
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
	};

    /**
     * Set a validation error on an input.
     * Adds a div containing an error after the specified input and adds a parsley-error class
     * to the input
     * @param input - the input to add the error to
     * @param {string} error - the error message
     */
	function setInputError (input, error) {
		input.addClass('parsley-error');

		var errorElem = $('<li></li>').append(document.createTextNode(error));

		var errorListElem = input.next('.parsley-error-list');
		if (errorListElem.length > 0) {
			errorListElem.html('');
			errorListElem.append(errorElem);
		} else {
			errorListElem = $('<ul class="parsley-error-list"></ul>');
			errorListElem.append(errorElem);
			input.after(errorListElem);
		}
	}

    /**
     * Remove all validation errors from a form.
     * Removes all elements with the .parsley-error-list class and removes .parsley-error classes from
     * all of the inputs.
     * @param form - the form to remove errors from
     */
	function removeFormErrors (form) {
		form.find('.parsley-error').removeClass('parsley-error');
		form.find('.parsley-error-list').remove();
	}

	/////////////////////////////////////////////////////////
	// Add-contacts-to-room-modal-specific functions

    /**
     * Add a list of checkable contacts to HTML
     * @param {Contact[]} contactList - the list of contacts to add
     * @param container - the container to add the contacts to
     */
	function addContactsToModal(contactList, container) {
		for (var username in contactList) {
			if(contactList.hasOwnProperty(username)) {
				container.append(
                    chatly.createCheckableContactElement({username: username}).container
				);
			}
		}
	}

	$(window).load(function() {
		var contactsModal = $('#roomAddContactsModal');
        var contactContainer = contactsModal.find('.modal-contact-list');

		contactsModal.on('show.bs.modal', function() {
            var contacts = chat.getContacts();
		    addContactsToModal(contacts, contactContainer);
		});

		contactsModal.on('hidden.bs.modal', function() {
		    contactContainer.html('');
		});
	});

	/////////////////////////////////////////////////////////
	// Chat input specific functions

    /**
     * Submit the chat message form.
     * Sends the message to the current room.
     * @param form - the form to submit
     */
	chatly.submitChatMessage = function (form) {
		var inputElem = form.find('[name="message"]');
		var message = inputElem.val();
		inputElem.val('');
		chat.sendToRoom(message);
	};

	/////////////////////////////////////////////////////////
	// Chat callback handlers

    /**
     * Add a new contact to the sidebar contact list
     * @param {Contact} newContact - the contact to add
     */
	function handleContactAdded(newContact) {
		// Create a new contact element
        var contactElem = chatly.createContactElement({
            username: newContact.username
        });

		var confirmElem = chatly.createContactConfirmElements({
            username: newContact.username
        });

		// Highlight current room
		if (newContact.username === state.currentContactRoom) {
			contactElem.container.addClass('active');
		}

		// Handle contact state change
		var handleStateChange = function () {
			handleContactStateChanged({
				contact:     newContact,
				confirmElem: confirmElem,
				contactElem: contactElem
			});
		};

		// Handle contact removal
		var handleContactRemoved = function () {
			if (state.currentContactRoom === newContact.username) {
				window.location.hash = '';
			}
			contactElem.container.remove();
		};

		// Add new contact element to HTML
		$('#contact-list').append(contactElem.container);

		// Set contact event handlers
		newContact.on('stateChanged', handleStateChange);
		newContact.on('removed', handleContactRemoved);

		// Set first state
		handleStateChange();
	}

    /**
     * Change a contact's appearance according to the current state
     * @param {object} opts
     * @param {object} opts.confirmElem
     * @param {object} opts.confirmElem.container - the confirmation element
     * @param {object} opts.contactElem
     * @param {object} opts.contactElem.container - the contact element
     * @param {Contact} opts.contact - the contact to get the state from
     */
	function handleContactStateChanged(opts) {
		var confirmElem = opts.confirmElem;
		var contactElem = opts.contactElem;
		var contactObj  = opts.contact;

		if (contactObj.state === "sent") {
			confirmElem.container.remove();
            chatly.setContactState(contactElem.status, chatly.contactState.UNKNOWN);
		} else if (contactObj.state === false) {
            chatly.setContactState(contactElem.status, chatly.contactState.REQUEST);
			contactElem.append(confirmElem);
		} else if (contactObj.state === true) {
			confirmElem.container.remove();
			contactElem.container.attr({
				href          : '#' + $.param({contact: contactObj.username}),
				'data-contact': contactObj.username
			});

			if (contactObj.isLoggedIn) {
                chatly.setContactState(contactElem.status, chatly.contactState.ONLINE);
			} else {
                chatly.setContactState(contactElem.status, chatly.contactState.OFFLINE);
			}
		}
	}

    /**
     * Add a room to the sidebar room list
     * @param {UserRoom} newRoom - the room to add
     */
	function handleRoomAdded(newRoom) {
		// Create the room's HTML element
        var roomElem = chatly.createRoomElement({
            id: newRoom.roomId,
            name: '(loading)'
        });

		// Highlight current room
		var currentRoom = getDeparamedHash().room;
		if (newRoom.roomId === currentRoom) {
			roomElem.container.addClass('active');
		}

		// Change the room name
		var handleRoomNameChange = function (name) {
			roomElem.name.html(document.createTextNode(name));
		};

		// Remove room from HTML and leave if currently
		// in the room being removed
		var handleRoomRemoved = function () {
			if (newRoom.roomId === state.currentRoom) {
				window.location.hash = "";
			}

			roomElem.container.remove();
		};

		// Set new room handlers
		newRoom.on('nameChanged', handleRoomNameChange);
		newRoom.on('removed',     handleRoomRemoved);

		// Add new contact element to HTML
		$('#chat-rooms').append(roomElem.container);
	}

    /**
     * Add a new message to the main chat window
     * @param {object} message
     * @param {string} message.data - the message string
     * @param {string} message.from - the name of the sender
     * @param {number} message.time - the time this message was sent
     */
	function handleChatMessage(message) {
		// Get chat log container
		var chatLog = $('#chat-log');

		// Append the sender's username to the chat log if there were no chat
		// messages before or the last message was from another user
		var appendUsername = false;
		if (state.lastUsername) {
			if (state.lastUsername !== message.from) {
				appendUsername = true;
			}
		} else {
			appendUsername = true;
		}

		if (appendUsername) {
			state.lastUsername = message.from;

			// Create the username element
			var usernameElem = $('<p class="chat-log-username"></p>')
				.attr({'data-username': message.from})
				.append(document.createTextNode(message.from));

			// Append the username element to the chat log
			chatLog.append(usernameElem);
		}

		// Create the message element
        var messageElem = chatly.createMessageElement({
            data: message.data,
            time: message.time
        });

		// Append the message element to the chat log
		chatLog.append(messageElem.container);
	}

    /**
     * Clear all messages from the chat window
     */
	function handleLeftRoom() {
		$('#chat-log').html('');
		state.lastUsername = null;
	}

}(window.chatly = window.chatly || {}, jQuery));
