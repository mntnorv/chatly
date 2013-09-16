<form class="form-horizontal" role="form" action="/login/process_password_change.php" method="post" data-validate="parsley">
	<div class="form-group">
		<label for="input_username" class="col-md-4 control-label">Old password</label>
		<div class="col-md-8">
			<input type="password" name="old_password" class="form-control" id="input_old_password" placeholder="Old password" data-required="true" />
		</div>
	</div>
	<div class="form-group">
		<label for="input_password" class="col-md-4 control-label">New password</label>
		<div class="col-md-8">
			<input type="password" name="new_password" class="form-control" id="input_new_password" placeholder="New password" data-required="true" data-minlength="8" />
		</div>
	</div>
	<div class="form-group">
		<label for="input_password" class="col-md-4 control-label">Confirm password</label>
		<div class="col-md-8">
			<input type="password" name="new_password_confirm" class="form-control" id="input_new_password_confirm" placeholder="Confirm new password" data-required="true" data-minlength="8" data-equalto="#input_new_password" />
		</div>
	</div>
	<div class="form-group">
		<div class="col-md-offset-4 col-md-8">
			<button type="submit" class="btn btn-block">Change password</button>
		</div>
	</div>
</form>