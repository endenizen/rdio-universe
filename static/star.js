function Star(universe, scene, obj) {
  this.planets = {};

  this.universe = universe;
  this.scene = scene;
  this.obj = obj;

  this.init();
}

Star.prototype.init = function() {

  var Shaders = {
    'earth' : {
      uniforms: {
        'texture': { type: 't', value: 0, texture: null },
        'time': { type: 'f', value: 1.0 },
        'alpha': { type: 'f', value: 0 }
      },
      vertexShader: [
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
          'vNormal = normalize( normalMatrix * normal );',
          'vUv = uv;',
        '}'
      ].join('\n'),
      fragmentShader: null, // MOVED temporarily to #noise_shaders for ease of editing
    },
    'atmosphere' : {
      uniforms: { 'alpha': { type: 'f', value: 0 }
      },
      vertexShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'vNormal = normalize( normalMatrix * normal );',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
          'gl_FragColor = vec4( 1.0, 1.0, 1.0, alpha ) * intensity;',
        '}'
      ].join('\n')
    }
  };

  var geometry = new THREE.Sphere(100, 40, 30);
  var shader = Shaders['earth'];
  var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
  uniforms['texture'].texture = THREE.ImageUtils.loadTexture(this.obj.icon.replace('200', '600'));

  var material = new THREE.MeshShaderMaterial({
    uniforms: uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: document.getElementById("noise_shaders").textContent //shader.fragmentShader
  });

  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.position.y = Math.random() * 5000 - 2500;
  this.mesh.position.x = Math.random() * 5000 - 2500;
  this.mesh.position.z = Math.random() * 5000 - 2500;
  //this.mesh.matrixAutoUpdate = false;

  this.rotation_speed = Math.random() * 0.002 + 0.002;
  this.mesh.rotation.y += Math.random() * 180;
  var scale = Math.random() * 0.9 + 0.6;
  this.mesh.scale.x = scale;
  this.mesh.scale.y = scale;
  this.mesh.scale.z = scale;


  this.scene.addObject(this.mesh);

  this.mesh.star = this;
};

Star.prototype.getKey = function() {
  if(this.obj.artistKey) {
    return this.obj.artistKey;
  }
  return null;
};

Star.prototype.update = function(time) {
  var alpha = this.mesh.materials[0].uniforms.alpha.value;
  if (alpha < 1.0) { alpha += 0.01 }
  else             { alpha = 1.0 }
  this.mesh.materials[0].uniforms.alpha.value = alpha;
  this.mesh.materials[0].uniforms.time.value += 0.05;

  $.each(this.planets, function(key, value) {
    value.update();
  });

  this.mesh.rotation.y -= this.rotation_speed;
};

Star.prototype.handleClick = function() {
  //play(this.obj.key, this.obj.icon);
};

Star.prototype.addPlanet = function(planet) {
  this.planets[planet.obj.key] = planet;
};

Star.prototype.showPlanets = function() {
  $.each(this.planets, function(key, value) {
    value.show();
  });
};

Star.prototype.hidePlanets = function() {
  $.each(this.planets, function(key, value) {
    value.hide();
  });
};
