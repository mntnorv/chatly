<div id="chat-container" class="fullwidth-sm">
	<div class="container fullheight-sm">
		<div class="row fullheight-sm">
			<div class="col-sm-4 fullheight-sm">
				<div id="chat-sidebar-container">
					<div>
						<a class="sidebar-title" data-toggle="collapse" data-target="#chat-rooms" href="#">Chat rooms</a>
						<a class="btn btn-success btn-xs pull-right" href="#">Create</a>
					</div>
					
					<div id="chat-rooms" class="sidebar-list in">
						<a class="item" href="#">Room 1</a>
					</div>

					<div>
						<a class="sidebar-title" data-toggle="collapse" data-target="#contact-list" href="#">Contacts</a>
						<a class="btn btn-success btn-xs pull-right" data-toggle="collapse" data-target="#add-contact-form" href="#">Add</a>
					</div>

					<form id="add-contact-form" class="collapse" onsubmit="submitAddContact($(this)); return false;">
						<input class="form-control" name="username" type="text" placeholder="username" autocomplete="off"></input>
						<ul class="parsley-error-list">
						</ul>
					</form>

					<div id="contact-list" class="sidebar-list in">
					</div>
				</div>
			</div>
			<div class="col-sm-8 fullheight-sm">
				<div id="chat-window" class="fullwidth-sm fullheight-sm">
					<div id="chat-log-container" class="fullwidth-sm">
						<div id="chat-log" class="fullwidth-sm">
							<p class="chat-message"><strong>test_user</strong>: Hey another_test_user! <span class="pull-right">10:11</span></p>
						</div>
					</div>

					<div id="chat-input" class="fullwidth-sm">
						<form>
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

<script type="text/javascript" src="/js/chat.js"></script>
