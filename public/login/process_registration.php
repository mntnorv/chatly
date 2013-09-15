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
			$invalid = true;
		}

		if (strlen($username) < 6) {
			$invalid = true;
		}

		if (strlen($password) < 8) {
			$invalid = true;
		}

		if ($invalid == true) {
			header('Location: ../register.php?error=1');
			die();
		}

		if(register($username, $password, $pdo) == true) {
			header('Location: ../login.php');
		} else {
			header('Location: ../register.php?error=1');
		}
	} else {
		header('Location: ../register.php?error=1');
	}