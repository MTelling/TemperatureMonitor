var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var assert = require('assert');

// Constants related to server connection. 
const SERVER_IP = '192.168.0.101';
const PORT = '27017';
const DB_NAME = 'temperature_collection';
const COLLECTION = 'temperatures';

// Initialise connection to server
var url = 'mongodb://' + SERVER_IP + ':' + PORT + '/' + DB_NAME

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
            //console.dir(doc);
            temps.push(doc);
        } else {
            callback(temps);
        }
    });
}

module.exports.get = function(n_elements) {
    MongoClient.connect(url, (err, db) => {
        assert.equal(null, err);
        findTemperatures(db, n_elements, (temps) => {
            db.close();
            return temps;
        });
    });
}

