var db = require('../models/db');

const winston = require('winston');

const refreshRate = 1000 * 6; // in ms. 

// Setup cache 
var cached = {
    time:new Date(0),
    data: { _id: null,
              date: "2016-11-12T14:24:57.947Z",
              temperature: 21.125 }
};

var cached_latest24 = {};

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

function getLatest24(socket) {

    // Try to get data from cache. 
    // If it's not available query db for it. 
    // Currently this returns cached data if the hour or date hasn't changed.

    if (!cached_latest24) {
        queryDBForLatest24(socket);
    } else {
        if (cached_latest24.hour != new Date().getHours()
            || cached_latest24.day != new Date().getDate()) {
            queryDBForLatest24(socket);
        } else {
            winston.log("info", "Emitting cached data for latest 24 hours!");
            socket.emit('sentLatest24', cached_latest24.data);
        }
    }
}

function queryDBForLatest24(socket) {
    db.get24((err, data) => {
            if (err) return winston.log("error", err);

            winston.log("info", "Emitting DB data for latest 24 hours!");

            var currentDate = new Date();
            cached_latest24 = {
                hour: currentDate.getHours(),
                day: currentDate.getDate(),
                data: data
            };

            socket.emit('sentLatest24', data);
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

        socket.on('requestLatest24', () => {
            winston.log("Debug", "Client requested data for last 24 hours.");
            getLatest24(socket);
        })

        // Handle client disconnect. 
        socket.on('disconnect', () => {
            winston.log('info', "Client disconnected.");  
        });

    });
}
