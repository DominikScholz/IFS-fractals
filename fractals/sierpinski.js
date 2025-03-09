// manual imports
var Matrix4 = THREE.Matrix4;
var Vector3 = THREE.Vector3;

function Sierpinski() {

    // recursive instance positions (see https://en.wikipedia.org/wiki/Tetrahedron and https://en.wikipedia.org/wiki/Equilateral_triangle)
    var transforms = [
        new Vector3(0,Math.sqrt(6)/3,0),
        new Vector3(-Math.sqrt(3)/3,0,0),   
        new Vector3(Math.sqrt(1/12),0,-0.5),
        new Vector3(Math.sqrt(1/12),0,0.5)
    ];

    var maxDepth = 8;
    var itertationScale = 1/2;

    Fractal.call(this, transforms, itertationScale, maxDepth);
}

Sierpinski.prototype = Object.create(Fractal.prototype);
Sierpinski.prototype.constructor = Sierpinski;
fractals.push({"class": Sierpinski, "name": "Sierpinski Tetrahedron"});

Sierpinski.prototype.time = function() {
    return this.maxDepth + 1;
}

Sierpinski.prototype.update = function(openingTime, normTime) {

    // weirdly Three.js doesn't have those
    var yaxis = new Vector3(0,1,0);
    var zaxis = new Vector3(0,0,1);

    var fullDegree = Math.acos(-1/3); //rotation from one triangle to the next
    var h3 = Math.sqrt(3)/3; // 3rd of height

    var degree = openingTime*fullDegree;
    var secondDegree = Math.min(normTime*fullDegree, fullDegree);

    var modifiers = [];


    // original movement (folding planar triangle inwards)
    translationMat = new Matrix4().makeTranslation(-h3/2,0,0); // translate 1rd of height (distance from center of triangle (subdvision 1) to corner of inner triangle (subdivision 1)
    translationMat2 = new Matrix4().makeTranslation(h3/2,0,0);
    preRot1 = new Matrix4().makeRotationAxis(yaxis, Math.PI*2/3); // rotates 1/3rd of full circle along y axis (rotates triangles in plane so they are equal to unrotated one)
    preRot2 = new Matrix4().makeRotationAxis(yaxis, -Math.PI*2/3);

    // first rotation (rotate outer subdivision 1 triangles to so they form tetrahedron)
    var rotationMat = new Matrix4().makeRotationAxis(zaxis,degree);

    // complete transformation for moving the red triangle (subdivision 1 triangle of lower left) to final position
    var fullRotation = translationMat2.multiply(rotationMat.clone().multiply(translationMat));

    modifiers[0] = fullRotation; // rotate red subdivison 1 triangle
    modifiers[1] = preRot1.clone().multiply(preRot2.clone().premultiply(fullRotation));
    modifiers[2] = preRot2.clone().multiply(preRot1.clone().premultiply(fullRotation));
    modifiers[3] = new Matrix4(); // unused => stays the same (centered)


    
    // second movement (folding subtriangle - subdivision 2 center triangles - inwards)
    translationMatToOrigin = new Matrix4().makeTranslation(h3/4,0,0);
    translationMatBack = new Matrix4().makeTranslation(-h3/4,0,0);

    var rotationMat2 = new Matrix4().makeRotationAxis(zaxis, secondDegree);
    var stepTwoMat = translationMatBack.multiply(rotationMat2.clone().multiply(translationMatToOrigin));

    // transforms for rotating the upper (red) triangle
    middleTransformForUp = new Matrix4().makeRotationAxis(yaxis,Math.PI).multiply(new Matrix4().makeTranslation(-h3,0,0)); // transforms upper (red) triangle to middle one
    upTransformForMiddle = new Matrix4().makeRotationAxis(yaxis,-Math.PI).premultiply(new Matrix4().makeTranslation(h3,0,0));
    middleTransformForLeft = middleTransformForUp.clone().multiply(preRot2);
    middleTransformForRight = middleTransformForUp.clone().multiply(preRot1);

    // final transforms by shifting the triangles to the upper triangles and back
    modifiers[4] = middleTransformForUp.premultiply(stepTwoMat).premultiply(preRot1).premultiply(upTransformForMiddle);
    modifiers[5] = middleTransformForLeft.premultiply(stepTwoMat).premultiply(upTransformForMiddle).premultiply(preRot1);
    modifiers[6] = middleTransformForRight.premultiply(stepTwoMat).premultiply(preRot1).premultiply(upTransformForMiddle).premultiply(preRot2);
    modifiers[7] = stepTwoMat; 

    return modifiers;
}

// start recursive generation for instance positions
Sierpinski.prototype.generateRecursion = function(a, b, c, depth, positions, vertexDepth) {
    if (depth == 0) this.iterateVertices(a, b, c, depth, positions, 0, -1, vertexDepth);
    else this.iterateVertices(a, b, c, depth, positions, 0, -1, vertexDepth);
}

// recursive insance position generation function
Sierpinski.prototype.iterateVertices = function(a, b, c, depth, positions, offset, type, vertexDepth) {

    if (depth == 0) {

        var maxInter = type == 3 ? 1 : 0; // check if we are in last iteration step
        var verts = [a, b, c];
        
        // for every vertex
        for (var i = 0; i < 3; i++) {
            vertexDepth[offset] = maxInter;
            positions[offset++] = verts[i].x;
            positions[offset++] = verts[i].y;
            positions[offset++] = verts[i].z;
        }

    } else {

        // generate vertex on edge between all the points (therefore linear interpolation witgh 0.5)
        var ab = new Vector3().lerpVectors(a,b,0.5);
        var bc = new Vector3().lerpVectors(b,c,0.5);
        var ca = new Vector3().lerpVectors(c,a,0.5);

        // go into 4 recursions (for every new triangle)
        offset = this.iterateVertices(a, ab, ca, depth-1, positions, offset, 0, vertexDepth);
        offset = this.iterateVertices(ab, b, bc, depth-1, positions, offset, 1, vertexDepth);
        offset = this.iterateVertices(ca, bc, c, depth-1, positions, offset, 2, vertexDepth);
        offset = this.iterateVertices(bc, ca, ab, depth-1, positions, offset, 3, vertexDepth);

    }

    return offset;
}
  
  
Sierpinski.prototype.create = function(material) {
    
    var h = Math.sqrt(3);
    var h3 = h/3;
    var h23 = h3*2;

    var a = new Vector3(h23,0,0);
    var b = new Vector3(-h3,0,-1);
    var c = new Vector3(-h3,0,1);  

    var vertices = []; // array storing vertices
    var vertexDepth = []; // array storing recursion depth of the vertex
    this.generateRecursion(a,b,c,2,vertices,vertexDepth);
    console.log(vertices);
    console.log(vertexDepth);
    
    var normals = new Float32Array(vertices.length);
    var masks = new Float32Array(vertices.length);

    // start mask (masks the animation matrices)
    var interval = masks.length/4;
    for (var i = 0; i < masks.length; i+=3) {
      masks[i] = Math.floor(i / interval);
      masks[i+1] = vertexDepth[i];
    }

    // generate normals
    for (var i = 0; i < normals.length; i+=3) {
      normals[i] = 0;
      normals[i+1] = 1;
      normals[i+2] = 0;
    }
    
    // generate Three.js buffers
    var instancedGeometry = new THREE.InstancedBufferGeometry();
    instancedGeometry.addAttribute('position', new THREE.BufferAttribute(Float32Array.from(vertices), 3));
    instancedGeometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
    instancedGeometry.addAttribute('mask', new THREE.BufferAttribute(masks, 3));
    instancedPositionsAttribute = new THREE.InstancedBufferAttribute(new Float32Array(generatePositionRecursion(0, this)), 3).setDynamic(true);
    instancedGeometry.addAttribute('instancePosition', instancedPositionsAttribute, 3);
    instancedGeometry.maxInstancedCount = 1;

    material.uniforms.use_normal_color.value = 0;
  
    var mesh = new THREE.Mesh(instancedGeometry, material);
    return mesh;
}