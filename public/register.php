<?php
	include_once '../includes/db_connect.php';
	include_once '../includes/functions.php';
	secure_session_start();

	include_once '../includes/login_check.php';

	if($logged_in == true) {
		set_notice_message('You are already logged in.');
		header('Location: ./');
		die();
	}
?>

<!DOCTYPE html>
<html>
<head>
	<title>Chatly</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

	<!-- Assets -->
	<?php include '../views/assets.php'; ?>
</head>
<body>
	<!-- Navbar -->
	<?php include '../views/navbar.php'; ?>

	<!-- Messages -->
	<?php include '../views/messages.php'; ?>

	<div class="container">

		<div class="page-header">
			<h1>Registration</h1>
		</div>

		<!-- Grid-->
		<div class="row">
			<!-- Registration form -->
			<div class="col-sm-6">
				<?php include '../views/registration_form.php'; ?>
			</div>
			
			<!-- Chatly logo -->
			<div class="col-sm-6 hidden-xs">
				<div id="chatly-logo-back">
					<img class="img-responsive" src="/images/chatly-transparent.png" />
				</div>
			</div>
		</div>

		<!-- Footer -->
		<?php include '../views/footer.php'; ?>
	</div>	
</body>
</html>