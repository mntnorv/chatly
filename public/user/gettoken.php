<?php
	include_once '../../includes/db_connect.php';
	include_once '../../includes/functions.php';
	secure_session_start();

	include_once '../../includes/login_check.php';

	$response = array();

	if ($logged_in) {
		$username = $_SESSION['username'];
		$response['token'] = get_firebase_token($username);
		$response['username'] = $username;
	} else {
		$response['error'] = "You must be logged in to get your token.";
	}

	header('Content-Type: application/json; charset=utf-8');

	echo json_encode($response);
