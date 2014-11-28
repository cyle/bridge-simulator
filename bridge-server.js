/*

	STARSHIP BRIDGE SIMULATOR
		a CyleSoft production
	
	socket.io docs: http://socket.io/docs/
	express 4.x docs: http://expressjs.com/4x/api.html

*/

// load all required libs
var uuid = require('node-uuid');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// game speed
var game_speed = (1/30) * 1000; // 30fps to ms interval

// hold onto different "rooms" for each group
var ships = [];

// for now there's only one bridge
ships.push( new Ship("Enterprise-F") );
console.log(ships);

// serve static files from webroot
app.use(express.static('webroot'));

// express crap, serve the index page
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/webroot/index.html');
});

// do stuff for connected sockets
io.on('connection', function(socket) {
	
	socket.on('ready', function(data) {
		console.log('new READY! event received');
		console.log(data);
		// join default bridge
		socket.join(ships[0].uuid);
		// send to the socket that they've joined
		socket.emit('joined-bridge', { "uuid": ships[0].uuid, "name": ships[0].name });
		if (data.station == "helm") {
			socket.emit('current-status', {
				"current_hp": ships[0].current_hp,
				"current_sp": ships[0].current_sp,
				"current_energy": ships[0].current_energy,
				"max_hp": ships[0].max_hp,
				"max_sp": ships[0].max_sp,
				"max_energy": ships[0].max_energy,
				"current_speed": ships[0].current_speed,
				"max_speed": ships[0].max_speed,
				"min_speed": ships[0].min_speed,
				"current_pitch": ships[0].current_pitch,
				"current_yaw": ships[0].current_yaw,
				"current_position": ships[0].position,
				"statuses": ships[0].statuses,
				"toggles": ships[0].toggles
			});
		}
	});
	
	// send to just this one socket
	// socket.emit('new event name', { "whatever": "huhhh?" });
	
	// send to everyone connected
	// io.emit('another event name', msg);
	
	// send to everyone in one room
	// io.to('room ID').emit('some event');
	
	// respond to an event from the socket
	// socket.on('event name', function(data) {  });
	
	// update speed based on input
	socket.on('change-speed', function(data) {
		console.log('new change-speed event received');
		console.log(data);
		for (var i = 0; i < ships.length; i++) {
			if (ships[i].uuid == data.uuid) {
				ships[i].change_speed(data.speed);
			}
		}
	});
	
	// update pitch and/or yaw based on input
	socket.on('change-pitch-yaw', function(data) {
		console.log('new change-pitch-yaw event received');
		console.log(data);
		for (var i = 0; i < ships.length; i++) {
			if (ships[i].uuid == data.uuid) {
				ships[i].change_pitch_yaw(data.pitch, data.yaw);
			}
		}
	});
	
	// update toggle based on input
	socket.on('change-toggle', function(data) {
		console.log('new change-toggle event received');
		console.log(data);
		for (var i = 0; i < ships.length; i++) {
			if (ships[i].uuid == data.uuid) {
				ships[i].change_toggle(data.key, data.val);
			}
		}
	});
	
});

// listen, duh
http.listen(33333, function() {
	console.log('Listening on *:33333');
});

/*

	game engine loop
	
*/

var last_update = Date.now();

function game_update() {
	
	var now = Date.now();
	var dt = (now - last_update)/1000;
	last_update = now;
	
	//console.log('new frame dt: ' + dt);
	
	for (var i = 0; i < ships.length; i++) {
		ships[i].update(dt);
	}
	
}

setInterval(game_update, game_speed);

/*

	send data to all clients infrequently

*/

setInterval(function() {
	for (var i = 0; i < ships.length; i++) {
		//console.log();
		io.to(ships[i].uuid).emit('current-status', { "position": ships[i].position } );
	}
}, 1000);

/*

	debugging console output

*/

setInterval(function() {
	for (var i = 0; i < ships.length; i++) {
		//console.log(ships[i].position);
	}
}, 1000);

/*

	define a ship and its functionality

*/

function Ship(name) {
	
	// ship unique ID and name
	this.uuid = uuid.v4();
	this.name = name;
	
	// overall ship stats
	this.current_hp = 100; // hull points
	this.max_hp = 100; // min hp is always 0
	this.current_sp = 100; // shield points
	this.max_sp = 100; // min sp is always 0
	this.current_energy = 100; // energy generated per second
	this.max_energy = 100; // min e is always 0
	
	// speed, in units per second
	this.current_speed = 0;
	this.max_speed = 100;
	this.min_speed = -30;
	
	// pitch and yaw, between -360 and 360 degrees
	this.current_pitch = 0;
	this.current_yaw = 0;
	
	// position in its universe
	this.position = {};
	this.position.x = 0;
	this.position.y = 0;
	this.position.z = 0;
	
	// toggles
	// if val == true, then potential bonuses/risks are calculated
	this.toggles = [
		{ "name": "Ramscoop Overdrive", "key": "ramscoop", "station": "helm", "val": false },
		{ "name": "Plasma Recycle", "key": "plasma-recycle", "station": "helm", "val": false },
		{ "name": "Impulse Afterburner", "key": "afterburner", "station": "helm", "val": false },
		{ "name": "Antimatter Overdrive", "key": "antimatter-overdrive", "station": "engineering", "val": false }
		// { "name": "", "key": "", "station": "", "val": false }
	];
	
	// warnings/statuses
	// if val == true, then it's a displayed warning status
	this.statuses = [
		{ "name": "Inertial Dampeners Offline", "key": "inertial-damp", "station": "helm", "val": false },
		{ "name": "Impulse Control Offline", "key": "impulse-control", "station": "helm", "val": false }
		// { "name": "", "key": "", "station": "", "val": false }
	]
}

Ship.prototype.change_speed = function(new_speed) {
	// modify current speed
	// interpret input
	console.log('ship ' + this.uuid + ', new speed input: ' + new_speed);
	if (new_speed.substr(new_speed.length - 1) == '%') {
		// take it as a percentage increase or decreate or absolute based on max
		new_speed = new_speed.replace('%', '');
		if (new_speed.substr(0, 1) == '+') {
			// take it as a percentage-of-max increase
			new_speed = new_speed.replace('+', '');
			this.current_speed += ((new_speed * 1)/100) * this.max_speed;
		} else if (new_speed.substr(0, 1) == '-') {
			// take it as a percentage-of-max decrease
			new_speed = new_speed.replace('-', '');
			this.current_speed -= ((new_speed * 1)/100) * this.max_speed;
		} else {
			// take it as an absolute percentage-of-max setting
			this.current_speed = ((new_speed * 1)/100) * this.max_speed;
		}
	} else {
		// take it as an increase or decrease or absolute
		if (new_speed.substr(0, 1) == '+') {
			// take it as an increase in units per second
			new_speed = new_speed.replace('+', '');
			this.current_speed += new_speed * 1;
		} else if (new_speed.substr(0, 1) == '-') {
			// take it as a decrease in units per second
			new_speed = new_speed.replace('-', '');
			this.current_speed -= new_speed * 1;
		} else {
			// take it as an absolute in units per second
			this.current_speed = new_speed * 1;
		}
	}
	// make sure speed does not go beyond min or max
	if (this.current_speed > this.max_speed) {
		this.current_speed = this.max_speed;
	} else if (this.current_speed < this.min_speed) {
		this.current_speed = this.min_speed;
	}
	console.log('ship '+this.uuid+' new speed: ' + this.current_speed);
}

Ship.prototype.change_pitch_yaw = function(new_pitch, new_yaw) {
	if (new_pitch != undefined) {
		console.log('ship ' + this.uuid + ' new pitch: ' + new_pitch);
		// process new pitch
		this.current_pitch = new_pitch * 1;
	}
	if (new_yaw != undefined) {
		console.log('ship ' + this.uuid + ' new yaw: ' + new_yaw);
		// process new yaw
		this.current_yaw = new_yaw * 1;
	}
	
	// need some way to keep this within bounds
	
}

Ship.prototype.change_toggle = function(toggle_key, toggle_val) {
	if (toggle_key == undefined || toggle_val == undefined) {
		return;
	}
	for (var i = 0; i < this.toggles.length; i++) {
		if (this.toggles[i].key == toggle_key) {
			this.toggles[i].val = toggle_val;
		}
	}
}

Ship.prototype.update = function(dt) {
	// update position over time with dt (delta time)
	var v = this.current_speed * dt;
	this.position.x += v * (Math.sin(degrees_to_radians(this.current_yaw)) * Math.cos(degrees_to_radians(this.current_pitch)));
	this.position.y += v * (Math.cos(degrees_to_radians(this.current_yaw)) * Math.cos(degrees_to_radians(this.current_pitch)));
	this.position.z += v * Math.sin(degrees_to_radians(this.current_pitch));
};

/*

	helper functions
	
*/

function degrees_to_radians(degrees) {
	return degrees * (Math.PI/180);
}

function radians_to_degrees(radians) {
	return radians * (180/Math.PI);
}