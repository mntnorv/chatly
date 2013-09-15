function formhash(form, password) {
	// Create a new element input, this will be out hashed password field.
	var p = document.createElement("input");
	// Add the new element to our form.
	form.appendChild(p);
	p.name = "password_hash";
	p.type = "hidden"
	p.value = hex_sha512(password.value);
	// Make sure the plaintext password doesn't get sent.
	password.value = "";
	// Return true to allow the form to be submitted
	return true;
}
