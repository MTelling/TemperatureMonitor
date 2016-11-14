var socket = io();

var requestNew = function() {
    console.log("Requesting new temp.");
    socket.emit("refreshTemp");
};

// Request new data immediately at first connection.
requestNew();

// Get DOM elements. 
var updatedSeconds = document.getElementById("updated-seconds");
var updatedTime = document.getElementById("updated-time");

// Constants for how often to update. 
const refreshRate = 5; // Seconds between each refresh. 
const interval = 1000 * refreshRate // 1000ms * refreshRate. 

// Cache the latest element. 
var cache = {};

socket.on('newTemp', (data) => {
    console.log("Received data.");

    /* If data received is different from the cached
     * update the cache and tell system that new data is received.
     * 
     * Also format the date as a string and display that. */
    
    if (cache.date != data.date) {
        console.log("Updated!");
        cache = data;
        updateTempGauge(data.temperature);
        secondsSinceUpdate = 0;

        var date = new Date(cache.date);
        var strDate = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        updatedTime.innerText = strDate;
    } 

    // Set the updated seconds label in the heading. 
    var currentTime = new Date().getTime() / 1000;
    var cachedTime = new Date(cache.date).getTime() / 1000;
    updatedSeconds.innerText = (currentTime - cachedTime).toFixed(0) ;
});

// Setup listener loop 
setInterval(function() { requestNew() }, interval);
