// manual imports
var Matrix4 = THREE.Matrix4;
var Vector3 = THREE.Vector3;

// references to different fractals
fractals = [];
var lastFractal;

// time information
var paused = false;
var time = 0.0;
var endTime = 18.0;
var direction = 1;

// listener for dropdown menu choosing the fractal
var fractal_choice = document.getElementById('fractal-choice');
fractal_choice.addEventListener("change", function () {
  fillScene();
});

// listener for pressing the pause button, toggles 'paused' state
var pause_button = document.getElementById('pause-button');
pause_button.onclick = function () {
  pause_button.querySelector('.icon').classList.toggle("paused");
  paused = !paused;
};

// listener for pressing the direction-change button, toggles 'direction'
var direction_button = document.getElementById('direction-button');
direction_button.onclick = function () {
  direction_button.querySelector('.icon').classList.toggle("backward");
  direction = -direction;
};

// listener for pressing the stop button, resets time (= 0)
var stop_button = document.getElementById('stop-button');
stop_button.onclick = function () {
  time = 0;
};

// stores whether the automatic slider movement is paused right now
var sliderPause = false;

// listener for changing the time slider
var time_input = document.getElementById('timeinput');
time_input.oninput = function () {
  time = time_input.value / 1000 * endTime;
  sliderPause = true;
};
time_input.onchange = function () {
  time = time_input.value / 1000 * endTime;
  sliderPause = false;
};


// elements for displaying infos
var hausdorff_display = document.getElementById('hausdorff-display');
var iteration_display = document.getElementById('iteration-display');
var count_display = document.getElementById('count-display');
var speed_display = document.getElementById('speed-display');

// listener for speed slider
var speed_input = document.getElementById('speedinput');
speed_input.value = 0;
speed_input.oninput = function () {
  var speed = Math.pow(2.0, speed_input.value);
  speed_display.innerHTML = speed.toString() + "x";
  direction = Math.sign(direction) * speed;
};

// DOM element reference
var container;

// Three.js global scene parameters
var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

// custom shader uniform
var customUniforms = {
  scale: { value: 1 },
  modifier: {
    value: [new Matrix4(), new Matrix4(), new Matrix4(), new Matrix4(),
    new Matrix4(), new Matrix4(), new Matrix4(), new Matrix4()]
  },
  colors: { value: [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1), new Vector3(1, 1, 1)] },
  shifts: { value: [2, 3, 1, 0] },
  movement_time: { value: 0 },
  use_normal_color: { value: 1 },
};

// information concerning the currently rendered fractal
var material;
var fractal;
var mesh;

// information concerning the time updates
var lastUpdate = 0;
var transformTime = 2.0;
var waitTime = 1.0;
var openingTime = 1.0;

// called once on startup (or if WebGl context was lost)
function init() {

  var fractal_choices = '';
  fractals.forEach((fractal, i) => {
    fractal_choices += '<option value="' + i + '">' + fractal.name + '</option>';
  });
  fractal_choice.innerHTML = fractal_choices;

  container = document.getElementById('canvas');

  // camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
  camera.position.set(-400, 850, -50);

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(renderer.domElement);

  renderer.gammaInput = true;
  renderer.gammaOutput = true;

  // events
  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('keydown', onKeyDown, false);

  // controls
  cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
  cameraControls.update();

  // material
  material = new THREE.ShaderMaterial({
    uniforms: customUniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide
  });

  fillScene();
}

// window resize listener
function onWindowResize(event) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// key input listsner
function onKeyDown(event) {
  switch (event.keyCode) {
    case 82:
      location.reload();
      break;
  }
};

// requests & starts rendering of frame
function animate() {
  requestAnimationFrame(animate);
  render();
}

// renderin loop
function render() {

  var delta = clock.getDelta();

  // step forward if not paused
  if (!paused && !sliderPause) {
    time += delta * direction;
  }

  // clamping time to possible values
  time = Math.max(Math.min(time, endTime), 0.0);
  time_input.value = time / endTime * 1000;

  // calculate time status indicators
  var opening = Math.min(time, openingTime);
  var iter = Math.floor((time - opening) / transformTime);
  var normTime = Math.max(time - (iter * transformTime) - opening - waitTime, 0);

  material.uniforms["movement_time"].value = normTime;

  // change iteration
  if (iter != lastUpdate || lastFractal != fractal) {
    iteration_display.innerHTML = iter;
    count_display.innerHTML = fractal.count(iter);
    lastUpdate = iter;
    customUniforms["scale"].value = fractal.scale(iter);
    instancedPositionsAttribute.set(generatePositionRecursion(iter, fractal));
    instancedPositionsAttribute.needsUpdate = true;
    mesh.geometry.maxInstancedCount = fractal.count(iter);
  }

  material.uniforms["modifier"].value = fractal.update(opening, normTime);

  // update camera
  cameraControls.update(delta);

  // render
  mesh.scale.set(500, 500, 500);
  renderer.render(scene, camera);
}

// creates the Three.js scene and fills it with objects
function fillScene() {

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x808080, 20, 40);
  scene.add(camera);

  // lights
  scene.add(new THREE.AmbientLight(0x222222));

  scene.add(new THREE.GridHelper(1000, 10));

  lastFractal = fractal;
  fractal = new fractals[fractal_choice.selectedIndex].class;
  hausdorff_display.innerHTML = fractal.hausdorffDimension();
  endTime = fractal.time() * 2.0;
  mesh = fractal.create(material);
  scene.add(mesh);
}

// starts the generation of the iterative positions using a recursion (positions of earlier iterations are first)
function generatePositionRecursion(depth, fractal) {
  var instancePositions = new Float32Array(fractal.count(fractal.maxDepth) * 3);
  if (depth > 0) {
    var offset = iteratePositionRecursion(depth - 1, 1.0, new Vector3(), 0, instancePositions, fractal);
    console.log(depth, offset / 3.0, offset);
  }
  return instancePositions;
}

// recursive function of the generation of iterative positions
function iteratePositionRecursion(depth, scale, position, offset, instancePositions, fractal) {

  // for every new position => transform.length = scaling factor for hausdorff dimension calculation
  for (var i = 0; i < fractal.transforms.length; i++) {
    var v = position.clone().addScaledVector(fractal.transforms[i], scale);

    if (depth == 0) {
      instancePositions[offset++] = v.x;
      instancePositions[offset++] = v.y;
      instancePositions[offset++] = v.z;
    } else {
      offset = iteratePositionRecursion(depth - 1, scale * 1 / fractal.scale(1), v, offset, instancePositions, fractal);
    }
  }

  return offset;
}

// listener when window loading is complete
window.addEventListener('load', function () {
  init();
  animate();
});