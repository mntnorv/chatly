<?php
	include_once '../../includes/ChatlyAuth.php';
	ChatlyAuth::startSecureSession();

	$response = array();

	if (ChatlyAuth::getCachedLoginState() === true) {
		$username = $_SESSION['username'];
		$response['token'] = ChatlyAuth::getFirebaseToken($username);
		$response['username'] = $username;
	} else {
		$response['error'] = "You must be logged in to get your token.";
	}

	header('Content-Type: application/json; charset=utf-8');

	echo json_encode($response);
