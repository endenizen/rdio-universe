function Planet(star, obj) {
  this.star = star;
  this.universe = star.universe;
  this.scene = star.scene;
  this.obj = obj;
  this.distance = 300;
  this.offset = Math.random() * 10;

  this.init();
}

Planet.prototype.update = function() {
};

Planet.prototype.init = function() {

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

  var geometry = new THREE.Sphere(10, 10, 10);
  var shader = Shaders['earth'];
  var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
  uniforms['texture'].texture = THREE.ImageUtils.loadTexture(this.obj.icon);
  var material = new THREE.MeshShaderMaterial({
    uniforms: uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader
  });

  this.mesh = new THREE.Mesh(geometry, material);
  var zPos = this.star.mesh.position.z + ((Math.random() - 0.5) * this.distance);
  var xPos = this.star.mesh.position.x + ((Math.random() - 0.5) * this.distance);
  this.mesh.position.x = xPos;
  this.mesh.position.y = this.star.mesh.position.y;
  this.mesh.position.z = zPos;
  this.distance = Math.random() * 100 + 150;
  this.rotation_speed = Math.random() * 0.1 + 0.1;

  this.mesh.planet = this;
};

var theta = 0;

Planet.prototype.update = function() {
  theta += 0.00005;
  var curPos = theta + this.offset;
  this.mesh.rotation.y -= this.rotation_speed
  this.mesh.position.x = this.star.mesh.position.x + this.distance * Math.cos(curPos);
  this.mesh.position.z = this.star.mesh.position.z + this.distance * Math.sin(curPos);
};

Planet.prototype.hide = function() {
  this.scene.removeObject(this.mesh);
};

Planet.prototype.show = function() {
  this.scene.addObject(this.mesh);
};

Planet.prototype.handleClick = function() {
  play(this.obj.key, this.obj.icon);
};
