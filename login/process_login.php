<?php
	include '../db_connect.php';
	include 'functions.php';
	secure_session_start();

	if (isset($_POST['username'], $_POST['password'])) {
		$username = $_POST['username'];
		$password = $_POST['password'];
		if(login($username, $password, $pdo) == true) {
			header('Location: /');
		} else {
			header('Location: /?error=1');
		}
	} else {
		header('Location: /?error=1');
	}