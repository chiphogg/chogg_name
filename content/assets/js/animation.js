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

// Return a chart object.
function AnimatedChart() {
  // The number of milliseconds for each frame.
  var frame_length = 1000;
  // The initial timestamp (to be created on the initial run).
  var start = null;
  // The last frame which was rendered.
  var last_frame_rendered = 0;
  // The x-values for the data (copy from x_vals).
  var x = x_vals.slice();

  var data = new google.visualization.DataTable();
  data.addColumn('number', 'x');
  data.addColumn('number', 'y');
  data.addRows(x.map(
        function(z) {
          return [z, Math.sin(z * 0.25 * Math.PI)];
        }));

  // Set chart options.
  var options = {
    title: 'Testing out',
    width: 800,
    vAxis: {
      viewWindow: {
        min: -2.0,
        max: 2.0,
      },
    },
    animation: {
      duration: frame_length,
      easing: 'linear',
    },
    height: 500};

  var chart = new
    google.visualization.LineChart(document.getElementById('chart'))
  chart.draw(data, options);

  var return_object = {
    animation_id: null,
  };

  return_object.draw = function(timestamp) {
    return_object.animation_id = requestAnimationFrame(return_object.draw);

    // Check timestamps to see if we should redraw.
    if (!start) start = timestamp;
    var progress = timestamp - start;
    var frame = Math.floor(progress / frame_length);
    if (frame <= last_frame_rendered) {
      return;
    }
    last_frame_rendered = frame;

    // Update the data and redraw the frame.
    var new_data = DataAtTimestep(x, frame);
    for (var i = 0; i < new_data.length; ++i) {
      data.setValue(i, 1, new_data[i]);
    }
    chart.draw(data, options);
  };

  // Convenience functions to start and stop this animation.
  return_object.start = function() {
    if (!return_object.animation_id) {
      return_object.animation_id = requestAnimationFrame(return_object.draw);
    }
  };
  return_object.stop = function() {
    if (return_object.animation_id) {
      cancelAnimationFrame(return_object.animation_id);
      return_object.animation_id = null;
    }
  };

  return return_object;
};
