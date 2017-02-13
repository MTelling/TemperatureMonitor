exports.DB = function DB() {
    this.mysql = require('mysql');
    this.secret = require('./secret');
    this.connection = this.mysql.createConnection({
        host     : 'localhost',
        user     : this.secret.DB_USER,
        password : this.secret.DB_PASSWORD,
        database : 'monitordb'
    });   
};

exports.DB.prototype.getSingle = function(callback) {
    sql = `
        SELECT * 
        FROM Reading 
        ORDER BY date DESC 
        LIMIT 1;
    `;

    this.connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        callback(results[0]);
    });
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

    this.connection.query("SET sql_mode = ''", function(error, results, fields) {
        if (error) throw error;
    });

    this.connection.query(sql, function(error, results, fields) {
        if (error) throw error;
        callback(results);
    });
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

    this.connection.query("SET sql_mode = ''", function(error, results, fields) {
        if (error) throw error;
    });

    this.connection.query(sql, function(error, results, fields) {
        if (error) throw error;
        callback(results);
    });
};



