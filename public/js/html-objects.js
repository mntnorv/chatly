
(function (chatly, $, undefined) {

    /**
     * Describes all of the possible contact states in the Chatly app
     * @readonly
     * @enum {number}
     */
    chatly.contactState = {
        ONLINE : 0,
        OFFLINE: 1,
        UNKNOWN: 2,
        REQUEST: 3
    };

    /**
     * Creates a new contact element
     * @param {object} opts
     * @param {string} opts.username - name of the contact to create
     * @returns {{container: object, status: object}} an object containing the main element
     *   and the status element.
     */
    chatly.createContactElement = function (opts) {
        var contactStatus = $('<span></span>');
        chatly.setContactState(contactStatus, chatly.contactState.UNKNOWN);

        var contactElem = $('<a class="item"></a>')
            .append(contactStatus)
            .append(document.createTextNode(" " + opts.username))
        ;

        return {
            container: contactElem,
            status   : contactStatus
        };
    };

    /**
     * Set the contact state
     * @param {object} statusElem - the element representing the contact's state
     * @param {number} state - a state from {@link chatly#contactState}
     */
    chatly.setContactState = function (statusElem, state) {
        switch(state) {
            case chatly.contactState.ONLINE:
                statusElem.attr({class: 'glyphicon glyphicon-ok-sign status-online'});
                break;
            case chatly.contactState.OFFLINE:
                statusElem.attr({class: 'glyphicon glyphicon-minus-sign status-offline'});
                break;
            case chatly.contactState.UNKNOWN:
                statusElem.attr({class: 'glyphicon glyphicon-question-sign status-offline'});
                break;
            case chatly.contactState.REQUEST:
                statusElem.attr({class: 'glyphicon glyphicon-question-sign status-unknown'});
                break;
        }
    };

    /**
     * Create a new checkable contact element
     * @param {object} opts
     * @param {string} opts.username - the name of the contact
     * @returns {{container: object}} an object containing the main element.
     */
    chatly.createCheckableContactElement = function (opts) {
        var contactElem = $('<label><input type="checkbox" /></label>')
            .attr({'data-username': opts.username})
            .append(document.createTextNode(opts.username));

        return {
            container: contactElem
        };
    };

    /**
     * Creates new contact confirmation elements
     * @param {object} opts
     * @param {string} opts.username - name of the contact to create the confirmation elements for
     * @returns {{container: object, accept: object, decline: object}} an object containing the main
     *   element, the accept and decline button elements.
     */
    chatly.createContactConfirmElements = function (opts) {
        var acceptButton = $('<a>Confirm</a>').attr({
            onclick: 'chatly.confirmRequest("' + opts.username + '");'
        });

        var declineButton = $('<a>Decline</a>').attr({
            onclick: 'chatly.removeContact("' + opts.username + '");'
        });

        var confirmElements = $('<span class="pull-right"></span>')
            .append(acceptButton)
            .append(document.createTextNode('/'))
            .append(declineButton)
        ;

        return {
            container: confirmElements,
            accept   : acceptButton,
            decline  : declineButton
        };
    };

    /**
     * Creates a new chat message element
     * @param {object} opts
     * @param {string} opts.data - the message string
     * @param {number} opts.time - the time this message was sent at
     * @returns {{container: object, message: object, time: object}} an object containing the
     *   main element, the message and time elements.
     */
    chatly.createMessageElement = function (opts) {
        var timeElem = $('<p class="chat-message-time pull-right"></p>')
            .append(document.createTextNode(new Date(opts.time).format('H:i')));

        var messageElem = $('<p class="chat-message-text"></p>')
            .append(document.createTextNode(opts.data));

        var messageDivElem = $('<div class="chat-message"></div>')
            .append(timeElem)
            .append(messageElem);

        return {
            container: messageDivElem,
            message: messageElem,
            time: timeElem
        };
    };

    /**
     * Create a new room element
     * @param {object} opts
     * @param {string} opts.id - the id of the room
     * @param {string} opts.name - the name of the room
     * @returns {{container: object, name: object}} an object containing the main element
     *   and the room name element.
     */
    chatly.createRoomElement = function (opts) {
        var roomElem = $('<a class="item"></a>')
            .attr({
                href: '#' + $.param({room: opts.id}),
                'data-room': opts.id
            })
            .append(document.createTextNode(opts.name))
        ;

        return {
            container: roomElem,
            name     : roomElem
        };
    };

}(window.chatly = window.chatly || {}, jQuery));
