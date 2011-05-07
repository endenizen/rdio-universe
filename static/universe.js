function Universe() {
  log('creating the universe');
  this.stars = [];

  this.lastUpdate = new Date().getTime();

  this.camera = null;
  this.renderer = null;

  this.createRenderer();
}

Universe.prototype.createRenderer = function() {

  this.camera = new THREE.Camera(70, window.innerWidth / window.innerHeight, 1, 10000);

  this.scene = new THREE.Scene();
  this.scene.fog = new THREE.FogExp2(0x000000, 0.00015);

  var ambientLight = new THREE.AmbientLight(0xcccccc);
  this.scene.addLight(ambientLight);

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
  directionalLight.position.x = 1;
  directionalLight.position.y = 1;
  directionalLight.position.z = 0.5;
  directionalLight.position.normalize();
  this.scene.addLight( directionalLight );

  this.renderer = new THREE.WebGLRenderer();
  this.renderer.setSize( window.innerWidth, window.innerHeight );

  document.getElementById('holder').appendChild( this.renderer.domElement );

  this.update();
};

Universe.prototype.hasStar = function(key) {
  for(var a = 0; a < this.stars.length; a++) {
    if(this.stars[a].getKey() == key) {
      return true;
    }
  }
  return false;
};

Universe.prototype.addStar = function(obj) {
  log('universe added star ' + obj.artistKey);
  var newStar = new Star(this.scene, obj);
  newStar.init(this.scene);
  this.stars.push(newStar);
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

  $.each(this.stars, function(key, val) {
    this.update(time);
  });

  theta += 0.2;
  this.camera.position.x = radius * Math.sin(theta * Math.PI / 360);
  this.camera.position.y = radius * Math.sin(theta * Math.PI / 360);
  this.camera.position.z = radius * Math.cos(theta * Math.PI / 360);

  this.renderer.render(this.scene, this.camera);
};
