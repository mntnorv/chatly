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
			set_error_message('Incorrect username or password.');
			header('Location: /login.php');
		}
	} else {
		set_error_message('<strong>Error:</strong> unable to process login request.');
		header('Location: /login.php');
	}