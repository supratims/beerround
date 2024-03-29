
var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
var DM = require('./modules/drinks-manager');

module.exports = function(app) {

// main login page //

	app.get('/', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { title: 'Hello - Please Login To Your Account' });
		}	else{
	// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){				
				if (o != null){
				    req.session.user = o;
					res.redirect('/home');
				}	else{
					res.render('login', { title: 'Hello - Please Login To Your Account' });
				}
			});
		}
	});
	
	app.post('/', function(req, res){
		AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			}	else{
			    req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.send(o, 200);
			}
		});
	});

// logged-in user homepage //
	
	app.get('/home', function(req, res) {
	    if (req.session.user == null){	
	        res.redirect('/');
	    } else{			
			res.render('home', {
				title : 'Home',				
				udata : req.session.user
			});					
	    }
	});
	
	app.post('/home', function(req, res) {
	    res.render('home');
	});	

	app.get('/groups', function(req, res) {
	    if (req.session.user == null){	
	        res.redirect('/');
	    } else{
			DM.getGroupList(req.session.user._id, function(list, e) {
				res.render('groups', {
					title : 'Groups',				
					udata : req.session.user,
					groups: list
				});
			});			
	    }
	});		

	app.post('/groups', function(req, res) {
	    res.render('groups');
	});	
	
	
// profile page //
	
	app.get('/profile', function(req, res) {
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{
			res.render('profile', {
				title : 'Control Panel',
				countries : CT,
				udata : req.session.user
			});
	    }
	});
	
	app.post('/profile', function(req, res){
		if (req.param('user') != undefined) {
			AM.updateAccount({
				user 		: req.param('user'),
				name 		: req.param('name'),
				email 		: req.param('email'),
				country 	: req.param('country'),
				pass		: req.param('pass')
			}, function(e, o){
				if (e){
					res.send('error-updating-account', 400);
				}	else{
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.send('ok', 200);
				}
			});
		}	else if (req.param('logout') == 'true'){
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function(e){ res.send('ok', 200); });
		}
	});
	
// creating new accounts //
	
	app.get('/signup', function(req, res) {
		res.render('signup', {  title: 'Signup', countries : CT });
	});
	
	app.post('/signup', function(req, res){
		AM.addNewAccount({
			name 	: req.param('name'),
			email 	: req.param('email'),
			user 	: req.param('user'),
			pass	: req.param('pass'),
			country : req.param('country')
		}, function(e){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
			}
		});
	});

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.param('pass');
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				res.send('ok', 200);
			}	else{
				res.send('unable to update password', 400);
			}
		})
	});
	
// view & delete accounts //
	
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { title : 'Account List', accts : accounts });
		})
	});
	
	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
	            req.session.destroy(function(e){ res.send('ok', 200); });
			}	else{
				res.send('record not found', 400);
			}
	    });
	});

	app.post('/add/group', function(req, res){	
		DM.addGroup({userId: req.body.userId, groupName:req.body.groupName}, function(e, obj){
			if (obj) {				
				DM.getGroupList(req.session.user._id, function(list, e) {
					res.send(list);
				});		
			} else {
				res.send(error, 400);
			}				
	    });
	});

	app.get('/get/groups', function(req, res){	

		DM.getGroupList(req.session.user._id, function(list, e) {
			res.send(list);
		});	
	});
	
	app.get('/get/group', function(req, res){
		DM.getGroup(req.query.id, function(grp, e) {
			res.send(grp);
		});	
	    
	});

	app.get('/get/default-group', function(req, res){
		DM.getDefaultGroup(req.session.user._id, function(grp, e) {
			if (grp) {
				res.send(grp);
			} else {
				res.send({});
			}			
		});
	    
	});


	app.post('/add/people', function(req, res){
		DM.addPeople(req.body.id, req.body.name, function(grp, e) {
			if (grp) {
				DM.getGroup(req.body.id, function(grp, e) {
					res.send(grp);
				});	
			} else {
				res.send(e, 400);
			}	
		});	
	    
	});
	app.post('/remove/people', function(req, res){
		DM.removePeople(req.body.id, req.body.peopleId,  function(grp, e) {
			if (grp) {
				DM.getGroup(req.body.id, function(grp, e) {
					res.send(grp);
				});	
			} else {
				res.send(error, 400);
			}	
		});	
		    
	});

	app.post('/add/drink', function(req, res){
		DM.addDrink(req.body.id, req.body.peopleId, function(grp, e) {
			if (grp) {
				DM.getGroup(req.body.id, function(grp, e) {
					res.send(grp);
				});	
			} else {
				res.send(e, 400);
			}	
		});	
	    
	});
	app.post('/remove/drink', function(req, res){
		DM.removeDrink(req.body.id, req.body.peopleId,  function(grp, e) {
			if (grp) {
				DM.getGroup(req.body.id, function(grp, e) {
					res.send(grp);
				});	
			} else {
				res.send(error, 400);
			}	
		});	
		    
	});

	
	app.get('/group/:id', function(req, res){		
		res.render('group', {
			title : 'Group Page',				
			udata : req.session.user,
			groupId: req.params.id
		});   
	});	
	
	app.post('/remove/group', function(req, res){	
		DM.removeGroup(req.body.groupId, function(e, obj){
			if (obj) {				
				DM.getGroupList(req.session.user._id, function(list, e) {					
					res.send(list);
				});
			} else {
				res.send(e, 400);
			}				
	    });
	});

	app.post('/update-toggle/group', function(req, res){	
		DM.updateToggleGroup(req.body.groupId, req.body.value, function(e, obj){
			if (obj) {				
				DM.getGroupList(req.session.user._id, function(list, e) {					
					res.send(list);
				});
			} else {
				res.send(e, 400);
			}				
	    });
	});
	
	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};