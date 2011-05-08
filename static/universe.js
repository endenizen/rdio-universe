function Universe() {
  log('creating the universe');

  this.keyStarLookup = {};
  this.keyPlanetLookup = {};

  this.lastUpdate = new Date().getTime();

  this.camera = null;
  this.renderer = null;
  this.projector = null;

  this.createRenderer();
}

Universe.prototype.createRenderer = function() {

  var self = this;

  this.camera = new THREE.Camera(70, window.innerWidth / window.innerHeight, 1, 10000);

  this.scene = new THREE.Scene();
  this.scene.fog = new THREE.FogExp2(0x000000, 0.00015);

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
  this.zoomedStar = star
  //this.camera = new THREE.Camera(120, window.innerWidth / window.innerHeight, 1, 10000);
  var params = {
    fov: 70,
    aspect: window.innerWidth / window.innerHeight,
    near: 1,
    far: 10000
  };
  //this.camera = new THREE.PathCamera(params);
  this.camera.target = star.mesh;
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
  this.keyStarLookup[obj.artistKey] = newStar;
};

var radius = 600;
var theta = 0;

Universe.prototype.update = function() {
  var self = this;

  requestAnimationFrame(function() {
    self.update();
  });

  var time = new Date().getTime();
  this.tdiff = (time - this.lastUpdate) / 1000;
  this.lastUpdate = time;

  theta += 0.2;
  this.camera.position.x = radius * Math.sin(theta * Math.PI / 360);
  this.camera.position.y = radius * Math.sin(theta * Math.PI / 360);
  this.camera.position.z = radius * Math.cos(theta * Math.PI / 360);

  this.renderer.render(this.scene, this.camera);
};
