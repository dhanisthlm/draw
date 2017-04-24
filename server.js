var express = require('express');
var app     = express();
var server  = app.listen(4444);
var io      = require('socket.io').listen(server);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

io.on('connection', function (socket) {

	socket.on('update drawing', function (data) {
		io.emit('update drawing', data);
	});
});