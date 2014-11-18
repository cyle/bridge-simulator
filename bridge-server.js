/*

	STARSHIP BRIDGE SIMULATOR
		a CyleSoft production
	
	socket.io docs: http://socket.io/docs/

*/

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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
http.listen(3000, function() {
	console.log('Listening on *:33333');
});