/*
 * calculate the numbers of rowa and columns for table and 3D table based on the count of slides
*/
function getRowCol(count) {
  var squareRoot = Math.sqrt(count);

  // if squareRoot is integer
  if (squareRoot.toString().indexOf('.') === -1) {
    return {'row': squareRoot, 'col': squareRoot};
  }
  else {
    return {'row': Math.round(squareRoot), 'col': Math.ceil(squareRoot)};
  }
}

// set row and column for every item of array
function setRowCol(source) {
  var count = source.length;
  var rowColNumbers = getRowCol(count);
  var rowNum = rowColNumbers.row;
  var colNum = rowColNumbers.col;
  for (var i = 0 ; i < count ; i ++) {
  	source[i]['row'] = Math.ceil((i + 1) / rowNum);
  	source[i]['col'] = i + 1 - rowNum * (source[i]['row'] - 1);
  }
}