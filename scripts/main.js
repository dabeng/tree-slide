  var camera, scene, renderer;
  var cameraDist = 3000;
  var fov = 40;// field of view
  var pi = Math.PI / 180;
  var controls;
  var objects = [];
  var targets = { 'table': [], 'sphere': [], 'helix': [], 'grid': [] };

  $(function($){
	
    init();
    animate();

  });

  function init() {

   // layout
   $('#effect').on('mouseenter', function(){
     if(!$(this).is(':animated')) {
       $(this).animate({'right': '0px'}, 'slow');
     }
   });

   $('#effect').on('mouseleave', function(){
     if(!$(this).is(':animated')) {
       $(this).animate({'right': '-190px'}, 'slow');
     }
   });

   $('#catalogue').on('mouseenter', function(){
   	 if(!$(this).is(':animated')) {
       $(this).animate({'left': '0px'}, 'slow');
     }
   });

   $('#catalogue').on('mouseleave', function(){
   	 if(!$(this).is(':animated')) {
       $(this).animate({'left': '-190px'}, 'slow');
     }
   });

    // left, top, right and down keys
    $(document).on('keyup', function(event) {
      switch(event.which) {
        case 37: {
          if($('#container').is('.multipleSlide')) {
            focusLeftSlide();
          }
          else if($('#container').is('.singleSlide')) {
            turnToNewSlide('previous');
          }
          break;
        }
        case 38: {
          if($('#container').is('.multipleSlide')) {
            focusUpSlide();
          }
          else if($('#container').is('.singleSlide')) {
            turnToNewSlide('previous');
          }
          break;
        }
        case 39: {
          if($('#container').is('.multipleSlide')) {
            focusRightSlide();
          }
          else if($('#container').is('.singleSlide')) {
          	turnToNewSlide('next');
          }
          break;
        }
        case 40: {
          if($('#container').is('.multipleSlide')) {
            focusDownSlide();
          }
          else if($('#container').is('.singleSlide')) {
            turnToNewSlide('next');
          }
          break;
        }
      }
    });


    var aspect = window.innerWidth / window.innerHeight;
	camera = new THREE.PerspectiveCamera(fov, aspect, 0, 10000);

	camera.position.z = cameraDist;
	scene = new THREE.Scene();
    var vector = new THREE.Vector3();

    var nearPlaneHeight = cameraDist * Math.tan(fov / 2 * pi) * 2;
    var nearPlaneWidth = nearPlaneHeight * (4 / 3);
    var margin = 20;
    setRowCol(datasource);

    var rowColNum = getRowCol(datasource.length);
    var rowCount = rowColNum.row;
	var rowHeight = Math.round((nearPlaneHeight - (rowCount-1) * margin
		) / rowCount);
	var colCount = rowColNum.col;
    var colWidth = Math.round((nearPlaneWidth - (colCount - 1) * margin) / colCount);


	// 3D table
	$.each(datasource, function(index, slide) {
	  var jSlide = $('<article>', { 'class': 'slide', 'css':{
	  	'width': colWidth,
	  	'height': rowHeight,
	  	'backgroundColor': 'rgba(51,0,51,' + (Math.random() * 0.5 + 0.25) + ')'}
	  });
	  jSlide.append($('<div>', { 'class': 'number', 'text': index + 1 }));
	  jSlide.append($('<div>', { 'class': 'banner', 'text': slide['name'] }));
	  jSlide.append($('<div>', { 'class': 'content'}).html(slide['fullname']));

	  jSlide.on('dblclick', makeCenterEffect(index));

	  var css3dObject = new THREE.CSS3DObject( jSlide[0] );
	  css3dObject.position.x = Math.random() * 4000 - 2000;
	  css3dObject.position.y = Math.random() * 4000 - 2000;
	  css3dObject.position.z = Math.random() * 4000 - 2000;
	  scene.add( css3dObject );
	  objects.push( css3dObject );

      var object3D = new THREE.Object3D();
	  object3D.position.x = -(colCount * (colWidth + margin) - margin) / 2
	    + (slide['col'] - 1) * (colWidth + margin) + colWidth / 2;
	  object3D.position.y = (rowCount * (rowHeight + margin) - margin) / 2
	    - (slide['row'] - 1) * (rowHeight + margin) - rowHeight / 2; 
	
	  targets.table.push(object3D);
    });




    var count = objects.length;
    var phi, theta;

	// sphere
	var diameter = Math.round(nearPlaneWidth/Math.PI);
	for (i = 0; i < count; i++) {
	  var object3D = new THREE.Object3D();
	  phi = Math.acos(-1 + ( 2 * i ) / count);
	  theta = Math.sqrt(count * Math.PI) * phi;
	  object3D.position.x = diameter * Math.cos(theta) * Math.sin(phi);
	  object3D.position.y = diameter * Math.sin(theta) * Math.sin(phi);
	  object3D.position.z = diameter * Math.cos(phi);

	  vector.copy(object3D.position).multiplyScalar(2);
	  object3D.lookAt(vector);
	  targets.sphere.push(object3D);
	}

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

	$('#effect-3dtable').on('click', function (event) { transform(targets.table, 1000 ); });
	$('#effect-sphere').on('click', function (event) { transform(targets.sphere, 1000 ); });

	transform(targets.table, 1000);

	//
	$(window).on('resize', onWindowResize);
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

function makeCenterEffect(index) {
  return function () {
    //
    controls.removeEventListener('change', render);

  	var jSelectedSlide = $(objects[index].element);
  	var jOtherSlides = $('.slide').not(objects[index].element);

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

    // move to the origin
    objects[index].translateX(-targets.table[index].position.x);
    objects[index].translateY(-targets.table[index].position.y);

  	// turn to the screen
  	controls.reset();
    var vector = new THREE.Vector3(0, 0, cameraDist);
	  objects[index].lookAt(vector);

    // fit into render area by HEIGHT
    $(objects[index].element).css({'width': '800px', 'height': '600px'});

	  objects[index].translateZ(cameraDist - ((window.innerHeight / 2) / Math.tan(fov / 2 * pi)));

	  // re-render the scene
	  render();
  };
}

// turn to new slide according to the current slide
function turnToNewSlide(type) {
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
  hideCurrentSlide(index, 500);

  // show the new slide
  if(type === 'next') {
    showNewSlide(index + 1, 500);
  } else {
    showNewSlide(index - 1, 500);
  }
}


function hideCurrentSlide(index, duration) {
  var object = objects[index];
  var target = targets.table[index];
  // TWEEN.removeAll();

  new TWEEN.Tween(object.position).to({x: target.position.x, y: target.position.y,
    z: target.position.z}, Math.random() * duration + duration)
    .easing(TWEEN.Easing.Exponential.InOut).start();

  new TWEEN.Tween(object.rotation).to({x: target.rotation.x, y: target.rotation.y,
    z: target.rotation.z}, Math.random() * duration + duration)
    .easing(TWEEN.Easing.Exponential.InOut).start();
  

  new TWEEN.Tween(window).to({}, duration * 2).onUpdate(render).start();
}

function showNewSlide(index, duration) {
  var jSelectedSlide = $(objects[index].element);
  var jOtherSlides = $('.slide').not(objects[index].element);
    
  // set flag to identify which slide is being read
  jOtherSlides.removeClass('currentSlide');
  jSelectedSlide.addClass('currentSlide');

  // create the data-index property of slide of jquery object
  $('.currentSlide').prop('data-index', index);

  // show the focused slide and hide the other slides
  jSelectedSlide.removeClass('hidden');
  jOtherSlides.addClass('hidden');

  // move to the origin
  // objects[index].translateX(-targets.table[index].position.x);
  // objects[index].translateY(-targets.table[index].position.y);

  // turn to the screen
  // controls.reset();
  // var vector = new THREE.Vector3(0, 0, cameraDist);
  // objects[index].lookAt(vector);

  // fit into render area by HEIGHT
  $(objects[index].element).css({'width': '800px', 'height': '600px'});
  // objects[index].translateZ(cameraDist - ((window.innerHeight / 2) / Math.tan(fov / 2 * pi)));

  // re-render the scene
  // render();

    var object = objects[index];
  var target = targets.table[index];

    new TWEEN.Tween(object.position).to({x: 0, y: 0,
    z: cameraDist - (window.innerHeight / 2) / Math.tan(fov / 2 * pi)}, Math.random() * duration + duration)
    .easing(TWEEN.Easing.Exponential.InOut).start();

  new TWEEN.Tween(object.rotation).to({x: target.rotation.x, y: target.rotation.y,
    z: target.rotation.z}, Math.random() * duration + duration)
    .easing(TWEEN.Easing.Exponential.InOut).start();


  new TWEEN.Tween(window).to({}, duration).onUpdate(render).start();
}