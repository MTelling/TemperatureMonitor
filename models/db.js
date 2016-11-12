// Init mongodb connection
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var assert = require('assert');
const constants = require('../helpers/constants');

var url = 'mongodb://' + constants.DB_IP + ':' + constants.DB_PORT + '/' + constants.DB_NAME


module.exports = {
    getOne: function(callback) {
        MongoClient.connect(url, (err, db) => {
            if (err) callback(err, null);
            findOneTemperature(db, callback);
        });
    },

    getNElements: function(n_elements, callback) {
        MongoClient.connect(url, (err, db) =>{
            if (err) callback(err, null);
            findNTemperatures(n_elements, db, callback);
        })
    }
}

// Query server
function findNTemperatures (n_elements, db, callback) {
        var cursor = db.collection(constants.COLLECTION)
            .find()
            .sort({_id: -1})
            .limit(n_elements);

        var temps = [];

        cursor.each((err, doc) => {
            if (doc != null) {
                temps.push(doc);
            } else {
                callback(null, temps);
            }
        });
}

function findOneTemperature (db, callback) {
    // Get latest temperature from db. 
    var collection = db.collection(constants.COLLECTION);
    let cursor = collection.find().limit(1).sort({_id: -1});

    cursor.toArray((err, data) => {
        callback(err, data[0]);
    });
}
