// CALLING OUR PACKAGES 
var express = require( 'express' ) // call express
		,app = express() // define our app using express
		,bodyParser = require( 'body-parser' ) // get body-parser
		,morgan = require( 'morgan' ) // used to see requests
		,mongoose = require( 'mongoose' ) // communicating with db
		,config = require( './config' )
		,path = require( 'path' );

// APP CONFIGS
// .use() is using middleware
// use body parser to grab info from POST requests
app.use( bodyParser.urlencoded({ extended: true }) );
app.use( bodyParser.json() );

// config CORS handler
app.use( function( req, res, next ) {
	res.setHeader( 'Access-Control-Allow-Origin', '*' );
	res.setHeader( 'Access-Control-Allow-Origin', 'GET, POST' );
	res.setHeader( 'Access-Control-Allow-Origin', 'X-Requested-With,content-type, Authorization' );
	next();
});

// logging reqs to console 
app.use( morgan('dev') );

// connect to db hosted locally first_crud
mongoose.connect( config.database );


// set static files location
// used for requests that our frontend will make
app.use(express.static(__dirname + '/public'));

// ROUTES FOR API
// API Routes
var apiRoutes = require( './app/routes/api' )( app, express );
app.use( '/api', apiRoutes );

// MAIN CATCHALL ROUTE
// Sends users to frontend
// has to be registered AFTER API Routes
app.get( '*', function( req, res ) {
	res.sendFile( path.join( __dirname + '/public/app/views/index.html' ));
});

// route to get user information
// apiRouter.get( '/me', function( req, res ) {
// 	res.send( req.decoded );
// });

// Starting the server
app.listen( config.port );
console.log( 'Shit happening magically on port ' + config.port );



