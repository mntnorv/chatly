<?php
	include '../../includes/ChatlyAuth.php';
	include '../../includes/Messaging.php';
	ChatlyAuth::startSecureSession();

	if (isset($_POST['username'], $_POST['password'])) {
		$username = $_POST['username'];
		$password = $_POST['password'];
		
		if(ChatlyAuth::login($username, $password) == true) {
			Messaging::setSuccessMessage('Logged in successfully.');
			header('Location: /');
		} else {
			Messaging::setErrorMessage('Incorrect username or password.');
			header('Location: /login.php');
		}
	} else {
		Messaging::setErrorMessage('<strong>Error:</strong> unable to process login request.');
		header('Location: /login.php');
	}
