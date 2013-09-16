<form class="form-horizontal" role="form" action="/login/process_login.php" method="post" data-validate="parsley">
	<div class="form-group">
		<label for="input_username" class="col-md-4 control-label">Username</label>
		<div class="col-md-8">
			<input type="text" name="username" class="form-control" id="input_username" placeholder="Username" data-required="true" />
		</div>
	</div>
	<div class="form-group">
		<label for="input_password" class="col-md-4 control-label">Password</label>
		<div class="col-md-8">
			<input type="password" name="password" class="form-control" id="input_password" placeholder="Password" data-required="true" />
		</div>
	</div>
	<div class="form-group">
		<div class="col-md-offset-4 col-md-8">
			<button type="submit" class="btn btn-primary btn-block btn-lg">Sign in</button>
		</div>
	</div>
</form>