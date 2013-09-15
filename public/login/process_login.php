<?php
	include '../../includes/db_connect.php';
	include '../../includes/functions.php';
	secure_session_start();

	if (isset($_POST['username'], $_POST['password'])) {
		$username = $_POST['username'];
		$password = $_POST['password'];
		if(login($username, $password, $pdo) == true) {
			set_success_message('Logged in successfully.');
			header('Location: /');
		} else {
			header('Location: /login.php?error=1');
		}
	} else {
		header('Location: /login.php?error=1');
	}