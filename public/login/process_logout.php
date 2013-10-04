<?php
	include_once '../../includes/ChatlyAuth.php';
	ChatlyAuth::startSecureSession();

	ChatlyAuth::logout();

	header('Location: /');
