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
      ].join('\n'),
      fragmentShaderGlowy: [
        'uniform sampler2D texture;',
        'uniform float alpha;',
        'uniform float time;',
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'vec3 noise() {',
          'return vec3(1.2,3.3,0.5);',
          'vec2 resolution = vec2( 200.0, 200.0 );',
          'vec2 p = -1.0 + 2.0 * vUv;',
          'float a = time*40.0;',
          'float d,e,f,g=1.0/40.0,h,i,r,q;',
          'e=400.0*(p.x*0.5+0.5);',
          'f=400.0*(p.y*0.5+0.5);',
          'i=200.0+sin(e*g+a/150.0)*20.0;',
          'd=200.0+cos(f*g/2.0)*18.0+cos(e*g)*7.0;',
          'r=sqrt(pow(i-e,2.0)+pow(d-f,2.0));',
          'q=f/r;',
          'e=(r*cos(q))-a/2.0;f=(r*sin(q))-a/2.0;',
          'd=sin(e*g)*176.0+sin(e*g)*164.0+r;',
          'h=((f+d)+a/2.0)*g;',
          'i=cos(h+r*p.x/1.3)*(e+e+a)+cos(q*g*6.0)*(r+h/3.0);',
          'h=sin(f*g)*144.0-sin(e*g)*212.0*p.x;',
          'h=(h+(f-e)*q+sin(r-(a+h)/7.0)*10.0+i/4.0)*g;',
          'i+=cos(h*2.3*sin(a/350.0-q))*184.0*sin(q-(r*4.3+a/12.0)*g)+tan(r*g+h)*184.0*cos(r*g+h);',
          'i=mod(i/5.6,256.0)/64.0;',
          'if(i<0.0) i+=4.0;',
          'if(i>=2.0) i=4.0-i;',
          'd=r/350.0;',
          'd+=sin(d*d*8.0)*0.52;',
          'f=(sin(a*g)+1.0)/2.0;',
          'return vec3(f*i/1.6,i/2.0+d/13.0,i)*d*p.x + vec3(i/1.3+d/8.0,i/2.0+d/18.0,i)*d*(1.0-p.x);',
        '}',
        'void main() {',
          'vec3 diffuse = texture2D( texture, vUv ).xyz;',
          'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
          'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
          'vec3 noise = noise() * 0.5;',

          //float n = snoise(vec4(4.0 * v_texCoord3D.xyz, 0.5 * time));
          //gl_FragColor = v_color * vec4(0.5 + 0.5 * vec3(n, n, n), 1.0);

          'gl_FragColor = vec4( diffuse + atmosphere + noise, alpha );',
        '}'
      ].join('\n'),
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
  uniforms['texture'].texture = THREE.ImageUtils.loadTexture(this.obj.icon);

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

  if(this.universe.visData && this.universe.visData.star) {
    this.mesh.scale.y += (this.universe.visData.star - this.mesh.scale.y) * .05;
  }

  this.mesh.rotation.y -= this.rotation_speed;
};

Star.prototype.handleClick = function() {
  //play(this.obj.key, this.obj.icon);
};

Star.prototype.addPlanet = function(planet) {
  this.planets[planet.obj.key] = planet;
};

Star.prototype.showPlanets = function() {
  if(this.loadedPlanets) {
    $.each(this.planets, function(key, value) {
      value.show();
    });
  } else {
    var self = this;
    $.getJSON('/albums_for_artist/' + this.obj.key, function(a) {
      log('asked for albums for artist ' + self.obj.key + ' got ',a);
      self.loadedPlanets = true;
      $.each(a, function() {
        self.addPlanet(new Planet(self, this));
      });
      // now we have planets, show them again...
      self.showPlanets();
    });
  }
};

Star.prototype.hidePlanets = function() {
  $.each(this.planets, function(key, value) {
    value.hide();
  });
};
