<?php
	include '../../includes/db_connect.php';
	include '../../includes/functions.php';
	secure_session_start();

	include '../../includes/login_check.php';

	if($logged_in == false) {
		set_error_message('Stop trying to hack me.');
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
			set_error_message('Your passwords do not match.');
			$invalid = true;
		}

		if (strlen($new_password) < 8) {
			set_error_message('Your password is too short. It sould have at least 8 characters.');
			$invalid = true;
		}

		if ($invalid == true) {
			header('Location: /user/settings.php');
			die();
		}

		if(change_password($username, $old_password, $new_password, $pdo) == true) {
			set_success_message('Successfully changed your password.');
			header('Location: /user/settings.php');
		} else {
			set_error_message('<strong>Error:</strong> incorrect password.');
			header('Location: /user/settings.php');
		}
	} else {
		set_error_message('<strong>Error:</strong> unable to process password change request.');
		header('Location: /user/settings.php');
	}