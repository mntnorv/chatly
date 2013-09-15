<?php
	include '../db_connect.php';
	include 'functions.php';
	secure_session_start();

	if (isset($_POST['username'], $_POST['password_hash'])) {
		$username = $_POST['username'];
		$password = $_POST['password_hash'];
		if(login($username, $password, $pdo) == true) {
			echo 'Success!';
		} else {
			header('Location: ./?error=1');
		}
	} else {
		echo 'Invalid Request';
	}