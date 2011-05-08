function Universe() {
  log('creating the universe');

  this.stars = [];
  this.keyStarLookup = {};
  this.keyPlanetLookup = {};

  this.lastUpdate = new Date().getTime();

  this.camera = null;
  this.renderer = null;
  this.projector = null;

  this.createRenderer();

  this.cameraPath = null;
  this.cameraTargetPath = null;
  this.cameraPathStartTime = null;
}

Universe.prototype.createRenderer = function() {

  var self = this;

  this.camera = new THREE.Camera(70, window.innerWidth / window.innerHeight, 1, 10000);
  this.camera.position.x = 0;
  this.camera.position.y = 0;
  this.camera.position.z = -5000;

  // dummy object for the camera to track
  var geometry = new THREE.Cube(1, 1, 1);
  var material = new THREE.MeshBasicMaterial({color:0xcc0000});
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

  function handleClick() {
    self.handleClick.apply(self, arguments);
  }
  document.addEventListener('mousedown', handleClick, false);
};

Universe.prototype.handleClick = function(event) {
  event.preventDefault();
  var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );

  this.projector.unprojectVector( vector, this.camera );

  var ray = new THREE.Ray( this.camera.position, vector.subSelf( this.camera.position ).normalize() );

  var intersects = ray.intersectScene( this.scene );

  if ( intersects.length > 0 ) {
    var clickedObject = intersects[0].object;
    clickedObject.star.handleClick();
    this.zoomToStar(clickedObject.star);
  }
};

Universe.prototype.zoomToStar = function(star) {
  if(this.zoomedStar) {
    this.zoomedStar.hidePlanets();
  }
  this.zoomedStar = star;

  log('moving to star at position ',star.mesh.position);

  var waypoints = [[this.camera.position.x, this.camera.position.y, this.camera.position.z], [star.mesh.position.x, star.mesh.position.y + 100, star.mesh.position.z - 500]];
  log('waypoints: ',waypoints);

  var cameraSpline = new THREE.Spline();
  cameraSpline.initFromArray(waypoints);
  this.cameraPath = cameraSpline;

  waypoints = [[this.dummyTarget.position.x, this.dummyTarget.position.y, this.dummyTarget.position.z], [star.mesh.position.x, star.mesh.position.y, star.mesh.position.z]];
  var cameraTargetSpline = new THREE.Spline();
  cameraTargetSpline.initFromArray(waypoints);
  this.cameraTargetPath = cameraTargetSpline;

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

var radius = 600;
var theta = 0;
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

  var time = new Date().getTime();
  this.tdiff = (time - this.lastUpdate) / 1000;
  this.lastUpdate = time;

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
      this.camera.position.x = point.x;
      this.camera.position.y = point.y;
      this.camera.position.z = point.z;

      point = this.cameraTargetPath.getPoint(moment);
      this.dummyTarget.position.x = point.x;
      this.dummyTarget.position.y = point.y;
      this.dummyTarget.position.z = point.z;
    }
  }

  /*theta += 0.2;
  this.camera.position.x = radius * Math.sin(theta * Math.PI / 360);
  this.camera.position.y = radius * Math.sin(theta * Math.PI / 360);
  this.camera.position.z = radius * Math.cos(theta * Math.PI / 360);*/

  this.renderer.render(this.scene, this.camera);
};
