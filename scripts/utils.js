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

function findParentNodeId(id, obj) {
  for (var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      var count = obj[prop].length;
      for(var i = 0; i < count; i++) {
        if(obj[prop][i].element.id === id) {
          return prop;
        }
      }
    }
  }
}

function findGrandpaNodeId(id, obj) {
  var parentNodeId = findParentNodeId(id, obj);
  if(parentNodeId === 'ui-id-1') {
    return "";
  } else {
    return findParentNodeId(parentNodeId, obj);
  }
}

jQuery.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
  return this.each(function(){
    var clicks = 0, self = this;
    jQuery(this).click(function(event){
      clicks++;
      if (clicks == 1) {
        setTimeout(function(){
          if(clicks == 1) {
            single_click_callback.call(self, event);
          } else {
            double_click_callback.call(self, event);
          }
          clicks = 0;
        }, timeout || 300);
      }
    });
  });
}