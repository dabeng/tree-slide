var camera, scene, renderer;
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
  // animate();

});

function init() {
  // init global varibles used in 3D transforms, and then generate 3d positions for all sldes except for first slide
  init3DScene();
  datasource['id'] = $('<div>').uniqueId().prop('id');
  $.when(setRowColOfHierarchialArray(datasource.children))
    .done(loopGenerate3DPosition(datasource.children, datasource.id));

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

}

function init3DScene() {
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
  $('#container').append(renderer.domElement);

  //
  controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 0.5;
  controls.minDistance = 500;
  controls.maxDistance = 6000;
  controls.addEventListener('change', render);
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
  targets[parentId] = {"table": [], "sphere": []};

  var rowColNum = getRowCol(datasource.length);
  var rowCount = rowColNum.row;
  var rowHeight = Math.round((nearPlaneHeight - (rowCount - 1) * margin) / rowCount);
  var colCount = rowColNum.col;
  var colWidth = Math.round((nearPlaneWidth - (colCount - 1) * margin) / colCount);
  var originalSize = {'width': colWidth, 'height': rowHeight};

  // 3D table
  $.each(arr, function(index, slide) {
    var jSlide = $('<article>', { 'class': 'slide', 'css':{
      'width': colWidth,
      'height': rowHeight,
      'backgroundColor': 'rgba(51,0,51,' + (Math.random() * 0.5 + 0.25) + ')'}
    });

    jSlide.append($('<div>', { 'class': 'number', 'text': index + 1 }));
    jSlide.append($('<div>', { 'class': 'banner', 'text': slide['banner'] }));
    jSlide.append($('<div>', { 'class': 'content'}).html(slide['content']));

    jSlide.on('dblclick', makeCenterEffect(index, 500, originalSize));

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

/*
 * generate 3D effects based on three.js
*/
function generate3DEffects() {

  for(var i = 0;i < count; i++) {
    var children = arr[i].children;
    if (children) {
      generate3DPosition(children);
    }
  }

  $('#effect-3dtable').on('click', function (event) { transform(targets.table, 1000 ); });
  $('#effect-sphere').on('click', function (event) { transform(targets.sphere, 1000 ); });

  transform(targets.table, 1000);

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
      case 37: {
        $('#triangle-left-effect').css(animationPlayState, 'running');
        if($('#container').is('.multipleSlide')) {
          focusSlide('left');
        }
        else if($('#container').is('.singleSlide')) {
          turnToNewSlide('previous', originalSize);
        }
        break;
      }
      case 38: {
        $('#triangle-up-effect').css(animationPlayState, 'running');
        if($('#container').is('.multipleSlide')) {
          focusSlide('up');
        }
        else if($('#container').is('.singleSlide')) {
          turnToNewSlide('previous', originalSize);
        }
        break;
      }
      case 39: {
        $('#triangle-right-effect').css(animationPlayState, 'running');
        if($('#container').is('.multipleSlide')) {
          focusSlide(right);
        }
        else if($('#container').is('.singleSlide')) {
          turnToNewSlide('next', originalSize);
        }
        break;
      }
      case 40: {
        $('#triangle-down-effect').css(animationPlayState, 'running');
        if($('#container').is('.multipleSlide')) {
          focusSlide('down');
        }
        else if($('#container').is('.singleSlide')) {
          turnToNewSlide('next', originalSize);
        }
        break;
      }
    }
  });
}

function focusSlide(direction) {
  if($('.highlight').length === 0) {
    $('.slide').not('.hidden').filter("article['data-index=0']").addClass('highlight');
  } else {
    switch(direction) {
      case 'left': {
        var targetIndex = $('.highlight').prop('data-index') -1;
        $('article[data-index='+ targetIndex +']').addClass('highlight');
        break;
      }

    }
  }
}

function transform(targets, duration) {
  TWEEN.removeAll();

  var i;
  for (i = 0; i < objects.length; i ++) {
    var object = objects[i];
	var target = targets[i];

	new TWEEN.Tween(object.position).to({x: target.position.x, y: target.position.y,
	  z: target.position.z}, Math.random() * duration + duration)
	  .easing(TWEEN.Easing.Exponential.InOut).start();

	new TWEEN.Tween(object.rotation).to({x: target.rotation.x, y: target.rotation.y,
	  z: target.rotation.z}, Math.random() * duration + duration)
	  .easing(TWEEN.Easing.Exponential.InOut).start();
  }

  new TWEEN.Tween(window).to({}, duration * 2).onUpdate(render).start();
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

function makeCenterEffect(index, duration, originalSize) {
  return function () {
    // pause the controls
    controls.noPan = true;
    controls.noRoll = true;
    controls.noRotate = true;
    controls.noZoom = true;

    var object = objects[index];
    var target = targets.table[index];
  	var jSelectedSlide = $(object.element);
  	var jOtherSlides = $('.slide').not(object.element);

    // set the current view mode to sigleSlide
    $('#container').removeClass();
    $('#container').addClass('singleSlide');
    
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
      .to({x: target.rotation.x, y: target.rotation.y, z: target.rotation.z}, duration)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();
    new TWEEN.Tween(window)
      .to({}, duration * 2)
      .onUpdate(render)
      .start();
  };
}

// turn to new slide according to the current slide
function turnToNewSlide(type, originalSize) {
  var index = $('.currentSlide').prop('data-index');
  // determine whether it can be turned to the new slide
  if(type === 'next') {
    if(index >= objects.length - 1) {
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
  var object = objects[index];
  var target = targets.table[index];
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
    .to({x: 0, y: 0, z: 0}, duration)
    .easing(TWEEN.Easing.Exponential.InOut)
    .start();

  new TWEEN.Tween(window).to({}, duration * 2).onUpdate(render).start();
}

function showNewSlide(index, duration, originalSize) {
  var object = objects[index];
  var target = targets.table[index];
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
    .to({x: target.rotation.x, y: target.rotation.y, z: target.rotation.z}, duration)
    .easing(TWEEN.Easing.Exponential.InOut)
    .start();

  new TWEEN.Tween(window)
    .to({}, duration * 2)
    .onUpdate(render)
    .start();

}