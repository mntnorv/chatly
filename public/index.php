<?php
	include_once '../includes/db_connect.php';
	include_once '../includes/functions.php';
	secure_session_start();

	include_once '../includes/login_check.php';
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

	<!-- Insert frontpage or chat -->
	<?php
		if($logged_in == true) {
			include '../views/chat.php';
		} else {
			include '../views/frontpage.php';
		}
	?>
</body>
</html>