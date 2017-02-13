var _humidity = 0;
const humidityMax = 100.;
const humidityMin = 0.;
const humidityDiff = humidityMax - humidityMin;

var humidityBar = new ProgressBar.SemiCircle(humidity_gauge, {
  strokeWidth: 8,
  color: '#5B6178',
  trailColor: '#eee',
  trailWidth: 8,
  easing: 'easeInOut',
  duration: 1400,
  svgStyle: null,
  text: {
    value: '',
    alignToBottom: true
  },
  from: {color: '#5B6178'},
  to: {color: '#01786F'},
  // Set default step function for all animate calls
  step: (state, bar) => {
    bar.path.setAttribute('stroke', state.color);
    bar.setText(_humidity.toFixed(0) + "%");
    bar.text.style.color = state.color;
  }
});

humidityBar.text.style.fontSize = '3rem';

function updateHumidityGauge(humidity) {
    console.log("Updating humidity")
    _humidity = humidity;
    humidityBar.animate(humidity / 100);
}