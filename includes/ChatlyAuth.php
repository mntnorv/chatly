<?php

include_once "FirebaseToken.php";
include_once "ChatlyDB.php";

class ChatlyAuth {

	//================================================================================
	// Private class properties
	//================================================================================

	private static $cachedLoginState;

	//================================================================================
	// Session - related methods
	//================================================================================

	// Start a secure session
	public static function startSecureSession() {
		$session_name = 'chatly_secure_session';
		$secure = false; // Set to true if using https.
		$httponly = true; // This stops javascript being able to access the session id.

		ini_set('session.use_only_cookies', 1);
		$cookieParams = session_get_cookie_params();
		session_set_cookie_params(
			$cookieParams["lifetime"],
			$cookieParams["path"],
			$cookieParams["domain"],
			$secure,
			$httponly
		);
		session_name($session_name);
		session_start();
		session_regenerate_id();
	}

	// Get the Firebase authentication token
	public static function getFirebaseToken($username) {
		$secret = "qgMnx4KvMeNrjtK8ml3iDvIpyv9NB0nfOfzg67IW";
		$tokenGen = new Services_FirebaseTokenGenerator($secret);
		return $tokenGen->createToken(array("id" => $username));
	}

	// Check if user is logged in
	public static function checkLogin() {
		$pdo = ChatlyDB::getPDO();

		if(isset($_SESSION['user_id'], $_SESSION['username'], $_SESSION['login_string'])) {
			// Get user info from session
			$user_id      = $_SESSION['user_id'];
			$username     = $_SESSION['username'];
			$login_string = $_SESSION['login_string'];

			$user_browser = $_SERVER['HTTP_USER_AGENT'];

			// Get user password
			$stmt = $pdo->prepare("SELECT password FROM users WHERE id = :user_id LIMIT 1");
			$stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
			$stmt->execute();

			$row = $stmt->fetch();
			if ($row != FALSE) {
				$password = $row['password'];
				$login_check = hash('sha512', $password.$user_browser);
				
				// Check if $_SESSION info matches the current session
				if($login_check == $login_string) {
					self::$cachedLoginState = true;
					return true;
				} else {
					self::$cachedLoginState = false;
					return false;
				}
			} else {
				self::$cachedLoginState = false;
				return false;
			}
		} else {
			self::$cachedLoginState = false;
			return false;
		}
	}

	// Get the cached login state
	// If it not set, call checkLogin() and return the new value
	public static function getCachedLoginState() {
		if (self::$cachedLoginState === NULL) {
			self::checkLogin();
		}

		return self::$cachedLoginState;
	}

	//================================================================================
	// Login - related methods
	//================================================================================

	public static function login($username, $password) {
		$pdo = ChatlyDB::getPDO();

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

			if (self::checkBrute($user_id)) {
				// Account is locked
				// Too many login attempts
				return false;
			} else {
				// Check if password is correct
				if ($db_password == $password) {
					// Correct!
					self::setLoginSession($user_id, $username, $password);
					return true;
				} else {
					// Incorrect!
					$now = time();

					// Register the login attempt
					$stmt = $pdo->prepare("INSERT INTO login_attempts (user_id, time) VALUES (:user_id, :time)");
					$stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
					$stmt->bindParam(':time',    $now,     PDO::PARAM_INT);
					$stmt->execute();

					return false;
				}
			}
		} else {
			return false;
		}
	}

	public static function logout() {
		$_SESSION = array();
		$params = session_get_cookie_params();
		setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
		session_destroy();
	}

	//================================================================================
	// Registration - related methods
	//================================================================================

	public static function register($username, $password) {
		$pdo = ChatlyDB::getPDO();

		// Hash the password
		$password = hash('sha512', $password);

		// Salt the password
		$salt = hash('sha512', uniqid(mt_rand(1, mt_getrandmax()), true));
		$password_salted = hash('sha512', $password.$salt);

		// Insert a new user
		$stmt = $pdo->prepare("INSERT INTO users (username, password, salt) VALUES (:username, :password, :salt)");
		$stmt->bindParam(':username', $username,        PDO::PARAM_STR);
		$stmt->bindParam(':password', $password_salted, PDO::PARAM_STR);
		$stmt->bindParam(':salt',     $salt,            PDO::PARAM_STR);
		$return = $stmt->execute();

		if ($return != FALSE) {
			// Get the new user's id
			$stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username");
			$stmt->bindParam(':username', $username, PDO::PARAM_STR);
			$stmt->execute();

			$row = $stmt->fetch();
			$user_id = $row['id'];

			// Login
			self::setLoginSession($user_id, $username, $password_salted);

			// Return true (succeeded)
			return true;
		} else {
			return false;
		}
	}

	//================================================================================
	// User data - related methods
	//================================================================================

	function changePassword($username, $old_password, $new_password) {
		$pdo = ChatlyDB::getPDO();

		// Hash the password
		$new_password = hash('sha512', $new_password);

		// Salt the password
		$salt = hash('sha512', uniqid(mt_rand(1, mt_getrandmax()), true));
		$new_password_salted = hash('sha512', $new_password.$salt);

		// Get user info
		$stmt = $pdo->prepare("SELECT id, password, salt FROM users WHERE username = :username");
		$stmt->bindParam(':username', $username, PDO::PARAM_STR);
		$stmt->execute();

		$row = $stmt->fetch();
		if ($row != FALSE) {
			$user_id         = $row['id'];
			$old_db_salt     = $row['salt'];
			$old_db_password = $row['password'];

			// Compare the old db password with the one entered
			$old_password = hash('sha512', $old_password);
			$old_password = hash('sha512', $old_password.$old_db_salt);

			if ($old_password == $old_db_password) {
				// Update the password
				$stmt = $pdo->prepare("UPDATE users SET password = :password, salt = :salt WHERE id = :user_id");
				$stmt->bindParam(':password', $new_password_salted, PDO::PARAM_STR);
				$stmt->bindParam(':salt',     $salt,                PDO::PARAM_STR);
				$stmt->bindParam(':user_id',  $user_id,             PDO::PARAM_INT);
				$return = $stmt->execute();

				// Update user session
				self::setLoginSession($user_id, $username, $new_password_salted);

				// Return true if the change succeeded, false otherwise
				if ($return != FALSE) {
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

	//================================================================================
	// Private methods
	//================================================================================

	// Set or update the login session
	private static function setLoginSession($user_id, $username, $salted_password) {
		$user_browser = $_SERVER['HTTP_USER_AGENT'];
		$user_id = preg_replace("/[^0-9]+/", "", $user_id);
		$_SESSION['user_id'] = $user_id;
		$username = preg_replace("/[^a-zA-Z0-9_\-]+/", "", $username);
		$_SESSION['username'] = $username;
		$_SESSION['login_string'] = hash('sha512', $salted_password.$user_browser);
	}

	// Check if the uses has tried to login unsuccessfully five times
	// in two hours
	private static function checkBrute($user_id) {
		$pdo = ChatlyDB::getPDO();

		// Get the time before 2 hours
		$now = time();
		$valid_attempts = $now - (2 * 60 * 60);

		// Get all incorrect login attempts in 2 hours
		$stmt = $pdo->prepare("SELECT time FROM login_attempts WHERE user_id = :user_id AND time > :start_time");
		$stmt->bindParam(':user_id',    $user_id,        PDO::PARAM_INT);
		$stmt->bindParam(':start_time', $valid_attempts, PDO::PARAM_INT);
		$stmt->execute();

		$rows = $stmt->fetchAll();

		// Return true if there were more than 5 login attempts in 2
		// hours, false otehrwise
		if (count($rows) > 5) {
			return true;
		} else {
			return false;
		}
	}
}