
socket.emit('requestLatest24');

socket.on("sentLatest24", (data) => {
    console.dir(data);

    var my_labels = [];
    var my_temps = [];
    
    for (var key in data) {
        my_labels.push(key.split(" ")[1]);
        my_temps.push(data[key].toFixed(2));
    }

    var lineChartData = {
        labels : my_labels,
        type : 'line',
        datasets : [
            {
                label: "24 hour temperature graph",
                fillColor : "rgba(48, 164, 255, 0.1)",
                strokeColor : "rgba(48, 164, 255, 1)",
                data : my_temps
            }
        ]

    }

    var chart1 = document.getElementById("line-chart").getContext("2d");
    window.myLine = new Chart(chart1).Line(lineChartData, {
        responsive: true
    });
});






