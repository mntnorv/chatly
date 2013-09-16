<?php
	include_once '../../includes/db_connect.php';
	include_once '../../includes/functions.php';
	secure_session_start();

	if(login_check($pdo) == false) {
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

	<!-- Styles -->
	<link href="/css/bootstrap.min.css" rel="stylesheet" media="screen" />
	<link href="/css/main.css" rel="stylesheet" media="screen" />

	<!-- Javascript -->
	<script type="text/javascript" src="http://code.jquery.com/jquery-2.0.0.min.js"></script>
	<script type="text/javascript" src="/js/bootstrap.min.js"></script>
	<script type="text/javascript" src="/js/parsley.min.js"></script>
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