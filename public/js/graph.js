socket.emit('requestLongTerm', 5);


socket.on('sentLongTerm', (data) => {

    var temps = [];
    var datetimes = [];
    data.forEach((datapoint) => {
        temps.push(datapoint.temperature);
        let date = new Date(datapoint.date); 
        var str_date = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        datetimes.push(str_date);
    });

    temps.reverse();
    datetimes.reverse();

    console.log(temps);
    console.log(datetimes);
    
    var data = [
      {
        y: temps,
        x: datetimes,
        type: 'line',
        line: {
            width: 1,
            shape: 'spline'
        }
      }
    ];

    TESTER = document.getElementById('tester');
    
    Plotly.plot('myDiv', data);
});