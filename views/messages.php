<?php
	include_once (dirname(__FILE__) . '/../includes/Messaging.php');

	$message_class = "";

	$isMessageSet = Messaging::isMessageSet();

	$message;
	$message_text;
	$message_type;

	if ($isMessageSet) {
		$message      = Messaging::getMessage();
		$message_text = $message['message_text'];
		$message_type = $message['message_type'];

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
	}
?>

<?php if ($isMessageSet) : ?>
	<div class="alert <?php echo $message_class; ?>">
		<div class="container">
			<?php echo $message_text; ?>
		</div>
	</div>

	<script type="text/javascript">
		$(function() {
			setTimeout(function() {
				$(".alert").toggle("blind");
			}, 3000);
		});
	</script>
<?php endif ?>
