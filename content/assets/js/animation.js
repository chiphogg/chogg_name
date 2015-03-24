// Utility functions for animated plots.

// Global variables I might find useful.
var max_x = 8;
var num_points = 101;
var timeout_ms = 1000;
var frame = 0;
var timer_id;

// Set up the sequence of x-values: `num_points` of them, from 0 to `max_x`.
var x_vals = Array.apply(0, Array(num_points)).map(
    function(v, i) { return max_x * i / (num_points - 1); });

var DataAtTimestep = function(x, i) {
  return x.map(
      function(z) {
        return Math.sin(z * 0.25 * Math.PI) * Math.cos(i * 0.1 * Math.PI);
      });
};

// Use the global 'frame' variable to decide which to render, and increment it
// at the end.
var renderFrame = function(chart, x, data_func, max_frame, label) {
  if (frame >= max_frame) {
    clearInterval(timer_id);
    frame = 0;
    return true;
  }
  chart.load({
    columns: [
      ['x'].concat(x),
      [label].concat(data_func(x, frame)),
    ],
  });
  frame = frame + 1;
  return false;
};

var AnimationChartC3 = function(x, div_id, label, timeout_ms, c3_options) {
  // Augment the user-provided options with options we'll always want.
  c3_options.bindto = '#' + div_id;
  c3_options.data = {
    x: 'x',
    columns: [
      ['x'].concat(x),
      [label].concat(DataAtTimestep(x, 0)),
    ],
  };
  //c3_options.transition = {
  //  duration: timeout_ms
  //};
  // Generate the chart (we'll later return it).
  var chart = c3.generate(c3_options);
  // Attempt (unsuccessfully) to set the "ease" to linear.
  d3.selectAll('.c3-line').transition().ease('linear').duration(10 * timeout_ms);
  // Kick off the animation.
  timer_id = setInterval(function() {
    renderFrame(chart, x, DataAtTimestep, 20, label);
  }, 0.5 * timeout_ms);

  return chart
};
