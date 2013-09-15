<?php
	function secure_session_start() {
		$session_name = 'chatly_secure_session';
		$secure = false; // Set to true if using https.
		$httponly = true; // This stops javascript being able to access the session id.

		ini_set('session.use_only_cookies', 1);
		$cookieParams = session_get_cookie_params();
		session_set_cookie_params($cookieParams["lifetime"], $cookieParams["path"], $cookieParams["domain"], $secure, $httponly);
		session_name($session_name);
		session_start();
		session_regenerate_id();
	}

	function login($username, $password, $pdo) {
		// Hash the password
		$password = hash('sha512', $password);

		// Select a user with username = $username
		$stmt = $pdo->prepare("SELECT id, username, password, salt FROM users WHERE username = :username LIMIT 1");
		$stmt->bindParam(':username', $username, PDO::PARAM_STR);
		$stmt->execute();
		$row = $stmt->fetch();

		if ($row != FALSE) {
			// Get results from row
			$user_id     = $row['id'];
			$username    = $row['username'];
			$db_password = $row['password'];
			$salt        = $row['salt'];

			$password = hash('sha512', $password.$salt);

			if (checkbrute($user_id, $pdo)) {
				// Account is locked
				// Too many login attempts
				return false;
			} else {
				// Check if password is correct
				if ($db_password == $password) {
					// Correct!
					$user_browser = $_SERVER['HTTP_USER_AGENT'];

					$user_id = preg_replace("/[^0-9]+/", "", $user_id);
					$_SESSION['user_id'] = $user_id;
					$username = preg_replace("/[^a-zA-Z0-9_\-]+/", "", $username);
					$_SESSION['username'] = $username;
					$_SESSION['login_string'] = hash('sha512', $password.$user_browser);

					return true;
				} else {
					// Incorrect!
					$now = time();

					// Register the login attempt
					$stmt = $pdo->prepare("INSERT INTO login_attempts (user_id, time) VALUES (:user_id, :time)");
					$stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
					$stmt->bindParam(':time', $now, PDO::PARAM_INT);
					$stmt->execute();

					return false;
				}
			}
		} else {
			return false;
		}
	}

	function register($username, $password, $pdo) {
		// Hash the password
		$password = hash('sha512', $password);

		// Salt the password
		$salt = hash('sha512', uniqid(mt_rand(1, mt_getrandmax()), true));
		$password_salted = hash('sha512', $password.$salt);

		// Insert a new user
		$stmt = $pdo->prepare("INSERT INTO users (username, password, salt) VALUES (:username, :password, :salt)");
		$stmt->bindParam(':username', $username, PDO::PARAM_STR);
		$stmt->bindParam(':password', $password_salted, PDO::PARAM_STR);
		$stmt->bindParam(':salt', $salt, PDO::PARAM_STR);
		$return = $stmt->execute();

		// Return true if registration succeeded, false otherwise.
		if ($return != FALSE) {
			return true;
		} else {
			return false;
		}
	}

	function checkbrute($user_id, $pdo) {
		$now = time();
		$valid_attempts = $now - (2 * 60 * 60);

		$stmt = $pdo->prepare("SELECT time FROM login_attempts WHERE user_id = :user_id AND time > :start_time");
		$stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
		$stmt->bindParam(':start_time', $valid_attempts, PDO::PARAM_INT);
		$stmt->execute();

		$rows = $stmt->fetchAll();

		if (count($rows) > 5) {
			return true;
		} else {
			return false;
		}
	}

	function login_check($pdo) {
		if(isset($_SESSION['user_id'], $_SESSION['username'], $_SESSION['login_string'])) {
			$user_id      = $_SESSION['user_id'];
			$username     = $_SESSION['username'];
			$login_string = $_SESSION['login_string'];

			$user_browser = $_SERVER['HTTP_USER_AGENT'];

			$stmt = $pdo->prepare("SELECT password FROM users WHERE id = :user_id LIMIT 1");
			$stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
			$stmt->execute();

			$row = $stmt->fetch();
			if ($row != FALSE) {
				$password = $row['password'];
				$login_check = hash('sha512', $password.$user_browser);
				if($login_check == $login_string) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
