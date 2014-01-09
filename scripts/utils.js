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

// set row and column for every item of an array
function setRowCol(source) {
  var count = source.length;
  var rowColNumbers = getRowCol(count);
  var rowNum = rowColNumbers.row;
  var colNum = rowColNumbers.col;
  for (var i = 0 ; i < count ; i ++) {
  	source[i]['row'] = Math.ceil((i + 1) / colNum);
  	source[i]['col'] = i + 1 - (source[i]['row']-1) * colNum;
    source[i]['id'] = $('<div>').uniqueId().prop('id');
  }
}

/*
 * set row and column properties for hierarchial slide nodes,except for the first slide(or call it root slide).
 * A sample of slide node is shown below: 
 *   {
 *     "banner": "someBaner",
 *     "content": "someContent",
 *     "children": []
 *   }
*/
function setRowColOfHierarchialArray(arr) {
  setRowCol(arr);
  var count = arr.length;
  for(var i = 0;i < count; i++) {
    var children = arr[i].children;
    if (children) {
      setRowColOfHierarchialArray(children);
    }
  }
}