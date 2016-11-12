var socket = io();
var temp = document.getElementById('temperature');

var requestNew = function() {
    console.log("Requesting new temp.");
    socket.emit("refreshTemp");
};

// Request new data immediately at first connection.
requestNew();

const interval = 1000 * 3 // 1000ms * x

setInterval(function() { requestNew() }, interval);


var last = {};
socket.on('newTemp', (data) => {
    console.log("Received data.");
    temperature.innerText = data.temperature;
    time.innerText = new Date(data.date);
    console.log("Last:" + last.date);
    console.log("Current:" + data.date);
    if (last.date != data.date) {
        updated.innerText = "Updated!";
        last = data;
    } else {
        updated.innerText = "";
    }
});