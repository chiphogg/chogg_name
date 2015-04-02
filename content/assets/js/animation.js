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
  var N_x = x.length;
  // The time-domain covariance matrix (with compact support).
  var K_t = CompactSupportCovarianceMatrix(N_t);
  // Each row of L_t is a vector to multiply different timesteps.
  var L_t = LoopingCholesky(K_t);
  var random_matrix = jStat.create(N_t, N_x, function(i, j) {
    return jStat.normal.sample(0, 1);
  });
  // i indicates which vector from L_t to use, and also which row of the random
  // matrix to update.
  var i = N_t - 1;

  return_object.NextDataset = function() {
    // Compute the next data.
    var new_data = jStat(L_t[i]).multiply(random_matrix)[0];
    // Generate new random numbers.
    for (var j = 0; j < N_x; ++j) {
      random_matrix[i][j] = jStat.normal.sample(0, 1);
    }
    // Update the counter.
    i = ((i > 0) ? i : N_t) - 1
    // Return the next dataset.
    return new_data;
  }

  return return_object;
};

// Return a chart object.
function AnimatedChart(dataset_generator) {
  // The generator which generates new datasets.
  var generator = dataset_generator;
  // The number of milliseconds for each frame.
  var frame_length = 1000;
  // Copy the x-values for the data.
  var x = generator.x.slice();

  var data = new google.visualization.DataTable();
  data.addColumn('number', 'x');
  data.addColumn('number', 'y');
  data.addRows(zip([x, generator.NextDataset()]));

  // Set chart options.
  var options = {
    title: 'Testing out',
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
      startup: true,
    },
    height: 500};

  var return_object = {
    animation_id: null,
  };

  return_object.chart = new
    google.visualization.LineChart(document.getElementById('chart'))
  return_object.chart.draw(data, options);

  return_object.draw = function() {
    // Kick off the animation.
    return_object.chart.draw(data, options);

    // Compute the new data for the next frame.
    var new_data = generator.NextDataset();
    for (var i = 0; i < new_data.length; ++i) {
      data.setValue(i, 1, new_data[i]);
    }
  };

  return return_object;
};
