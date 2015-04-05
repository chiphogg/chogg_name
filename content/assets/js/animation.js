// Utility functions for animated plots.

// Thanks to http://stackoverflow.com/a/10284006 for zip() function.
function zip(arrays) {
  return arrays[0].map(function(_, i) {
    return arrays.map(function(array) { return array[i]; })
  });
}

// Create a covariance matrix with compact support for a given number of equally
// spaced points.
function CompactSupportCovarianceMatrix(N) {
  return jStat.create(N, N, function(i, j) {
    var dt = Math.abs(i - j) / N;
    return (Math.pow(1 - dt, 6)
            * ((12.8 * dt * dt * dt) + (13.8 * dt * dt) + (6 * dt) + 1));
  });
}

function DatasetGenerator(x, mu, kFunc, N_t) {
  var return_object = {};

  // First section: declare member variables for the closure.
  //
  // The x-values for this closure.
  return_object.x = x;
  // The number of timesteps we need to keep in memory.
  var N_t = N_t;
  // The number of points in the dataset.
  var N = x.length;
  // The time-domain covariance matrix (with compact support).
  var K_t = CompactSupportCovarianceMatrix(N_t);
  // Each row of L_t is a vector to multiply different timesteps.
  var L_t = LoopingCholesky(K_t);
  var random_matrix = jStat.create(N_t, N, function(i, j) {
    return jStat.normal.sample(0, 1);
  });
  // i indicates which vector from L_t to use, and also which row of the random
  // matrix to update.
  var i = N_t - 1;
  // The covariance matrix in space.
  //
  // We add a small amount of noise on the diagonal to help computational
  // stability.
  K = CovarianceMatrix(x, kFunc);
  var U = jStat.transpose(Cholesky(K));

  return_object.NextDataset = function() {
    // Compute the next data.
    var independent_data = jStat(L_t[i]).multiply(random_matrix)[0];
    // Generate new random numbers.
    for (var j = 0; j < N; ++j) {
      random_matrix[i][j] = jStat.normal.sample(0, 1);
    }
    // Update the counter.
    i = ((i > 0) ? i : N_t) - 1
    // Return the next dataset.
    var new_data = jStat(independent_data).multiply(U)[0];
    return new_data;
  }

  return return_object;
};

// Return a chart object.
function AnimatedChart(dataset_generator, div_id, title, chart_type, options) {
  chart_type = (typeof chart_type !== 'undefined') ?
    chart_type : google.visualization.LineChart;
  // The generator which generates new datasets.
  var generator = dataset_generator;
  // The number of milliseconds for each frame.
  var frame_length = 200;
  // Copy the x-values for the data.
  var x = generator.x.slice();

  var data = new google.visualization.DataTable();
  data.addColumn('number', 'x');
  data.addColumn('number', 'y');
  data.addRows(zip([x, generator.NextDataset()]));

  // Set chart options.
  var chart_options = $.extend(
      {
        title: title,
        width: 800,
        vAxis: {
          viewWindow: {
            min: -3.0,
            max: 3.0,
          },
        },
        animation: {
          duration: frame_length,
          easing: 'linear',
        },
        height: 500
      },
      options);

  var return_object = {
    animation_id: null,
  };

  return_object.chart = new chart_type(document.getElementById(div_id))
  return_object.chart.draw(data, chart_options);

  return_object.draw = function() {
    // Kick off the animation.
    return_object.chart.draw(data, chart_options);

    // Compute the new data for the next frame.
    var new_data = generator.NextDataset();
    for (var i = 0; i < new_data.length; ++i) {
      data.setValue(i, 1, new_data[i]);
    }
  };

  // Functions to start and stop the animations.
  var listener_id = null;
  return_object.stop = function() {
    if (listener_id !== null) {
      google.visualization.events.removeListener(listener_id);
      listener_id = null;
    }
  }
  return_object.start = function() {
    listener_id = google.visualization.events.addListener(
        return_object.chart, 'animationfinish', return_object.draw);
    return_object.chart.draw(data, chart_options);
  }

  return return_object;
};
