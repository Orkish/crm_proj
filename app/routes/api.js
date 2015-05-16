var bodyParser = require('body-parser') 	// get body-parser
		,User = require( '../models/user' )
		,jwt = require( 'jsonwebtoken' )
		,config = require( '../../config' );

// secret for creating tokens
var sooperSecret = config.secret;

module.exports = function( app, express ) {
	// instance of express router
	var apiRouter = express.Router();

	// route for authenticating users
	// this step has to has to go after the Router() is defined
	// route to authenticate users POST ../api/authenticate
	apiRouter.post( '/authenticate', function( req, res ) {
		// find the user - select name, username and password explicitly
		User.findOne({
			username: req.body.username
		}).select( 'name username password' ).exec( function( err, user ) {
			if( err ) throw err;
			// no user with that username was found
			if( !user ) {
				res.json({
					success: false
					,message: 'Authentication failed bruhhhh, User not found'
				});
			} else if( user ) {
				// check if password matches
				var validPassword = user.comparePassword( req.body.password );
				if( !validPassword ) {
					res.json({
						success: false
						,message: 'Authentication failed, wrong password bruhhh'
					});
				} else {
					// if user is found and password is right
					// create a token
					var token = jwt.sign({
						name: user.name
						,username: user.username
					}, sooperSecret, {
						expiresInMinutes: 1440 // expires in 24 hours
					});
					res.json({
						success: true
						,message: 'You got a token bruh, enjoy!'
						,token: token
					});
				}
			}
		});
	});

	// middleware to use for CRUD requests
	apiRouter.use( function( req, res, next ) {
		console.log( 'User just came from our app' );
		// more middleware
		// authenticate users via token
		var token = req.body.token || req.query.token || req.headers['x-access-token'];
		
		// deode token
		if( token ) {
			// verifies secret and checks exp
			jwt.verify( token, sooperSecret, function( err, decoded ) {
				if( err ) {
					return res.status( 403 ).send({
						success: false
						,message: 'Failed to authenticate token bruhhh'
					});
				} else {
					// if everything is good, save to request for use in other routes
					req.decoded = decoded;
					next();
				}
			});
		} else {
			// if there is no token
			// return an HTTP response of 403 - access forbidden and an error message
			return res.status( 403 ).send({
				success: false
				,message: 'No token provided bruhhh'
			});
		}

	});

	// testing route @ GET http://localhost:8080/api
	apiRouter.get( '/', function( req, res ) {
		res.json({ 
			message: 'woop woop! welcome to the api!' 
		});
	});

	// moar routes will go here

	// routes taht end in /users
	apiRouter.route( '/users' )
		// create a user - accessed at POST .../users
		.post( function( req, res ) {
			// create new instance of the User model
			var user = new User();

			// set users info - comes from the request 
			user.name = req.body.name;
			user.username = req.body.username;
			user.password = req.body.password;

			// save the user and check for errors
			user.save( function( err ) {
				if( err ) {
					// duplicate entry
					if( err.code == 11000 )
						return res.json({
							success: false
							,message: 'A user already has that username bruhhh'
						});
					else
						return res.send( err );
				}
				res.json({
					message: 'User successfully created!'
				});
			});
		})
		// get all users - accessed at GET ../api/users
		.get( function( req, res ) {
			User.find( {}, function( err, users ) {
				if( err ) res.send( err );

				// return users
				res.json( users );
			});
		}); 

	// routes for specific user id - ending with /users/:user_id
	apiRouter.route( '/users/:user_id' )
		// get user with that specific id - :user_id
		.get( function( req, res ) {
			User.findById( req.params.user_id, function( err, user ) {
				if( err ) res.send( err );
				res.json( user );
			});
		})
		// update users with specific id
		// accessed with PUT ../api/users/:user_id
		.put( function( req, res ) {
			User.findById( req.params.user_id, function( err, user ) {
				if( err ) res.send( err );
				
				// update the user only if info is new
				if( req.body.name ) user.name = req.body.name;
				if( req.body.username ) user.username = req.body.username;
				if( req.body.password ) user.password = req.body.password;

				// save the user
				user.save( function( err ) {
					if( err ) res.send( err );

					res.json({
						message: "The User has been updated bruhh"
					});
				});
			});
		})
		// delete user with specific id
		.delete( function( req, res ) {
			User.remove({
				_id: req.params.user_id
			}, function( err, user ) {
				if( err ) res.send( err );

				res.json({
					message: "You have deleted the User bruhhh"
				});
			});
		});

	// api endpoint to get user information
	apiRouter.get( '/me', function( req, res ) {
		res.send( req, decoded );
	});
	
	return apiRouter;
};

