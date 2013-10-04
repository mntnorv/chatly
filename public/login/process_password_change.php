<?php
	include '../../includes/ChatlyAuth.php';
	include '../../includes/Messaging.php';
	ChatlyAuth::startSecureSession();

	if(ChatlyAuth::getCachedLoginState() == false) {
		Messaging::setErrorMessage('Stop trying to hack me.');
		header('Location: /');
		die();
	}

	if (isset($_POST['old_password'], $_POST['new_password'], $_POST['new_password_confirm'])) {
		$username = $_SESSION['username'];
		$old_password = $_POST['old_password'];
		$new_password = $_POST['new_password'];
		$new_password_confirm = $_POST['new_password_confirm'];

		$invalid = false;

		if ($new_password != $new_password_confirm) {
			Messaging::setErrorMessage('Your passwords do not match.');
			$invalid = true;
		}

		if (strlen($new_password) < 8) {
			Messaging::setErrorMessage('Your password is too short. It sould have at least 8 characters.');
			$invalid = true;
		}

		if ($invalid == true) {
			header('Location: /user/settings.php');
			die();
		}

		if(ChatlyAuth::changePassword($username, $old_password, $new_password) == true) {
			Messaging::setSuccessMessage('Successfully changed your password.');
			header('Location: /user/settings.php');
		} else {
			Messaging::setErrorMessage('<strong>Error:</strong> incorrect password.');
			header('Location: /user/settings.php');
		}
	} else {
		Messaging::setErrorMessage('<strong>Error:</strong> unable to process password change request.');
		header('Location: /user/settings.php');
	}
