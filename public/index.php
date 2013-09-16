<?php
	include_once '../includes/db_connect.php';
	include_once '../includes/functions.php';
	secure_session_start();
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
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script type="text/javascript" src="/js/bootstrap.min.js"></script>
</head>
<body>
	<!-- Navbar -->
	<?php include '../views/navbar.php'; ?>

	<!-- Messages -->
	<?php include '../views/messages.php'; ?>

	<!-- Hero unit -->
	<div class="jumbotron">
		<div class="container">
			<h1>Welcome to Chatly</h1>
			<p>A simple chat web-app</p>
			<p><a class="btn btn-primary btn-lg" href="/register.php">Register now &raquo;</a></p>
		</div>
	</div>

	<div class="container">
		<!-- Awesome marketing talk -->
		<div class="row">
			<div class="col-lg-4">
				<h2>Heading</h2>
				<p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </p>
				<p><a class="btn btn-default" href="#">View details &raquo;</a></p>
			</div>
			<div class="col-lg-4">
				<h2>Heading</h2>
				<p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </p>
				<p><a class="btn btn-default" href="#">View details &raquo;</a></p>
			</div>
			<div class="col-lg-4">
				<h2>Heading</h2>
				<p>Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>
				<p><a class="btn btn-default" href="#">View details &raquo;</a></p>
			</div>
		</div>

		<!-- Footer -->
		<?php include '../views/footer.php'; ?>
	</div>
</body>
</html>