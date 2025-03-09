//common code for all fractals based on non-rotated cubes in a 3x3x3 arrangement
function Fractal3x3x3Cube(transforms, maxDepth) {

    // next iteration is always 1/3rd (because 1/3x3x3)
    var itertationScale = 1/3;

    Fractal.call(this, transforms, itertationScale, maxDepth);
}

// defining prototpye
Fractal3x3x3Cube.prototype = Object.create(Fractal.prototype);
Fractal3x3x3Cube.prototype.constructor = Fractal3x3x3Cube;

// crearting the 3x3x3 cube fractal
Fractal3x3x3Cube.prototype.create = function(material) {

    var scale = this.iterationScale;

    // create original box, that will be cloned, 0.5 because we are centered
    var originalBox = new THREE.BoxBufferGeometry(0.5*scale, 0.5*scale, 0.5*scale);
    var boxes = [];

    // create clones of original box for every transform (supplied by inheriting class)
    this.transforms.forEach(transform => {
        var box = originalBox.clone()
            .applyMatrix(new THREE.Matrix4()
                .makeTranslation(transform.x*scale, (transform.y+0.25)*scale, transform.z*scale) // 0.25 because we want to have positive y values
            );
        boxes.push(box);
    });

    // merge all sub boxes to one geometry
    var prototypeGeometry = THREE.BufferGeometryUtils.mergeBufferGeometries(boxes);

    // create final instance geometry
    var instancedGeometry = new THREE.InstancedBufferGeometry();
    instancedGeometry.addAttribute('position', prototypeGeometry.getAttribute('position'));
    instancedGeometry.addAttribute('normal', prototypeGeometry.getAttribute('normal'));
    instancedGeometry.setIndex(prototypeGeometry.getIndex());

    // instancedGeometry.addAttribute('mask', new THREE.BufferAttribute(masks, 3));

    // create future instance positions
    instancedPositionsAttribute = new THREE.InstancedBufferAttribute(new Float32Array(generatePositionRecursion(0, this)), 3).setDynamic(true);
    instancedGeometry.addAttribute('instancePosition', instancedPositionsAttribute, 3);
    instancedGeometry.maxInstancedCount = 1;

    material.uniforms.use_normal_color.value = 1;
  
    // create and return Three.js mesh
    var mesh = new THREE.Mesh(instancedGeometry, material);
    return mesh;
}