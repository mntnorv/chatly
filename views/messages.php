<?php
	$message_class = "";

	$message      = $_SESSION['message'];
	$message_type = $_SESSION['message_type'];
	$_SESSION['message']      = null;
	$_SESSION['message_type'] = null;

	switch ($message_type) {
		case 'success':
			$message_class = "alert-success";
			break;

		case 'error':
			$message_class = "alert-danger";
			break;

		case 'notice':
			$message_class = "alert-info";
			break;
	}
?>

<?php if ($message != null) : ?>
	<div class="alert <?php echo $message_class; ?>">
		<?php echo $message; ?>
	</div>
<?php endif ?>
