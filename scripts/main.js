var camera, scene, renderer, container;
var cameraDist;
var fov;// field of view
var pi = Math.PI / 180;
var aspect;
var nearPlaneHeight;
var nearPlaneWidth;
var margin;
var controls;
var objects = {};
var targets = {};

$(function($){
	
  init();
  animate();

});

function init() {
  // init global varibles used in 3D transforms, and then generate 3d positions for all sldes except for first slide
  fov = 40;
  aspect = window.innerWidth / window.innerHeight;
  cameraDist = 3000;
  camera = new THREE.PerspectiveCamera(fov, aspect, 0, 10000);
  camera.position.z = cameraDist;
  scene = new THREE.Scene();
  nearPlaneHeight = cameraDist * Math.tan(fov / 2 * pi) * 2;
  nearPlaneWidth = nearPlaneHeight * (4 / 3);
  margin = 20;

  //
  renderer = new THREE.CSS3DRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = 'absolute';
  jContainer = $('#container');
  jContainer.append(renderer.domElement);

  //
  controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 0.5;
  controls.minDistance = 500;
  controls.maxDistance = 6000;
  controls.addEventListener('change', render);

  datasource['id'] = $('<div>').uniqueId().prop('id');
  $.when(setRowColOfHierarchialArray(datasource.children))
    .done(loopGenerate3DPosition(datasource.children, datasource.id));

  jFirstSlide = $('.firstSlide');
  jFirstSlide.prop('id', datasource['id']);
  jFirstSlide.append($('<div>', { 'class': 'number', 'text': 1 }));
  jFirstSlide.append($('<div>', { 'class': 'banner', 'text': datasource.banner }));
  jFirstSlide.append($('<div>', { 'class': 'content'}).html(datasource.content));
  jContainer.addClass('rootSlide');

  // bind event handlers for jumping between the topper hierarchy and the lower hierarchy
  jFirstSlide.on('dblclick',function() {
    $(this).addClass('hidden');        
    transform(datasource.id, 500);
    jContainer.prop('className', 'reviewSlide');
  });

  // bind event handlers for effect configuration panel
  $('#effect').on('mouseenter', function() {
    if(!$(this).is(':animated')) {
      $(this).animate({'right': '0px'}, 'slow');
    }
  });
  $('#effect').on('mouseleave', function() {
    if(!$(this).is(':animated')) {
      $(this).animate({'right': '-190px'}, 'slow');
    }
  });
  $("input[name='multiple-slides-effects']").on('change',function() {
    if (jContainer.is('.reviewSlide')) {
      var randomSlideId = $('.slide').not('.hidden')[0].id;
      var parentSlideId = findParentNodeId(randomSlideId, objects);
      transform(parentSlideId, 1000 );
    }
  });
  $("input[name='multiple-slides-effects']").on('click',function() {
    $(this).blur();
  });

  
  // bind event handlers for the catalogue panel of slides
  $('#catalogue').on('mouseenter', function() {
    if(!$(this).is(':animated')) {
      $(this).animate({'left': '0px'}, 'slow');
    }
  });
  $('#catalogue').on('mouseleave', function() {
    if(!$(this).is(':animated')) {
      $(this).animate({'left': '-190px'}, 'slow');
    }
  });

  // animation effect of navigation panel
  var animationEndHandler = {
    'webkitAnimationEnd': function() {$(this).css('-webkit-animation-play-state', 'paused');},
    'animationEnd' :function() {$(this).css('animation-play-state', 'paused');}
  };
  $('#triangle-left-effect').on(animationEndHandler);
  $('#triangle-up-effect').on(animationEndHandler);
  $('#triangle-right-effect').on(animationEndHandler);
  $('#triangle-down-effect').on(animationEndHandler);


  //
  $(window).on('resize', onWindowResize);

  // left, top, right and down keys
  $(document).on('keyup', function(event) {
    var animationPlayState;
    if ($.browser.webkit) {
      animationPlayState = '-webkit-animation-play-state';
    } else {
      animationPlayState = 'animation-play-state';
    }

    switch(event.which) {
      case 13: {// enter key
        if (jContainer.is('.rootSlide')) {
          $('#' + datasource.id).addClass('hidden');
          transform(datasource.id, 500);
          jContainer.prop('className', 'reviewSlide');
        } else if (jContainer.is('.reviewSlide')) {
          if($('.highlight').length === 0) {
            focusSlide('left');
          } else {
            var focusedSlideId = $('.highlight')[0].id;
            if(objects[focusedSlideId]) {
              $('.highlight').removeClass('highlight');
              $('.slide').not('.hidden').addClass('hidden');
              transform(focusedSlideId, 500);
              restoreInitPosition(findParentNodeId(focusedSlideId, objects));
            }
          }
        } else if (jContainer.is('.readSlide')) {
          var currentSlideId = $('.currentSlide')[0].id;
          if(objects[currentSlideId]) {
            var parentSlideId = findParentNodeId(currentSlideId, objects);
            $('.highlight').removeClass('highlight');
            $('.currentSlide').addClass('hidden')
              .css({"width": targets[parentSlideId].size.width, "height": targets[parentSlideId].size.height});
            transform(currentSlideId, 500);
            jContainer.prop('className', 'reviewSlide');
            restoreInitPosition(findParentNodeId(currentSlideId, objects));
          }
        }
        break;
      }
      case 27: {// esc key
        if (jContainer.is('.reviewSlide')) {
          // id of any available slides
          var randomSlideId = $('.slide').not('.hidden')[0].id;
          var grandpaSlideId = findGrandpaNodeId(randomSlideId, objects);
          $('.highlight').removeClass('highlight');
          $('.slide').not('.hidden').addClass('hidden');
          if(grandpaSlideId === "") {
            $('#ui-id-1').removeClass('hidden');
            jContainer.prop('className', 'rootSlide');
            restoreInitPosition('ui-id-1');
          } else {
            transform(grandpaSlideId, 500);
            restoreInitPosition(findParentNodeId(randomSlideId, objects));
          }
        } else if (jContainer.is('.readSlide')) {
          var currentSlideId = $('.currentSlide')[0].id;
          var dataIndex = $('.currentSlide').prop('data-index');
          var parentSlideId = findParentNodeId(currentSlideId, objects);

          transform(parentSlideId, 500, dataIndex);
          jContainer.prop('className', 'reviewSlide');
        }
        break;
      }
      case 37: {// left key
        $('#triangle-left-effect').css(animationPlayState, 'running');
        if(jContainer.is('.reviewSlide')) {
          focusSlide('left');
        }
        else if(jContainer.is('.readSlide')) {
          var randomSlideId = $('.slide').not('.hidden')[0].id;
          var originalSize = targets[findParentNodeId(randomSlideId, objects)].size;
          turnToNewSlide('previous', originalSize);
        }
        break;
      }
      case 38: {// up key
        $('#triangle-up-effect').css(animationPlayState, 'running');
        if(jContainer.is('.reviewSlide')) {
          focusSlide('up');
        }
        else if(jContainer.is('.readSlide')) {
          var randomSlideId = $('.slide').not('.hidden')[0].id;
          var originalSize = targets[findParentNodeId(randomSlideId, objects)].size;
          turnToNewSlide('previous', originalSize);
        }
        break;
      }
      case 39: {// right key
        $('#triangle-right-effect').css(animationPlayState, 'running');
        if(jContainer.is('.reviewSlide')) {
          focusSlide('right');
        }
        else if(jContainer.is('.readSlide')) {
          var randomSlideId = $('.slide').not('.hidden')[0].id;
          var originalSize = targets[findParentNodeId(randomSlideId, objects)].size;
          turnToNewSlide('next', originalSize);
        }
        break;
      }
      case 40: {// down key
        $('#triangle-down-effect').css(animationPlayState, 'running');
        if(jContainer.is('.reviewSlide')) {
          focusSlide('down');
        }
        else if(jContainer.is('.readSlide')) {
          var randomSlideId = $('.slide').not('.hidden')[0].id;
          var originalSize = targets[findParentNodeId(randomSlideId, objects)].size;
          turnToNewSlide('next', originalSize);
        }
        break;
      }
    }
  });


}

function loopGenerate3DPosition(arr, id) {
  generate3DPosition(arr, id);
  var count = arr.length;
  for(var i = 0;i < count; i++) {
    var children = arr[i].children;
    var parentId = arr[i].id;
    if (children) {
      loopGenerate3DPosition(children, parentId);
    }
  }
}

function generate3DPosition(arr, parentId) {
  objects[parentId] = [];
  targets[parentId] = {"size": {},"initial": [], "table": [], "sphere": []};

  var rowColNum = getRowCol(arr.length);
  var rowCount = rowColNum.row;
  var rowHeight = Math.round((nearPlaneHeight - (rowCount - 1) * margin) / rowCount);
  var colCount = rowColNum.col;
  var colWidth = Math.round((nearPlaneWidth - (colCount - 1) * margin) / colCount);
  var originalSize = {'width': colWidth, 'height': rowHeight};
  targets[parentId].size = originalSize;

  // initial positions
  $.each(arr, function(index, slide) {
    var object3D = new THREE.Object3D();
    object3D.position.x = Math.random() * 5000 - 2000;
    object3D.position.y = Math.random() * 5000 - 2000;
    object3D.position.z = Math.random() * 5000 - 2000;
    targets[parentId].initial.push(object3D);
  });

  // 3D table
  $.each(arr, function(index, slide) {
    var jSlide = $('<article>', {'id': slide.id, 'class': 'slide hidden', 'css':{
      'width': colWidth,
      'height': rowHeight,
      'backgroundColor': 'rgba(51,0,51,' + (Math.random() * 0.5 + 0.25) + ')'}
    });

    jSlide.append($('<div>', { 'class': 'number', 'text': index + 1 }));
    jSlide.append($('<div>', { 'class': 'banner', 'text': slide['banner'] }));
    jSlide.append($('<div>', { 'class': 'content hidden'}).html(slide['content']));
    jSlide.prop('data-index', index);

    jSlide.on('click', function() {
      if($(this).is('.highlight')) {
        $(this).toggleClass('highlight'); 
      } else {
        $('.highlight').removeClass('highlight');
        $(this).addClass('highlight');
      }
    });
    jSlide.on('dblclick', readSlide(index, 500, originalSize));

    var css3dObject = new THREE.CSS3DObject(jSlide[0]);
    css3dObject.position.x = Math.random() * 4000 - 2000;
    css3dObject.position.y = Math.random() * 4000 - 2000;
    css3dObject.position.z = Math.random() * 4000 - 2000;
    scene.add(css3dObject);

    objects[parentId].push(css3dObject);

    var object3D = new THREE.Object3D();
    object3D.position.x = -(colCount * (colWidth + margin) - margin) / 2
      + (slide['col'] - 1) * (colWidth + margin) + colWidth / 2;
    object3D.position.y = (rowCount * (rowHeight + margin) - margin) / 2
      - (slide['row'] - 1) * (rowHeight + margin) - rowHeight / 2; 
    targets[parentId].table.push(object3D);
  });


  // sphere
  var phi, theta;
  var diameter = Math.round(nearPlaneWidth/Math.PI);
  var vector = new THREE.Vector3();
  $.each(arr, function(index, slide) {
    var object3D = new THREE.Object3D();
    phi = Math.acos(-1 + ( 2 * index ) / arr.length);
    theta = Math.sqrt(arr.length * Math.PI) * phi;
    object3D.position.x = diameter * Math.cos(theta) * Math.sin(phi);
    object3D.position.y = diameter * Math.sin(theta) * Math.sin(phi);
    object3D.position.z = diameter * Math.cos(phi);

    vector.copy(object3D.position).multiplyScalar(2);
    object3D.lookAt(vector);

    targets[parentId].sphere.push(object3D);
  });

}


function focusSlide(direction) {
  jReadSlides = $('.slide').not('.hidden');
  jHighlightSlide = $('.highlight');
  var rowColNum = getRowCol(jReadSlides.length);
  var total = jReadSlides.length;
  var targetIndex;
  if($('.highlight').length === 0) {
    $('.slide').not('.hidden').filter(function() {
      return $(this).prop('data-index') === 0;
    }).addClass('highlight');
  } else {
    switch(direction) {
      case 'left': {
        targetIndex = jHighlightSlide.prop('data-index') - 1;
        if(targetIndex >= 0) {
          switchHightlight(targetIndex);
        }
        break;
      }
      case 'up': {
        targetIndex = jHighlightSlide.prop('data-index') - rowColNum.col;
        if(targetIndex >= 0) {
          switchHightlight(targetIndex);
        }
        break;
      }
      case 'right': {
        targetIndex = jHighlightSlide.prop('data-index') + 1;
        if(targetIndex < total) {
          switchHightlight(targetIndex);
        }
        break;
      }
      case 'down': {
        targetIndex = jHighlightSlide.prop('data-index') + rowColNum.col;
        if(targetIndex < total) {
          switchHightlight(targetIndex);
        }
        break;
      }
    }
  }
}
 
function switchHightlight(targetIndex) {
  jHighlightSlide.removeClass('highlight');
  jReadSlides.filter(function() {
    return $(this).prop('data-index') === targetIndex;
  }).addClass('highlight');
}

function transform(id, duration, dataIndex) {
  TWEEN.removeAll();
  
  if(dataIndex >= 0) {
    var object = objects[id][dataIndex];
    var target = targets[id].table[dataIndex];
    new TWEEN.Tween(object.position).to({x: target.position.x, y: target.position.y,
      z: target.position.z}, Math.random() * duration + duration)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();
    new TWEEN.Tween(object.rotation).to({x: target.rotation.x, y: target.rotation.y,
      z: target.rotation.z}, Math.random() * duration + duration)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();
    new TWEEN.Tween({'width': 800, 'height': 600})
      .to({'width': targets[id].size.width, 'height': targets[id].size.height}, duration)
      .easing(TWEEN.Easing.Quintic.In)
      .onUpdate(function() {
        $(object.element).css({'width': this.width, 'height': this.height});
      })
      .onComplete(function() {
        $.each(objects[id],function(index, slide) {
          $(slide.element).removeClass('hidden');
        });
      })
      .start();
  } else {
    var multipleEffect = $('input[name="multiple-slides-effects"]:checked').val();
    var checkedTargets;
    if(multipleEffect === '3dtable') {
      checkedTargets = targets[id].table;
    } else if (multipleEffect === 'sphere') {
      checkedTargets = targets[id].sphere;
    }
    for (var i = 0; i < objects[id].length; i ++) {
      $(objects[id][i].element).removeClass('hidden');
      var object = objects[id][i];
	    var target = checkedTargets[i];
  
	    new TWEEN.Tween(object.position).to({x: target.position.x, y: target.position.y,
	      z: target.position.z}, Math.random() * duration + duration)
	      .easing(TWEEN.Easing.Exponential.InOut).start();
  
	    new TWEEN.Tween(object.rotation).to({x: target.rotation.x, y: target.rotation.y,
	      z: target.rotation.z}, Math.random() * duration + duration)
	      .easing(TWEEN.Easing.Exponential.InOut).start();
    }
  }

  new TWEEN.Tween(window).to({}, duration * 2).onUpdate(render).start();
}

function restoreInitPosition(id) {
  $.each(objects[id], function(index, slide) {
    slide.position.x = targets[id].initial[index].position.x;
    slide.position.y = targets[id].initial[index].position.y;
    slide.position.z = targets[id].initial[index].position.z;
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  controls.update();
}

function render() {
  renderer.render(scene, camera);
}

function readSlide(index, duration, originalSize) {
  return function () {
    if(!jContainer.is('.readSlide')) {
      // pause the controls
      controls.noPan = true;
      controls.noRoll = true;
      controls.noRotate = true;
      controls.noZoom = true;

      var randomSlideId = $('.slide').not('.hidden')[0].id;
      var parentSlideId = findParentNodeId(randomSlideId, objects);
      var object = objects[parentSlideId][index];
  	  var jSelectedSlide = $(object.element);
  	  var jOtherSlides = $('.slide').not(object.element);

      // set the current view mode to sigleSlide
      jContainer.prop('className', 'readSlide');
    
      // set flag to identify which slide is being read
      jOtherSlides.removeClass('currentSlide');
      jSelectedSlide.addClass('currentSlide');

      // create the data-index property of slide of jquery object
      $('.currentSlide').prop('data-index', index);

      // hide other slides
      jOtherSlides.addClass('hidden');

  	  // turn to the screen
  	  controls.reset();

      // fit into render area by HEIGHT
      new TWEEN.Tween(object.position)
        .to({x: 0, y: 0, z: cameraDist - (window.innerHeight / 2) / Math.tan(fov / 2 * pi)}, duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();
      new TWEEN.Tween({'width': originalSize.width, 'height': originalSize.height})
        .to({'width': 800, 'height': 600}, duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate(function() {
          $(object.element).css({'width': this.width, 'height': this.height});
      })
      .start();
      new TWEEN.Tween(object.rotation)
        .to({x: 0, y: 0, z: 0}, duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();
      new TWEEN.Tween(window)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();
    }
  };
}

// turn to new slide according to the current slide
function turnToNewSlide(type, originalSize) {
  var index = $('.currentSlide').prop('data-index');
  var currentSlideId = $('.currentSlide')[0].id;
  var parentSlideId = findParentNodeId(currentSlideId, objects);
  // determine whether it can be turned to the new slide
  if(type === 'next') {
    if(index >= objects[parentSlideId].length - 1) {
      return;
    }
  } else {
    if(index === 0) {
      return;
    }
  }

  // hide the current slide
  hideCurrentSlide(index, 500, originalSize);

  // show the new slide
  if(type === 'next') {
    showNewSlide(index + 1, 500, originalSize);
  } else {
    showNewSlide(index - 1, 500, originalSize);
  }
}


function hideCurrentSlide(index, duration, originalSize) {
  var randomSlideId = $('.slide').not('.hidden')[0].id;
  var parentSlideId = findParentNodeId(randomSlideId, objects);
  var object = objects[parentSlideId][index];
  var multipleEffect = $('input[name="multiple-slides-effects"]:checked').val();
  var checkedTargets;
  if(multipleEffect === '3dtable') {
    checkedTargets = targets[parentSlideId].table;
  } else if (multipleEffect === 'sphere') {
    checkedTargets = targets[parentSlideId].sphere;
  }
  var target = checkedTargets[index];
  var jSelectedSlide = $(object.element);
  var jOtherSlides = $('.slide').not(object.element);

  new TWEEN.Tween(object.position)
    .to({x: target.position.x, y: target.position.y, z: target.position.z}, duration)
    .easing(TWEEN.Easing.Exponential.InOut)
    .onStart(function() {
        jSelectedSlide.removeClass('hidden');
    })
    .onComplete(function() {
        jSelectedSlide.addClass('hidden');
    })
    .start();

  new TWEEN.Tween({'width': 800, 'height': 600})
    .to({'width': originalSize.width, 'height': originalSize.height}, duration)
    .easing(TWEEN.Easing.Exponential.InOut)
    .onUpdate(function() {
        $(object.element).css({'width': this.width, 'height': this.height});
    })
    .start();

  new TWEEN.Tween(object.rotation)
    .to({x: target.rotation.x, y: target.rotation.y, z: target.rotation.z}, duration)
    .easing(TWEEN.Easing.Exponential.InOut)
    .start();

  new TWEEN.Tween(window).to({}, duration * 2).onUpdate(render).start();
}

function showNewSlide(index, duration, originalSize) {
  var randomSlideId = $('.slide').not('.hidden')[0].id;
  var parentSlideId = findParentNodeId(randomSlideId, objects);
  var object = objects[parentSlideId][index];
  var target = targets[parentSlideId].table[index];
  var jSelectedSlide = $(object.element);
  var jOtherSlides = $('.slide').not(object.element);
    
  // set flag to identify which slide is being read
  jOtherSlides.removeClass('currentSlide');
  jSelectedSlide.addClass('currentSlide');

  // create the data-index property of slide of jquery object
  $('.currentSlide').prop('data-index', index);

  // fit into render area by HEIGHT
  new TWEEN.Tween(object.position)
    .to({x: 0, y: 0, z: cameraDist - (window.innerHeight / 2) / Math.tan(fov / 2 * pi)}, duration)
    .easing(TWEEN.Easing.Exponential.InOut)
    .onStart(function() {
      jSelectedSlide.removeClass('hidden');
    })
    .start();

  new TWEEN.Tween({'width': originalSize.width, 'height': originalSize.height})
    .to({'width': 800, 'height': 600}, duration)
    .easing(TWEEN.Easing.Exponential.InOut)
    .onUpdate(function() {
      $(object.element).css({'width': this.width, 'height': this.height});
    })
    .start();

  new TWEEN.Tween(object.rotation)
    .to({x: 0, y: 0, z: 0}, duration)
    .easing(TWEEN.Easing.Exponential.InOut)
    .start();

  new TWEEN.Tween(window)
    .to({}, duration * 2)
    .onUpdate(render)
    .start();

}