<?php
	
	$doc_path = $_SERVER['DOCUMENT_ROOT'];
	$filename = $doc_path.'/../db/chatly.s3db';

	try {
		$pdo = new PDO('sqlite:'.$filename);
	} catch (PDOException $e) {
		echo $e->getMessage();
	}