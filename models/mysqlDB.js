const winston = require('winston');

exports.DB = function DB() {
    this.mysql = require('mysql');
    this.secret = require('./secret');

    this.pool = this.mysql.createPool({
        host     : 'localhost',
        user     : this.secret.DB_USER,
        password : this.secret.DB_PASSWORD,
        database : 'monitordb'
    });   
};

/**
 * Gets a connection from the db pool,
 * then queries the db and if no error occurs,
 * hands back the connection to the pool and
 * calls the callback with the result. 
 */
exports.DB.prototype.query = function(sql, callback) {
    this.pool.getConnection(function(err, connection) {
        if (err) {
            winston.log('warn', "Failed getting connection from db pool: " + err.message);
            callback(err, null);
            return;
        }

        connection.query("SET sql_mode = ''", function(error, results, fields) {
            if (error) winston.log("warn", "Couldn't set sql mode: " + err.message);
        });

        connection.query(sql, function(err, results, fields) {
            connection.release();
            if (err) {
                winston.log('warn', "Failed on query! " + sql);
                winston.log('warn', err.message);
                callback(err, null);
                return;
            };

            callback(null, results);
        });

    });
};

exports.DB.prototype.getSingle = function(callback) {
    sql = `
        SELECT * 
        FROM Reading 
        ORDER BY date DESC 
        LIMIT 1;
    `;

    this.query(sql, callback);
};

exports.DB.prototype.getLastHoursWithInterval = function(hours, minuteInterval, callback) {
    sql = `
        SELECT  date,
                HOUR(date) as hour,
                FLOOR(MINUTE(date)/ ${minuteInterval}) * ${minuteInterval} as minute,
                AVG(temp) as temp,                 
                AVG(humidity) as humidity              
        FROM Reading 
        WHERE date >= now() - INTERVAL ${hours} HOUR 
        GROUP BY hour, minute
        ORDER BY date;
    `;

    this.query(sql, callback);
};

exports.DB.prototype.getLastDaysWithInterval = function(days, hourInterval, callback) {
    sql = `
         SELECT date,
                DAY(date) as day,
                FLOOR(HOUR(date) / ${hourInterval}) * ${hourInterval} as hour,
                AVG(temp) as temp,                 
                AVG(humidity) as humidity              
        FROM Reading 
        WHERE date >= now() - INTERVAL ${days} DAY 
        GROUP BY day, hour
        ORDER BY date;
    `;

    this.query(sql, callback);
};



