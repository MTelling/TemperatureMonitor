let dbConnection = require('../models/mysqlDB');
let db = new dbConnection.DB();

const winston = require('winston');

const refreshRate = 1000 * 6; // in ms. 


module.exports = function(http) {
    // Setup socket events.

    var io = require('socket.io')(http);

    io.sockets.on('connection', function (socket) {
        
        winston.log('info', "Client connected.");

        socket.on('refreshTemp', () => {
            winston.log("debug", "Client requested single temp");
            db.getSingle(function(data) {
                socket.emit('newTemp', data);
            });
        });

        socket.on('request2hour', () => {
            winston.log("debug", "Client requested data for last 2 hours.");
            db.getLastHoursWithInterval(2, 5, function(data) {
                socket.emit('sent2hour', data);
            });
        });

        socket.on('request12hour', () => {
            winston.log("debug", "Client requested data for last 12 hours.");
            db.getLastHoursWithInterval(12, 30, function(data) {
                socket.emit('sent12hour', data);
            });
        });

        socket.on('request24hour', () => {
            winston.log("debug", "Client requested data for last 24 hours.");
            db.getLastHoursWithInterval(24, 60, function(data) {
                socket.emit('sent24hour', data);
            });
        });

        socket.on('request2day', () => {
            winston.log("debug", "Client requested data for last 2 days.");
            db.getLastDaysWithInterval(2, 2, function(data) {
                socket.emit('sent2day', data);
            });
        });

        socket.on('request7day', () => {
            winston.log("debug", "Client requested data for last 7 days.");
            db.getLastDaysWithInterval(7, 4, function(data) {
                socket.emit('sent7day', data);
            });
        });

        // Handle client disconnect. 
        socket.on('disconnect', () => {
            winston.log('info', "Client disconnected.");  
        });

    });
};
