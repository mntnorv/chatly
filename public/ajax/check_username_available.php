<?php
	include_once '../../includes/ChatlyDB.php';

	$response = array();

	if (isset($_POST['username'])) {
		$pdo = ChatlyDB::getPDO();

		$username = $_POST['username'];

		$stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username");
		$stmt->bindParam(':username', $username, PDO::PARAM_STR);
		$stmt->execute();

		$row = $stmt->fetch();

		if ($row == FALSE) {
			$response['success'] = true;
		} else {
			$response['error'] = "This username is not availabe.";
		}
	} else {
		$response['error'] = "Unable to check username availability.";
	}

	header('Content-Type: application/json; charset=utf-8');

	echo json_encode($response);
