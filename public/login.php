<?php
	include_once '../includes/db_connect.php';
	include_once '../includes/functions.php';
	secure_session_start();

	if(login_check($pdo) == true) {
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
	<?php include '../views/navbar.php' ?>

	<div class="container">

		<div class="page-header">
			<h1>Login</h1>
		</div>

		<!-- Registration form -->
		<div class="row">
			<div class="col-sm-6">
				<form class="form-horizontal" role="form" action="login/process_login.php" method="post" data-validate="parsley">
					<div class="form-group">
						<label for="input_username" class="col-md-4 control-label">Username</label>
						<div class="col-md-8">
							<input type="text" name="username" class="form-control" id="input_username" placeholder="Username" data-required="true" />
						</div>
					</div>
					<div class="form-group">
						<label for="input_password" class="col-md-4 control-label">Password</label>
						<div class="col-md-8">
							<input type="password" name="password" class="form-control" id="input_password" placeholder="Password" data-required="true" />
						</div>
					</div>
					<div class="form-group">
						<div class="col-md-offset-4 col-md-8">
							<button type="submit" class="btn btn-primary btn-block btn-lg">Sign in</button>
						</div>
					</div>
				</form>
			</div>

			<!-- Chatly logo -->
			<div class="col-sm-6 hidden-xs">
				<div id="chatly-logo-back">
					<img class="img-responsive" src="/images/chatly.png" />
				</div>
			</div>
		</div>

		<!-- Footer -->
		<?php include '../views/footer.php' ?>
	</div>	
</body>
</html>