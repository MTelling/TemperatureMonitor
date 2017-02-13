$( document ).ready(function () {
    
    var socket = io();

    // Constants for how often to update. 
    const refreshRate = 100; // Seconds between each refresh. 
    const interval = 1000 * refreshRate // 1000ms * refreshRate. 
    
    // Get DOM elements. 
    var updatedSeconds = document.getElementById("updated-seconds");
    var updatedTime = document.getElementById("updated-time");
    
    var requestNew = function() {
        console.log("Requesting new temp.");
        socket.emit("refreshTemp");
    };
    
    // Setup graph
    const graphOptions = [{"key":'request2hour', "text":"2 hours"}, 
                          {"key":'request12hour', "text":"12 hours"}, 
                          {"key":'request24hour', "text":"24 hours"},
                          {"key":'request2day', "text":"2 days"},
                          {"key":'request7day', "text":"7 days"}];

    var graphIntervalText = document.getElementById("graph-interval");
    var graphIntervalSelector = document.getElementById("graph-interval-selector");
    let currentGraphOption = graphOptions[graphIntervalSelector.value];

    graphIntervalSelector.addEventListener("change", function() {
        currentGraphOption = graphOptions[graphIntervalSelector.value];
        updateGraph();
    });

    var updateGraph = function() {
        socket.emit(currentGraphOption.key);
        graphIntervalText.innerText = currentGraphOption.text;
    }


    // Setup listener loop for requesting new readings and get the graph. 
    setInterval(function() { requestNew() }, interval);
    updateGraph();

    // Request new data immediately at first connection.
    requestNew();

    //////////////////////////////////////////////////////////////////////

   
    

    // Cache the latest element. 
    var cache = {};

    /**
    * This function handles the request of a single new temperature. 
    */
    socket.on('newTemp', (data) => {
        /* If data received is different from the cached
        * update the cache and tell system that new data is received.
        * 
        * Also format the date as a string and display that. */
        
        if (cache.date != data.date) {
            console.log("Updated!");
            cache = data;
            updateTempGauge(data.temp);
            updateHumidityGauge(data.humidity);
            secondsSinceUpdate = 0;

            var date = new Date(cache.date);
            var strDate = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

            updatedTime.innerText = strDate;
        } else {
            console.log("Using cached reading!");
        }

        // Set the updated seconds label in the heading. 
        var currentTime = new Date().getTime() / 1000;
        var cachedTime = new Date(cache.date).getTime() / 1000;
        updatedSeconds.innerText = (currentTime - cachedTime).toFixed(0) ;
    });



    /**
     * What follows here handles the graph.
     */

    socket.on("sent2hour", (data) => {
        updateChartData(data, formatLabelAsHours);
    });

    socket.on("sent12hour", (data) => {
        updateChartData(data, formatLabelAsHours);
    });

    socket.on("sent24hour", (data) => {
        updateChartData(data, formatLabelAsHours);
    });

    socket.on('sent2day', (data) => {
        updateChartData(data, formatLabelAsDays);
    });

    socket.on('sent7day'), (data) => {
        updateChartData(data, formatLabelAsDays);
    }

    var updateChartData = function(data, formatFunction) {
        var my_labels = [];
        var my_temps = [];
        var my_humidities = [];

        for (var i = 0; i < data.length; i++) {
            my_labels.push(formatFunction(data[i]));
            my_temps.push(data[i].temp);
            my_humidities.push(Math.floor(data[i].humidity));

        }
        updateChart(my_labels, my_temps, my_humidities);
    }

    var formatLabelAsHours = function(dataObject) {
        return pad(dataObject.hour) + ":" + pad(dataObject.minute);
    }

    var formatLabelAsDays = function(dataObject) {
        var date = new Date(dataObject.date);
        return pad(date.getDate()) + "/" + pad(date.getMonth()) + " " + pad(date.getHours()) + ":00";
    }

});

