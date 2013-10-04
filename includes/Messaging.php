<?php

class Messaging {
	public static function setSuccessMessage($message) {
		self::setMessage($message, 'success');
	}

	public static function setErrorMessage($message) {
		self::setMessage($message, 'error');
	}

	public static function setNoticeMessage($message) {
		self::setMessage($message, 'notice');
	}

	public static function isMessageSet() {
		return isset($_SESSION['message']);
	}

	public static function getMessage() {
		if (self::isMessageSet()) {
			$message      = $_SESSION['message'];
			$message_type = $_SESSION['message_type'];
			$_SESSION['message']      = null;
			$_SESSION['message_type'] = null;

			return array(
				'message_text' => $message,
				'message_type' => $message_type
			);
		} else {
			return FALSE;
		}
	}

	private static function setMessage($message, $type) {
		$_SESSION['message']      = $message;
		$_SESSION['message_type'] = $type;
	}
}
