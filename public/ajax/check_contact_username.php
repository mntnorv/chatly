<?php
	include_once '../../includes/ChatlyDB.php';
	include_once '../../includes/ChatlyAuth.php';
	ChatlyAuth::startSecureSession();

	$response = array();

	if (isset($_POST['username'])) {
		$pdo = ChatlyDB::getPDO();
		
		$username = $_POST['username'];

		if ($username == $_SESSION['username']) {
			$response['error'] = "You can't add yourself to contacts.";
		} else {
			$stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username");
			$stmt->bindParam(':username', $username, PDO::PARAM_STR);
			$stmt->execute();

			$row = $stmt->fetch();

			if ($row == FALSE) {
				$response['error'] = "There is no user with that name.";
			} else {
				$response['success'] = true;
			}
		}
	} else {
		$response['error'] = "Unable to check username availability.";
	}

	header('Content-Type: application/json; charset=utf-8');

	echo json_encode($response);
