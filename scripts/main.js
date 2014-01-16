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
    .done(loopGenerate3DPosition(datasource.children, datasource.id), initCatalogue(datasource));

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

  // bind event handlers for the catalogue panel of slides
  $('#triangle-catalogue').on('click', function() {
    var _this = this;
    $('#catalogue').animate({'left': '0px'}, 'fast', function() {
      $(_this).addClass('hidden');
    });
  });
  $('#catalogue-header .triangle-close').on('click', function() {
    $('#catalogue').animate({'left': '-200px'}, 'fast', function() {
      $('#triangle-catalogue').removeClass('hidden'); 
    });
  });
  $('#catalogue-content').on({
    'after_open.jstree after_close.jstree': function (e, data) {
      $('#catalogue-content').data('jsp').reinitialise();
    }
  });
  $(window.document).on({
      'click': function(event) {
        event.data.clicks++;
        if(event.data.clicks === 1) {
          event.data.timer = setTimeout(function() {
          var clickedSlideId = $(event.target).closest('.jstree-node').prop('id').replace(/cn/,'ui');
          var randomSlideId = $('.slide').not('.hidden')[0].id;
          if (jContainer.is('.rootSlide')) {
            if (clickedSlideId !== jFirstSlide.prop('id')) {
              var parentId = findParentNodeId(clickedSlideId, objects);
              jFirstSlide.addClass('hidden');
              transform(parentId, 500);
              $('#' + clickedSlideId).addClass('highlight');
              jContainer.prop('className', 'reviewSlide');
            }
          } else if (jContainer.is('.reviewSlide')) {
            $('.highlight').removeClass('highlight');
            $('.slide').not('.hidden').addClass('hidden');
            if (clickedSlideId === jFirstSlide.prop('id')) {
              jFirstSlide.removeClass('hidden');
              jContainer.prop('className', 'rootSlide');
            } else {
              $('#' + clickedSlideId).addClass('highlight');
              var parentId = findParentNodeId(clickedSlideId, objects);
              transform(parentId, 500);
              jContainer.prop('className', 'reviewSlide');
            }
            restoreInitPosition(findParentNodeId(randomSlideId, objects));
          } else if (jContainer.is('.readSlide')) {
            var currentSlideId = $('.currentSlide')[0].id;
            var currentParentId = findParentNodeId(currentSlideId, objects);
            if(clickedSlideId !== currentSlideId) {
              if (clickedSlideId === jFirstSlide.prop('id')) {
                $('.highlight').removeClass('highlight');
                $('.currentSlide').addClass('hidden')
                  .css({"width": targets[currentParentId].size.width, "height": targets[currentParentId].size.height});
                  restoreInitPosition(currentParentId);
                  jFirstSlide.removeClass('hidden');
                  jContainer.prop('className', 'rootSlide');
              } else {
                
              }
            }
          }
          $(event.target).blur();
           event.data.clicks = 0;
        }, 300);
        } else {
          clearTimeout(event.data.timer);// prevent single-click action
          var clickedSlideId = $(event.target).closest('.jstree-node').prop('id').replace(/cn/,'ui');
          var parentSlideId = $('#catalogue-content').jstree(true)
            .get_parent($(event.target).closest('.jstree-node')[0]).replace(/cn/, 'ui');
          // perform double-click action
          if (jContainer.is('.rootSlide')) {
            transform(parentSlideId, 10);
            $('#' + clickedSlideId).dblclick();
          } else if (jContainer.is('.reviewSlide')) {
            var randomSlideId = $('.slide').not('.hidden')[0].id;
            $('.highlight').removeClass('highlight');
            if (clickedSlideId === jFirstSlide.prop('id')) {
              $('.slide').not('.hidden').addClass('hidden');
              restoreInitPosition(findParentNodeId(randomSlideId, objects));
              jFirstSlide.removeClass('hidden');
              jContainer.prop('className', 'rootSlide');
            } else {
              if ($('#' + clickedSlideId).is('.hidden')) {
                restoreInitPosition(findParentNodeId(randomSlideId, objects));
                $('.slide').not('.hidden').addClass('hidden');
                transform(parentSlideId, 10);
                $('#' + clickedSlideId).dblclick();
              } else {
                $('#' + clickedSlideId).dblclick();
              }
            }
          } else if (jContainer.is('.readSlide')) {
            var currentSlideId = $('.currentSlide')[0].id;
            var currentParentId = findParentNodeId(currentSlideId, objects);
            if(clickedSlideId !== currentSlideId) {
              $('.currentSlide').find('.content').addClass('hidden');
              if (clickedSlideId === jFirstSlide.prop('id')) {
                $('.highlight').removeClass('highlight');
                $('.currentSlide').addClass('hidden')
                  .css({"width": targets[currentParentId].size.width, "height": targets[currentParentId].size.height});
                  restoreInitPosition(currentParentId);
                  jFirstSlide.removeClass('hidden');
                  jContainer.prop('className', 'rootSlide');
              } else {
                if (parentSlideId === currentParentId) {
                  var originalSize = targets[parentSlideId].size;
                  hideCurrentSlide($('.currentSlide').prop('data-index'), 500, originalSize);
                  showNewSlide($('#' + clickedSlideId).prop('data-index'), 500, originalSize);
                } else {
                  $('.highlight').removeClass('highlight');
                  $('.currentSlide').addClass('hidden')
                    .css({"width": targets[currentParentId].size.width, "height": targets[currentParentId].size.height});
                  restoreInitPosition(currentParentId);
                  transform(parentSlideId, 10);
                  jContainer.prop('className', 'reviewSlide');
                  $('#' + clickedSlideId).dblclick();
                }
              }
            }
          }
          event.data.clicks = 0;// after action performed, reset counter
          $(event.target).blur();
        }
      },
      'dblclick': function(event) {
        $(event.target).blur();
      }
    },
    '#catalogue-content .jstree-anchor',
    {"clicks": 0, "timer": {}}
  );

  // bind event handlers for effect configuration panel
  $('#triangle-effect').on('click', function() {
    var _this = this;
    $('#effect').animate({'right': '0px'}, 'fast', function() {
      $(_this).addClass('hidden');
    });
  });
  $('#effect-header .triangle-close').on('click', function() {
    $('#effect').animate({'right': '-200px'}, 'fast', function() {
      $('#triangle-effect').removeClass('hidden');
    });
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
          toggleControlsActive();
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
 
  // bind event handler for restore init status button
  $('#square-init').on('click', function() {
    if (jContainer.is('.reviewSlide')) {
      controls.reset();
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
  
  var multipleEffect = $('input[name="multiple-slides-effects"]:checked').val();
  var checkedTargets;
  if(multipleEffect === '3dtable') {
    checkedTargets = targets[id].table;
  } else if (multipleEffect === 'sphere') {
    checkedTargets = targets[id].sphere;
  }

  for (var i = 0; i < objects[id].length; i ++) {
    var object = objects[id][i];
	  var target = checkedTargets[i];

    // if user is reviewing multiple slides
    if (!!!dataIndex) {
      $(object.element).removeClass('hidden');
    }

	  new TWEEN.Tween(object.position).to({x: target.position.x, y: target.position.y,
	    z: target.position.z}, Math.random() * duration + duration)
	    .easing(TWEEN.Easing.Exponential.InOut).start();

	  new TWEEN.Tween(object.rotation).to({x: target.rotation.x, y: target.rotation.y,
	    z: target.rotation.z}, Math.random() * duration + duration)
	    .easing(TWEEN.Easing.Exponential.InOut).start();
    if (dataIndex >= 0 && i === dataIndex) {
      new TWEEN.Tween({'width': 800, 'height': 600})
        .to({'width': targets[id].size.width, 'height': targets[id].size.height}, duration)
        .easing(TWEEN.Easing.Quintic.In)
        .onUpdate(function() {
          $(objects[id][dataIndex].element).css({'width': this.width, 'height': this.height});
        })
        .onComplete(function() {
          $.each(objects[id],function(index, slide) {
            $(slide.element).removeClass('hidden');
          });
          $(objects[id][dataIndex].element).find('.content').addClass('hidden');
        }).start();
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
      toggleControlsActive();

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

      // display the content of the slide
      jSelectedSlide.find('.content').removeClass('hidden');

      // create the data-index property of slide of jquery object
      $('.currentSlide').prop('data-index', index);

      // hide other slides
      jOtherSlides.addClass('hidden');

  	  // turn to the screen
  	  controls.reset();

      // fit into render area by HEIGHT
      new TWEEN.Tween(object.position)
        .to({x: 0, y: 0, z: cameraDist - (window.innerHeight / 2) / Math.tan(fov / 2 * pi)}, duration)
        .easing(TWEEN.Easing.Exponential.InOut).start();
      new TWEEN.Tween({'width': originalSize.width, 'height': originalSize.height})
        .to({'width': 800, 'height': 600}, duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate(function() {
          $(object.element).css({'width': this.width, 'height': this.height});
      })
      .start();
      new TWEEN.Tween(object.rotation).to({x: 0, y: 0, z: 0}, duration)
        .easing(TWEEN.Easing.Exponential.InOut).start();
      new TWEEN.Tween(window).to({}, duration * 2).onUpdate(render).start();
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
      jSelectedSlide.find('.content').addClass('hidden');
    }).start();

  new TWEEN.Tween({'width': 800, 'height': 600})
    .to({'width': originalSize.width, 'height': originalSize.height}, duration)
    .easing(TWEEN.Easing.Exponential.InOut)
    .onUpdate(function() {
      $(object.element).css({'width': this.width, 'height': this.height});
    }).start();

  new TWEEN.Tween(object.rotation)
    .to({x: target.rotation.x, y: target.rotation.y, z: target.rotation.z}, duration)
    .easing(TWEEN.Easing.Exponential.InOut).start();

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
      jSelectedSlide.find('.content').removeClass('hidden');
    }).start();

  new TWEEN.Tween({'width': originalSize.width, 'height': originalSize.height})
    .to({'width': 800, 'height': 600}, duration).easing(TWEEN.Easing.Exponential.InOut)
    .onUpdate(function() {
      $(object.element).css({'width': this.width, 'height': this.height});
    }).start();

  new TWEEN.Tween(object.rotation).to({x: 0, y: 0, z: 0}, duration)
    .easing(TWEEN.Easing.Exponential.InOut).start();

  new TWEEN.Tween(window).to({}, duration * 2).onUpdate(render).start();
}

function toggleControlsActive() {
  controls.noPan = !controls.noPan ;
  controls.noRoll = !controls.noRoll;
  controls.noRotate = !controls.noRotate;
  controls.noZoom = !controls.noZoom;
}

function initCatalogue(slides) {
  // first, build the datasoucre for the catalogue
  var catalogueDatasource = [];
  catalogueDatasource.push({"id" : slides.id.replace(/ui/, 'cn'), "parent" : "#", "text" : slides.banner});

  $.when(loopGenerateCatalogueNode(catalogueDatasource, slides.children, slides.id))
    .done(function() {
      // instantiate a tree-catalogue for slides
      $('#catalogue-content').jstree({'core' : {
          'data' : catalogueDatasource
        } 
      });
       
      // instantiate a scrollbar for the tree-catalogue
      $('#catalogue-content').jScrollPane({"showArrows": true, "arrowScrollOnHover": true});
    });

}

function loopGenerateCatalogueNode(datasource, arr, id) {
  CatalogueNode(datasource, arr, id);
  var count = arr.length;
  for(var i = 0;i < count; i++) {
    var children = arr[i].children;
    var parentId = arr[i].id;
    if (children) {
      loopGenerateCatalogueNode(datasource, children, parentId);
    }
  }
}

function CatalogueNode(datasource, arr, parentId) {
  var count = arr.length;
  for(var i = 0;i < count; i++) {
    datasource.push({ 
      "id" : arr[i].id.replace(/ui/, 'cn'),
      "parent" : parentId.replace(/ui/, 'cn'),
      "text" : arr[i].banner
    });
  }
}