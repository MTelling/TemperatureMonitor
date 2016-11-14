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

    get24: function(callback) {
        MongoClient.connect(url, (err,db) => {
            if (err) callback(err, null);

            find24(db, callback);
        })
    }
}

function findOneTemperature (db, callback) {
    // Get latest temperature from db. 
    var collection = db.collection(constants.COLLECTION);
    let cursor = collection.find().limit(1).sort({_id: -1});

    cursor.toArray((err, data) => {
        callback(err, data[0]);
    });
}

function find24 (db, callback) {

    // Get all data from past 24 hours. 
    var lastDate = new Date();
    lastDate.setHours(lastDate.getHours() - 24);

    var collection = db.collection(constants.COLLECTION);
    let cursor = collection.find({
        date: { '$gte': lastDate }
    });

    cursor.toArray((err, data) => {

        // Calculate the average of all data of each hour
        // over the last 24 hours. 

        // It's not the best algorithm, but it's still O(n) time.
        // Could probably be improved though. 

        var tempDict = {};
        var counterDict = {};
        // Loop through all data. 
        for (var i = 0; i < data.length; i++) {

            // Generate the key from the date of the doc.
            var currDate = new Date(data[i].date)
            var currKey = currDate.getDate() + "/" + currDate.getMonth() + " " + currDate.getHours() + ":00";
            if (tempDict.hasOwnProperty(currKey)) {
                // Sum up the temperatures, and keep track of how many per day.
                tempDict[currKey] += data[i].temperature;
                counterDict[currKey] += 1;
            } else {
                // Init dictionary. 
                tempDict[currKey] = data[i].temperature;
                counterDict[currKey] = 1;
            }
        }

        // Now calculate averages. 
        for (var key in tempDict) {
            tempDict[key] /= counterDict[key];
        }

        callback(null, tempDict);
    });
}
