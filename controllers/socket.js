var db = require('../models/db');

const winston = require('winston');
winston.level = 'silly';

const refreshRate = 1000 * 6; // in ms.  

// Setup cache 
var cached = {
    time:new Date(0),
    data: { _id: null,
              date: "2016-11-12T14:24:57.947Z",
              temperature: 21.125 }
};

function refreshTemp(socket) {
    var currentTime = new Date().getTime();
    var cachedTime = cached.time.getTime();

    // If the cached object is older than the refresh rate. 
    if (currentTime > cachedTime + refreshRate) {
        // Connect to db and retrieve latest element. 
        winston.log('debug', "Trying to get temp from db");
        db.getOne((err, data) => {

            if (err) {
                socket.emit('error', err);
                return winston.log('error', err);
            } 

            winston.log('debug', "Emitting temperature from db.");
            // If no errors occured emit the newest temp json. 
            socket.emit('newTemp', data);
            
            // Cache it. 
            cached = {time:new Date(), data:data};
        });

    } else {
        winston.log('debug', "Emitting temperature from cache.");
        socket.emit('newTemp', cached.data);
    }
}

function requestLongTerm(socket, n_elements) {
    db.getNElements(n_elements, (err, data) => {
        if (err) {
            socket.emit('error', err);
            return winston.log('error', err);
        } 

        winston.log("info", "Sent " + n_elements + " temperatures to server!");
        socket.emit("sentLongTerm", data);
    
    });
}

module.exports = function(http) {
    // Setup socket events.

    var io = require('socket.io')(http);

    io.sockets.on('connection', function (socket) {
        
        winston.log('info', "Client connected.");

        socket.on('refreshTemp', () => {
            refreshTemp(socket);
        });

        socket.on('requestLongTerm', (n_elements) => {
            requestLongTerm(socket, n_elements);
        })

        // Handle client disconnect. 
        socket.on('disconnect', () => {
            winston.log('info', "Client disconnected.");  
        });
    });
}
