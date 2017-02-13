

// This is awesome from:
// http://stackoverflow.com/questions/8089875/show-a-leading-zero-if-a-number-is-less-than-10
var pad = function (n) {
    return (n < 10) ? ("0" + n) : n;
}

var updateChart = function(labels, temps, humidities) {
    Chart.defaults.global.tooltips.enabled = false;
    var chart1 = document.getElementById("line-chart");
    window.myLine = new Chart(chart1, {
        type : 'line',
        showTooltips: false,
        data: {
            labels : labels,
            datasets : [
                {
                    label: "Temperature",
                    backgroundColor: "rgba(48, 164, 255, 0.1)",
                    borderColor: "rgba(48, 164, 255, 1)",
                    data : temps,
                    yAxisID: "y-axis-temp",
                    lineTension: 0.2,
                    pointRadius: 0,
                    pointHoverRadius: 0

                },
                {
                    label: "Humidity",
                    backgroundColor: "rgba(91, 97, 120, 0.1)",
                    borderColor: "rgba(91, 97, 120, 0.5)",
                    data : humidities,
                    yAxisID: "y-axis-humidity",
                    lineTension: 0.0,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }
            ]
        },
        options: {
            scales: {
                
                yAxes: [{
                    type: "linear",
                    position: "left",
                    id: "y-axis-temp",
                }, {
                    type: "linear",
                    position: "right",
                    id: "y-axis-humidity",
                }],
            }
        }


    });
} 


