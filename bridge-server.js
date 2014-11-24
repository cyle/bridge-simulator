/*

	STARSHIP BRIDGE SIMULATOR
		a CyleSoft production
	
	socket.io docs: http://socket.io/docs/

*/

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// serve static files from webroot
app.use(express.static('webroot'));

// express crap, serve the index page
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/webroot/index.html');
});

// do stuff for connected sockets
io.on('connection', function(socket) {
	
	// send to just this socket
	// socket.emit('new event name', { "whatever": "huhhh?" });
	
	// respond to an event from the socket
	socket.on('event name here', function(msg) {
		// send to everyone connected
		io.emit('another event name', msg);
	});
	
});

// listen, duh
http.listen(33333, function() {
	console.log('Listening on *:33333');
});