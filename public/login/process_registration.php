<?php
	include '../../includes/db_connect.php';
	include '../../includes/functions.php';
	secure_session_start();

	if (isset($_POST['username'], $_POST['password'], $_POST['password_confirm'])) {
		$username = $_POST['username'];
		$password = $_POST['password'];
		$password_confirm = $_POST['password_confirm'];

		$invalid = false;

		if ($password != $password_confirm) {
			set_error_message('Your passwords do not match.');
			$invalid = true;
		}

		if (strlen($username) < 6) {
			set_error_message('Your username is too short. It sould have at least 6 characters.');
			$invalid = true;
		}

		if (strlen($password) < 8) {
			set_error_message('Your password is too short. It sould have at least 8 characters.');
			$invalid = true;
		}

		if ($invalid == true) {
			header('Location: ../register.php?error=1');
			die();
		}

		if(register($username, $password, $pdo) == true) {
			header('Location: ../login.php');
		} else {
			set_error_message('This username already exists. Please choose another username.');
			header('Location: ../register.php?error=1');
		}
	} else {
		set_error_message('<strong>Error:</strong> unable to process registration request.');
		header('Location: ../register.php');
	}