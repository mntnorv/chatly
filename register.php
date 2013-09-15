<?php
	include_once 'db_connect.php';
	include_once 'login/functions.php';
	secure_session_start();
?>

<!DOCTYPE html>
<html>
<head>
	<title>Chatly</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<!-- Styles -->
	<link href="/css/bootstrap.min.css" rel="stylesheet" media="screen" />
	<link href="/css/main.css" rel="stylesheet" media="screen" />

	<!-- Javascript -->
	<script type="text/javascript" src="http://code.jquery.com/jquery-2.0.0.min.js"></script>
	<script type="text/javascript" src="/js/bootstrap.min.js"></script>
	<script type="text/javascript" src="/js/sha512.js"></script>
	<script type="text/javascript" src="/js/forms.js"></script>
</head>
<body>
	<!-- Navbar -->
	<?php include 'views/navbar.php' ?>

	<div class="container">

		<div class="page-header">
			<h1>Registration</h1>
		</div>

		<!-- Registration form -->
		<div class="row">
			<div class="col-sm-6">
				<form class="form-horizontal" role="form">
					<div class="form-group">
						<label for="input_username" class="col-md-4 control-label">Username</label>
						<div class="col-md-8">
							<input type="text" class="form-control" id="input_username" placeholder="Username">
						</div>
					</div>
					<div class="form-group">
						<label for="input_password" class="col-md-4 control-label">Password</label>
						<div class="col-md-8">
							<input type="password" class="form-control" id="input_password" placeholder="Password">
						</div>
					</div>
					<div class="form-group">
						<label for="input_password" class="col-md-4 control-label">Confirm password</label>
						<div class="col-md-8">
							<input type="password" class="form-control" id="input_password" placeholder="Confirm password">
						</div>
					</div>
					<div class="form-group">
						<div class="col-md-offset-4 col-md-8">
							<button type="submit" class="btn btn-primary btn-block btn-lg">Register</button>
						</div>
					</div>
				</form>
			</div>
			<div class="col-sm-6">
				<div id="chatly-logo-back">
					<img class="img-responsive" src="chatly.png" />
				</div>
			</div>
		</div>

		<!-- Footer -->
		<?php include 'views/footer.php' ?>
	</div>	
</body>
</html>