<?php
	include_once '../../includes/db_connect.php';
	include_once '../../includes/functions.php';
	secure_session_start();

	include_once '../../includes/login_check.php';

	if($logged_in == false) {
		set_notice_message('Please login.');
		header('Location: /login.php');
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
	<?php include '../../views/assets.php'; ?>
</head>
<body>
	<!-- Navbar -->
	<?php include '../../views/navbar.php' ?>

	<!-- Messages -->
	<?php include '../../views/messages.php' ?>

	<div class="container">

		<div class="page-header">
			<h1>Settings</h1>
		</div>

		<!-- Registration form -->
		<div class="row">
			<div class="col-md-6">
				<div class="panel panel-default">
					<div class="panel-heading">Change password</div>
					<div class="panel-body">
						<?php include '../../views/change_password_form.php'; ?>
					</div>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<?php include '../../views/footer.php' ?>
	</div>	
</body>
</html>