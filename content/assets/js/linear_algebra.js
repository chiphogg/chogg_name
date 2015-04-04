// This file requires jStat, but I don't know how to include it from here.  For
// now, I need to make sure to include it manually.

function Sequence(from, to, length) {
  return Array.apply(0, Array(length)).map(
      function(_, i) { return from + (to * i) / (length - 1); });
}

// This function doesn't check that M actually *has* a Cholesky decomposition
// (i.e., that it's a positive-definite symmetric matrix).  The caller is
// responsible to ensure this.
function Cholesky(M) {
  n = M.length;

  // Start out with a matrix which is all zeroes, except for the upper-left
  // element, which is trivial to compute from M.
  L = jStat(M).multiply(0);
  L[0][0] = Math.sqrt(M[0][0]);
  if (n == 1) { return L; }

  // Compute each row's values.
  for (var row = 1; row < n; ++row) {
    // This loop computes all the "pre-diagonal" elements.
    for (var col = 0; col < row; ++col) {
      // sum_to_subtract is the contribution from the elements in this new row
      // which we've already computed.
      var sum_to_subtract = 0.0;
      for (var i = 0; i < col; ++i) {
        sum_to_subtract += L[col][i] * L[row][i];
      }
      L[row][col] = (M[row][col] - sum_to_subtract) / L[col][col]
    }
    // Now, compute the element on the main diagonal.
    var sum_to_subtract = 0.0;
    for (var i = 0; i < row; ++i) {
      sum_to_subtract += L[row][i] * L[row][i];
    }
    L[row][row] = Math.sqrt(M[row][row] - sum_to_subtract);
  }

  return L;
};

// Rather an unusual function: we take the Cholesky decomposition, and we
// replace all rows but the last with a cycled version of the last row.  This is
// useful for animations.
function LoopingCholesky(M) {
  var L = Cholesky(M);
  var n = jStat.rows(M);
  for (var row = n - 2; row >= 0; --row) {
    for (var col = 1; col < n; ++col) {
      L[row][col - 1] = L[row + 1][col];
    }
    L[row][n - 1] = L[row + 1][0];
  }
  return L;
};
