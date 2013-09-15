<div class="navbar navbar-inverse navbar-fixed-top">
	<div class="container">
		<!-- Navbar header-->
		<div class="navbar-header">
			<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			</button>
			<a class="navbar-brand" href="/">Chatly</a>
		</div>

		<!-- Login form -->
		<div class="navbar-collapse collapse">
			<?php
				if(login_check($pdo) == true) {
					include 'logged_in.php';
				} else {
					include 'login_form.php';
				}
			?>
		</div>
	</div>
</div>