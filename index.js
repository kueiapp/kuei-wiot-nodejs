require('webduino-js');
require('webduino-blockly');
var linebot = require('linebot');
var express = require('express');

var app = express();
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080; //process.env.PORT || 3000;

// setup ports
var server_port = port;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

/** main **/
// server listens in on port
app.listen(server_port, server_ip_address, function () {
	 console.log( "Listening on " + server_ip_address + ", server_port " + server_port );
});

/** doGet **/
app.get('/', function(request, response) {
  response.send('Hello World WIoT!');
});

/** doPost **/
app.post('/commands', linebotParser);



