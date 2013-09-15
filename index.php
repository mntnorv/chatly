<!DOCTYPE html>
<html>
<head>
	<title>Chatly</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<!-- Styles -->
	<link href="/css/bootstrap.min.css" rel="stylesheet" media="screen" />
	<link href="/css/index.css" rel="stylesheet" media="screen" />

	<!-- Javascript -->
	<script type="text/javascript" src="/js/sha512.js"></script>
	<script type="text/javascript" src="/js/forms.js"></script>
</head>
<body>
	<!-- Navbar -->
	<div class="navbar navbar-inverse navbar-fixed-top">
		<div class="container">
			<div class="navbar-header">
				<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</button>
				<a class="navbar-brand" href="#">Chatly</a>
			</div>
			<!-- Login form -->
			<div class="navbar-collapse collapse">
				<form class="navbar-form navbar-right" action="login/process_login.php" onsubmit="formhash(this, this.password);" method="post" name="login_form">
					<div class="form-group">
						<input type="text" name="username" placeholder="Username" class="form-control">
					</div>
					<div class="form-group">
						<input type="password" name="password" placeholder="Password" class="form-control">
					</div>
					<button type="submit" class="btn btn-success">Sign in</button>
				</form>
			</div>
		</div>
	</div>

	<!-- Hero unit -->
	<div class="jumbotron">
		<div class="container">
			<h1>Welcome to Chatly</h1>
			<p>A simple chat web-app</p>
			<p><a class="btn btn-primary btn-lg" href="/login/register.php">Register now &raquo;</a></p>
		</div>
	</div>
</body>
</html>