exports.DB = function DB() {
    this.MongoClient = require('mongodb').MongoClient;
    this.ObjectId = require('mongodb').ObjectId;
    this.constants = require('../helpers/constants');

    this.url = 'mongodb://' + this.constants.DB_IP + ':' + this.constants.DB_PORT + '/' + this.constants.DB_NAME
};

// Queries DB for a single temperature and returns to callback.
exports.DB.prototype.getOne = function(callback) {
    this.MongoClient.connect(this.url, (err, db) => {
        if (err) callback(err, null);
        findOneTemperature(db, callback);
    });
};

// Queries DB for 24 hours of data and returns to callback.
exports.DB.prototype.get24 = function(callback) {
    this.MongoClient.connect(this.url, (err,db) => {
        if (err) callback(err, null);

        find24(db, callback);
    })
};

// Uses a database connection to find latest temperature.
let findOneTemperature = function (db, callback) {
    // Get latest temperature from DB.
    let collection = db.collection(constants.COLLECTION);
    let cursor = collection.find().limit(1).sort({_id: -1});

    cursor.toArray((err, data) => {
        callback(err, data[0]);
    });
};

// Uses a database connection to find temperatures for the past 24 hours.
let find24 = function (db, callback) {

    // Get all data from past 24 hours.
    let lastDate = new Date();
    lastDate.setHours(lastDate.getHours() - 24);

    let collection = db.collection(constants.COLLECTION);
    let cursor = collection.find({
        date: { '$gte': lastDate }
    });

    cursor.toArray((err, data) => {
        if (err) callback(err, data);

        // Calculate the average of all data of each hour
        // over the last 24 hours.

        // It's not the best algorithm, but it's still O(n) time.
        // Could probably be improved though.

        let tempDict = {};
        let counterDict = {};
        // Loop through all data.
        for (let i = 0; i < data.length; i++) {

            // Generate the key from the date of the doc.
            let currDate = new Date(data[i].date)
            let currKey = currDate.getDate() + "/" + currDate.getMonth() + " " + currDate.getHours() + ":00";
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
        for (let key in tempDict) {
            tempDict[key] /= counterDict[key];
        }

        callback(null, tempDict);
    });
};

