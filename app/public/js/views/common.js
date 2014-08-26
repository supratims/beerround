$(document).ready(function(){ 
	// handle user logout //
	$('#btn-logout').click(function(){ that.attemptLogout(); });

	// handle profile link click //
	$('#btn-profile').click(function(){ window.location.href = '/profile'; });
	$('#homeNavLink').click(function(){ window.location.href = '/home'; });
	$("#addGroup").click(function() {
		window.location.href="/groups";
	});

});

function log(str) {
	var DEBUG = true;
	DEBUG && console && console.log(str);
};