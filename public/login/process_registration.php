<?php
	include '../../includes/ChatlyAuth.php';
	include '../../includes/Messaging.php';
	ChatlyAuth::startSecureSession();

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
			Messaging::setErrorMessage('Your username is too short. It sould have at least 6 characters.');
			$invalid = true;
		}

		if (strlen($password) < 8) {
			Messaging::setErrorMessage('Your password is too short. It sould have at least 8 characters.');
			$invalid = true;
		}

		if ($invalid == true) {
			header('Location: /register.php');
			die();
		}

		if(ChatlyAuth::register($username, $password) == true) {
			Messaging::setSuccessMessage('You have registered successfully.');
			header('Location: /');
		} else {
			Messaging::setErrorMessage('This username already exists. Please choose another username.');
			header('Location: /register.php');
		}
	} else {
		Messaging::setErrorMessage('<strong>Error:</strong> unable to process registration request.');
		header('Location: /register.php');
	}