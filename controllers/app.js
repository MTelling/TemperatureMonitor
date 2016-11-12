// Init express and socket io. 
var app = require('express')();
var http = require('http').Server(app);
var constants = require('../helpers/constants');
// Setup socket connection.  
var socket = require('./socket')(http);

// Setup logging
const winston = require('winston');
winston.level = 'info';

// From here on node.js
// Setup routes
app.get('/', function(req, res){
    res.sendFile(constants.PATH + "/views/index.html");
});

// Make the app listen on given port. 
http.listen(constants.SERVER_PORT, function (){
    console.log('listening on port:', constants.SERVER_PORT);
});

