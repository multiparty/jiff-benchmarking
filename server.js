var express = require('express');
var app = express();
var http = require('http').Server(app);

// Serve static files.
http.listen(8080, function () {
  console.log('listening on *:8080');
  require('./repl')(server_instance);
});

// Set up server as a party for MPC
var jiff = require('./jiff/lib/jiff-server.js');
var server_instance = jiff.make_jiff(http, {
  logs: false,
  sodium: false
});