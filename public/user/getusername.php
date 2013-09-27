<?php
	include_once '../../includes/functions.php';
	secure_session_start();

	$response = array();

	$username = $_SESSION['username'];

	if ($username != NULL) {
		$response['username'] = $username;
	} else {
		$response['error'] = "You must be logged in to get your username.";
	}

	header('Content-Type: application/json; charset=utf-8');

	echo json_encode($response);
