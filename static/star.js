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
        'texture': { type: 't', value: 0, texture: null }
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
      fragmentShader: [
        'uniform sampler2D texture;',
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'vec3 diffuse = texture2D( texture, vUv ).xyz;',
          'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
          'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
          'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
        '}'
      ].join('\n')
    },
    'atmosphere' : {
      uniforms: {},
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
          'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
        '}'
      ].join('\n')
    }
  };

  var geometry = new THREE.Sphere(100, 40, 30);
  var shader = Shaders['earth'];
  var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
  uniforms['texture'].texture = THREE.ImageUtils.loadTexture(this.obj.icon);
  var material = new THREE.MeshShaderMaterial({
    uniforms: uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader
  });

  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.position.y = Math.random() * 1000 - 500;
  this.mesh.position.x = Math.random() * 1000 - 500;
  this.mesh.position.z = Math.random() * 1000 - 500;
  //this.mesh.matrixAutoUpdate = false;

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
  this.mesh.position.y = time / 1000000;
};

Star.prototype.handleClick = function() {
  play('r' + this.obj.artistKey, this.obj.icon);
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
