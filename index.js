// Init mongodb connection
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var assert = require('assert');

// Init express and socket io. 
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Setup logging
const winston = require('winston');
winston.level = 'debug';

// Constants related to server connection. 
const DB_IP = '192.168.0.101';
const DB_PORT = '27017';
const DB_NAME = 'temperature_collection';
const COLLECTION = 'temperatures';
const SERVER_PORT = 3000;

// Initialise url to server.
var url = 'mongodb://' + DB_IP + ':' + DB_PORT + '/' + DB_NAME

// From here on node.js
// Setup routes
app.get('/', function(req, res){
    res.sendfile("./index.html");
});

// Make the app listen on given port. 
http.listen(SERVER_PORT, function (){
    console.log('listening on *:3000');
});

// Setup cache and refresh rate. 
var cached;
const refreshRate = 1000 * 20; // in ms.  


// Setup socket events.
io.sockets.on('connection', function (socket) {
    
    winston.log('info', "Client connected.");

    socket.on('refreshTemp', () => {

        var currentTime = new Date().getTime();
        var cachedTime = cached.time.getTime();

        // If the cached object is older than the refresh rate. 
        if (currentTime > cachedTime + refreshRate) {
            // Connect to db and retrieve latest element. 

            MongoClient.connect(url, (err, db) => {
                if (err) {
                    socket.emit('error', err);
                    return winston.log('error', err);
                }

                // Get latest temperature from db. 
                var collection = db.collection(COLLECTION);
                var cursor = collection.find().limit(1).sort({_id: -1});

                cursor.toArray((err, data) => {
                    if (err) {
                        socket.emit('error', err);
                        return winston.log('error', err);
                    } 
                    
                    winston.log('debug', "Emitting temperature from db.");

                    // If no errors occured emit the newest temp json. 
                    socket.emit('newTemp', data[0]);
                    
                    // Cache it. 
                    cached = {time:new Date(), data:data[0]};
                
                    db.close();

                })
            });

        } else {
            winston.log('debug', "Emitting temperature from cache.");
            socket.emit('newTemp', cached.data);
        }
    });


    socket.on('requestLongTerm', (n_elements) => {

        MongoClient.connect(url, (err, db) => {
                if (err) {
                    socket.emit('error', err);
                    return winston.log('error', err);
                }

                // Get latest 400 temperatures from db. 
                var collection = db.collection(COLLECTION);
                findTemperatures(db, n_elements, (temps) => {
                    winston.log('debug', "Emitting latest temps.");
                    socket.emit('sentLongTerm', temps);
                });

            });
    })


    // Handle client disconnect. 
    socket.on('disconnect', () => {
        winston.log('info', "Client disconnected.");  
    });



});



// Query server
var findTemperatures = function(db, n_elements, callback) {
    
    var cursor = db.collection(COLLECTION)
        .find()
        .sort({_id: -1})
        .limit(n_elements);

    var temps = [];

    cursor.each((err, doc) => {
        assert.equal(null, err);
        if (doc != null) {
            temps.push(doc);
        } else {
            callback(temps);
        }
    });
}


