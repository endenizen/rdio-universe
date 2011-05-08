function Universe() {
  log('creating the universe');

  this.stars = [];
  this.keyStarLookup = {};
  this.keyPlanetLookup = {};

  this.lastUpdate = new Date().getTime();

  this.cameraBase = {x: 0, y: 0, z: 0};

  this.camera = null;
  this.renderer = null;
  this.projector = null;

  this.cameraPath = null;
  this.cameraTargetPath = null;
  this.cameraPathStartTime = null;

  // slowly move the camera to these positions
  this.cameraTargetLocation = null;
  this.cameraLocation = null;

  this.userInteracting = false;

  this.handlers = handlers.apply(this);

  this.distanceTarget = 100000;
  this.distance = this.distanceTarget;

  this.mouse = {x: 0, y: 0};
  this.mouseOnDown = {x: 0, y: 0};
  this.rotation = {x: 0, y: 0};
  this.target = {x: Math.PI * 3/2, y: Math.PI / 6.0};
  this.targetOnDown = {x: 0, y: 0};

  this.createRenderer();
}

Universe.prototype.createRenderer = function() {

  var self = this;

  this.camera = new THREE.Camera(70, window.innerWidth / window.innerHeight, 1, 10000);
  this.camera.position.x = 0;
  this.camera.position.y = 0;
  this.camera.position.z = -5000;

  // dummy object for the camera to track
  var geometry = new THREE.Cube(1, 1, 1);
  var material = new THREE.MeshBasicMaterial();
  this.dummyTarget = new THREE.Mesh(geometry, material);
  this.dummyTarget.position.x = 0;
  this.dummyTarget.position.y = 0;
  this.dummyTarget.position.z = 0;

  this.scene = new THREE.Scene();
  this.scene.fog = new THREE.FogExp2(0x000000, 0.00015);

  this.scene.addObject(this.dummyTarget);
  this.camera.target = this.dummyTarget;

  var ambientLight = new THREE.AmbientLight(0xcccccc);
  this.scene.addLight(ambientLight);

  /*var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
  directionalLight.position.x = 1;
  directionalLight.position.y = 1;
  directionalLight.position.z = 0.5;
  directionalLight.position.normalize();
  this.scene.addLight( directionalLight );*/

  this.projector = new THREE.Projector();

  this.renderer = new THREE.WebGLRenderer({clearAlpha: 1});
  this.renderer.setSize( window.innerWidth, window.innerHeight );

  document.getElementById('holder').appendChild( this.renderer.domElement );

  this.update();

  document.addEventListener('mousedown', this.handlers.handleMouseDown, false);
  document.addEventListener('mousewheel', this.handlers.handleMouseWheel, false);
  document.addEventListener('mouseover', function() {
    self.overRenderer = true;
  }, false);
  document.addEventListener('mouseout', function() {
    self.overRenderer = false;
  }, false);
};

var handlers = function() {
  var self = this;
  return {
    handleMouseDown: function() {
      self.handleMouseDown.apply(self, arguments);
    },
    handleMouseUp: function() {
      self.handleMouseUp.apply(self, arguments);
    },
    handleMouseMove: function() {
      self.handleMouseMove.apply(self, arguments);
    },
    handleMouseOut: function() {
      self.handleMouseOut.apply(self, arguments);
    },
    handleMouseWheel: function() {
      self.handleMouseWheel.apply(self, arguments);
    }
  };
};

Universe.prototype.handleMouseWheel = function(event) {
  event.preventDefault();
  if(this.overRenderer) {
    this.zoom(event.wheelDeltaY * 0.3);
  }
  return false;
};

Universe.prototype.zoom = function(delta) {
  this.distanceTarget -= delta;
  this.distanceTarget = this.distanceTarget > 5000 ? 5000 : this.distanceTarget;
  this.distanceTarget = this.distanceTarget < 250 ? 250 : this.distanceTarget;
};

Universe.prototype.handleMouseOut = function(event) {
  document.removeEventListener('mouseup', this.handlers.handleMouseUp, false);
  document.removeEventListener('mousemove', this.handlers.handleMouseMove, false);
  document.removeEventListener('mouseout', this.handlers.handleMouseOut, false);
};

Universe.prototype.handleMouseUp = function(event) {
  event.preventDefault();

  // if mouse was moved less than threshold, act like it was a click
  var threshold = 20;
  var distanceX = Math.abs(- event.clientX - this.mouseOnDown.x);
  var distanceY = Math.abs(event.clientY - this.mouseOnDown.y);
  if(distanceX < threshold || distanceY < threshold) {
    var clickedObject = this.getIntersectingObject(event);
    if(clickedObject) {
      clickedObject.star.handleClick();
      this.zoomToStar(clickedObject.star);
    }
  }

  document.removeEventListener('mouseup', this.handlers.handleMouseUp, false);
  document.removeEventListener('mousemove', this.handlers.handleMouseMove, false);
  document.removeEventListener('mouseout', this.handlers.handleMouseOut, false);

  document.body.style.cursor = 'auto';
};

var PI_HALF = Math.PI / 2;

Universe.prototype.handleMouseMove = function(event) {
  this.mouse.x = - event.clientX;
  this.mouse.y = event.clientY;

  var zoomDamp = this.distance/1000;

  this.target.x = this.targetOnDown.x + (this.mouse.x - this.mouseOnDown.x) * 0.005 * zoomDamp;
  this.target.y = this.targetOnDown.y + (this.mouse.y - this.mouseOnDown.y) * 0.005 * zoomDamp;

  this.target.y = this.target.y > PI_HALF ? PI_HALF : this.target.y;
  this.target.y = this.target.y < - PI_HALF ? - PI_HALF : this.target.y;
};

Universe.prototype.getIntersectingObject = function(event) {
  var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );

  this.projector.unprojectVector( vector, this.camera );

  var ray = new THREE.Ray( this.camera.position, vector.subSelf( this.camera.position ).normalize() );

  var intersects = ray.intersectScene( this.scene );

  if ( intersects.length > 0 ) {
    var clickedObject = intersects[0].object;
    return clickedObject;
  }
  return null;
};

Universe.prototype.handleMouseDown = function(event) {
  event.preventDefault();

  document.addEventListener('mousemove', this.handlers.handleMouseMove, false);
  document.addEventListener('mouseup', this.handlers.handleMouseUp, false);
  document.addEventListener('mouseout', this.handlers.handleMouseOut, false);

  var self = this;

  this.userInteracting = true;

  this.mouseOnDown.x = - event.clientX;
  this.mouseOnDown.y = event.clientY;

  this.targetOnDown.x = this.target.x;
  this.targetOnDown.y = this.target.y;

  document.body.style.cursor = 'move';
};

Universe.prototype.zoomToStar = function(star) {
  if(this.zoomedStar) {
    this.zoomedStar.hidePlanets();
  }
  this.zoomedStar = star;

  log('moving to star at position ',star.mesh.position);

  var waypoints = [[this.cameraBase.x, this.cameraBase.y, this.cameraBase.z], [star.mesh.position.x, star.mesh.position.y, star.mesh.position.z]];
  log('waypoints: ',waypoints);

  var cameraSpline = new THREE.Spline();
  cameraSpline.initFromArray(waypoints);
  this.cameraPath = cameraSpline;

  waypoints = [[this.dummyTarget.position.x, this.dummyTarget.position.y, this.dummyTarget.position.z], [star.mesh.position.x, star.mesh.position.y, star.mesh.position.z]];
  var cameraTargetSpline = new THREE.Spline();
  cameraTargetSpline.initFromArray(waypoints);
  this.cameraTargetPath = cameraTargetSpline;


  this.cameraFinalLocation = {
    x: star.mesh.position.x,
    y: star.mesh.position.y + 100,
    z: star.mesh.position.z - 500
  };
  this.cameraTargetFinalLocation = {
    x: star.mesh.position.x,
    y: star.mesh.position.y,
    z: star.mesh.position.z
  };

  star.showPlanets();
};

Universe.prototype.hasPlanet = function(key) {
  if(this.keyPlanetLookup[key]) {
    return true;
  }
  return false;
};

Universe.prototype.addPlanet = function(obj) {
  log('universe added planet ' + obj.key);
  if(!this.hasStar(obj.artistKey)) {
    this.addStar(obj);
  }
  var star = this.keyStarLookup[obj.artistKey];
  var newPlanet = new Planet(star, obj);
  star.addPlanet(newPlanet);
  this.keyPlanetLookup[obj.key] = newPlanet;
};

Universe.prototype.hasStar = function(key) {
  if(this.keyStarLookup[key]) {
    return true;
  }
  return false;
};

Universe.prototype.addStar = function(obj) {
  log('universe added star ' + obj.artistKey);
  var newStar = new Star(this, this.scene, obj);
  this.stars.push(newStar);
  this.keyStarLookup[obj.artistKey] = newStar;
};

//var theta = 0;
var cameraMoveTime = 1000;

Universe.prototype.update = function() {
  var self = this;
  requestAnimationFrame(function() {
    self.update();
  });

  for (var i = 0; i < this.stars.length; i++) {
    var star = this.stars[i];
    star.update()
  }
  this.zoom(0);
  
  this.rotation.x += (this.target.x - this.rotation.x) * 0.1;
  this.rotation.y += (this.target.y - this.rotation.y) * 0.1;
  this.distance += (this.distanceTarget - this.distance) * 0.3;

  var time = new Date().getTime();
  this.tdiff = (time - this.lastUpdate) / 1000;
  this.lastUpdate = time;

  if(this.cameraFinalLocation) {
    this.camera.position.x += (this.cameraFinalLocation.x - this.camera.position.x) * 0.1;
    this.camera.position.y += (this.cameraFinalLocation.y - this.camera.position.y) * 0.1;
    this.camera.position.z += (this.cameraFinalLocation.z - this.camera.position.z) * 0.1;
  }

  if(this.cameraFinalTargetLocation) {
    this.dummyTarget.position.x += (this.cameraTargetFinalLocation.x - this.dummyTarget.position.x) * 0.1;
    this.dummyTarget.position.y += (this.cameraTargetFinalLocation.y - this.dummyTarget.position.y) * 0.1;
    this.dummyTarget.position.z += (this.cameraTargetFinalLocation.z - this.dummyTarget.position.z) * 0.1;
  }

  if(this.cameraPath) {
    if(!this.cameraPathStart) {
      this.cameraPathStart = time;
    }
    if(time - this.cameraPathStart > cameraMoveTime) {
      // final step, move to end of spline and unset cameraPath
      this.cameraPath = null;
      this.cameraPathStart = null;
    } else {

      var moment = (time - this.cameraPathStart) / cameraMoveTime;
      var point = this.cameraPath.getPoint(moment);

      this.cameraBase.x = point.x;
      this.cameraBase.y = point.y;
      this.cameraBase.z = point.z;

      point = this.cameraTargetPath.getPoint(moment);
      this.dummyTarget.position.x = point.x;
      this.dummyTarget.position.y = point.y;
      this.dummyTarget.position.z = point.z;
    }
  }

  this.camera.position.x = this.cameraBase.x + this.distance * Math.sin(this.rotation.x) * Math.cos(this.rotation.y);
  this.camera.position.y = this.cameraBase.y + this.distance * Math.sin(this.rotation.y);
  this.camera.position.z = this.cameraBase.z + this.distance * Math.cos(this.rotation.x) * Math.cos(this.rotation.y);

  this.renderer.render(this.scene, this.camera);
};
