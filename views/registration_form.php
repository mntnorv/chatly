<form class="form-horizontal" role="form" action="/login/process_registration.php" method="post" data-validate="parsley">
	<div class="form-group">
		<label for="input_username" class="col-md-4 control-label">Username</label>
		<div class="col-md-8">
			<input type="text" name="username" class="form-control" id="input_username" placeholder="Username" data-required="true" data-minlength="4" data-remote="login/check_username.php" data-remote-method="POST" />
		</div>
	</div>
	<div class="form-group">
		<label for="input_password" class="col-md-4 control-label">Password</label>
		<div class="col-md-8">
			<input type="password" name="password" class="form-control" id="input_password" placeholder="Password" data-required="true" data-minlength="8" />
		</div>
	</div>
	<div class="form-group">
		<label for="input_password" class="col-md-4 control-label">Confirm password</label>
		<div class="col-md-8">
			<input type="password" name="password_confirm" class="form-control" id="input_password_confirm" placeholder="Confirm password" data-required="true" data-minlength="8" data-equalto="#input_password" />
		</div>
	</div>
	<div class="form-group">
		<div class="col-md-offset-4 col-md-8">
			<button type="submit" class="btn btn-primary btn-block btn-lg">Register</button>
		</div>
	</div>
</form>