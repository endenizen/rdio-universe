function Universe() {
  log('creating the universe');
  this.stars = [];

  this.lastUpdate = new Date().getTime();

  this.camera = null;
  this.renderer = null;

  this.createRenderer();
}

Universe.prototype.createRenderer = function() {

  this.camera = new THREE.QuakeCamera({
    activeLook: false,
    fov: 50,
    aspect: window.innerWidth / window.innerHeight,
    near: 1,
    far: 10000,
    constrainVertical: true,
    verticalMin: 1.1,
    verticalMax: 2.2,
    movementSpeed: 1000,
    lookSpeed: 0.125,
    noFly: true,
    lookVertical: true,
    autoForward: false
  });
  this.camera.position.y = 50;
  this.camera.position.x = -500;
  this.camera.position.z = 0;
  this.camera.target.position.y = 100;

  this.scene = new THREE.Scene();
  this.scene.fog = new THREE.FogExp2(0x000000, 0.00015);

  var ambientLight = new THREE.AmbientLight(0xcccccc);
  this.scene.addLight(ambientLight);

  //column = new Column({pieces:11, spacing: 30});
  //column.init(this.scene);

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
  directionalLight.position.x = 1;
  directionalLight.position.y = 1;
  directionalLight.position.z = 0.5;
  directionalLight.position.normalize();
  this.scene.addLight( directionalLight );

  /*var geometry = new THREE.Plane(20000,20000);
  this.plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color:0x333333}));
  this.plane.rotation.x = -90 * ( Math.PI / 180 );
  this.scene.addObject(this.plane);*/

  this.renderer = new THREE.WebGLRenderer();
  this.renderer.setSize( window.innerWidth, window.innerHeight );

  document.body.appendChild( this.renderer.domElement );

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

  this.renderer.render(this.scene, this.camera);
};
