<?php
	include '../db_connect.php';
	include 'functions.php';
	secure_session_start();

	if (isset($_POST['username'], $_POST['password'], $_POST['password_confirm'])) {
		$username = $_POST['username'];
		$password = $_POST['password'];
		$password_confirm = $_POST['password_confirm'];

		if ($password != $password_confirm) {
			header('Location: ../register.php?error=1');
		}

		if(register($username, $password, $pdo) == true) {
			header('Location: ../login.php');
		} else {
			header('Location: ../register.php?error=1');
		}
	} else {
		echo 'Invalid Request';
	}