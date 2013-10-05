<div id="chat-container" class="fullwidth-sm">
	<div class="container fullheight-sm">
		<div class="row fullheight-sm">
			<div class="col-sm-4 fullheight-sm sidebar-border">
				<div id="chat-sidebar-container">
					<div>
						<span class="sidebar-title">Chat rooms</span>
						<button class="btn btn-success btn-xs pull-right" data-toggle="collapse" data-target="#create-room-form">Create</button>
					</div>

					<form id="create-room-form" class="collapse" onsubmit="chatly.submitCreateRoom($(this)); return false;">
						<input class="form-control" name="roomname" type="text" placeholder="Room name" autocomplete="off" />
					</form>
					
					<div id="chat-rooms" class="sidebar-list">
					</div>

                    <div>
                        <span class="sidebar-title">People in room</span>
                        <button class="btn btn-success btn-xs pull-right" data-toggle="modal" data-target="#roomAddContactsModal">Add</button>
                    </div>

                    <div id="people-in-room" class="sidebar-list">
                    </div>

					<div>
						<span class="sidebar-title">Contacts</span>
						<button class="btn btn-success btn-xs pull-right" data-toggle="collapse" data-target="#add-contact-form">Add</button>
					</div>

					<form id="add-contact-form" class="collapse" onsubmit="chatly.submitAddContact($(this)); return false;">
						<input class="form-control" name="username" type="text" placeholder="Username" autocomplete="off" />
					</form>

					<div id="contact-list" class="sidebar-list">
					</div>
				</div>
			</div>
			<div class="col-sm-8 fullheight-sm">
				<div id="chat-window" class="fullwidth-sm fullheight-sm">
					<div id="chat-log-container" class="fullwidth-sm">
						<div id="chat-log" class="fullwidth-sm">
						</div>
					</div>

					<div id="chat-input" class="fullwidth-sm">
						<form onsubmit="chatly.submitChatMessage($(this)); return false;">
							<div class="input-group">
								<input class="form-control" type="text" name="message" placeholder="Type a message..." />
								<span class="input-group-btn">
									<button class="btn btn-primary" type="submit">Send</button>
								</span>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<?php include 'modal_room_contacts.php'; ?>

<script type="text/javascript" src="/js/chatly.js"></script>
