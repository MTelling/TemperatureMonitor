var temp = 0;
const max = 30.;
const min = 17.;
const diff = max - min;

var bar = new ProgressBar.SemiCircle(temp_gauge, {
  strokeWidth: 8,
  color: '#009DFF',
  trailColor: '#eee',
  trailWidth: 8,
  easing: 'easeInOut',
  duration: 1400,
  svgStyle: null,
  text: {
    value: '',
    alignToBottom: true
  },
  from: {color: '#009DFF'},
  to: {color: '#CF0000'},
  // Set default step function for all animate calls
  step: (state, bar) => {
    bar.path.setAttribute('stroke', state.color);
    bar.setText(temp.toFixed(2) + "°C");
    bar.text.style.color = state.color;
  }
});

bar.text.style.fontSize = '3rem';

function getTempPercent(temperature) {
    return (temperature - min) / diff;
}

function updateTempGauge(temperature) {
    bar.animate(getTempPercent(temperature));
    temp = temperature;
}