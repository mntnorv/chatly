<?php
	
class ChatlyDB {
	private static $relativeDBPath = '/../db/chatly.s3db';

	private static $pdo;

	public static function connect() {
		$filename = $_SERVER['DOCUMENT_ROOT'].self::$relativeDBPath;
		self::$pdo = new PDO('sqlite:'.$filename);
	}

	public static function getPDO() {
		if (self::$pdo === NULL) {
			self::connect();
		}

		return self::$pdo;
	}
}
