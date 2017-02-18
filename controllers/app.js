// Init express and socket io. 
var express = require('express');
var app = express();
var http = require('http').Server(app);
// Setup socket connection.  
var socket = require('./socket')(http);

const PORT = 3000;

// Setup logging
const winston = require('winston');
winston.level = 'silly';


app.use('/static', express.static('public'));

// From here on node.js
// Setup routes
app.get('/', function(req, res){
    res.sendFile(process.cwd() + "/views/index.html");
});

// Make the app listen on given port. 
http.listen(PORT, function (){
    console.log('listening on port:', PORT);
});

