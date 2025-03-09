// manual imports
var Matrix4 = THREE.Matrix4;

function Fractal(transforms, iterationScale, maxDepth) {
    this.transforms = transforms;
    this.iterationScale = iterationScale;
    this.maxDepth = maxDepth;

    this.modifiers = [
        new Matrix4(), 
        new Matrix4(), 
        new Matrix4(), 
        new Matrix4(), 
        new Matrix4(), 
        new Matrix4(), 
        new Matrix4(), 
        new Matrix4()
    ];
}

// gives the time this fractal can be displayed for before stopping to go deeper
Fractal.prototype.time = function() {
    return this.maxDepth;
}

// gives the scale of the elements for the given iteration
Fractal.prototype.scale = function(iter) {
    return Math.pow(this.iterationScale, iter);
}

// calculates the hausdorff dimension for this fractal
Fractal.prototype.hausdorffDimension = function() {
    return Math.log(this.transforms.length) / Math.log(1/this.iterationScale);
}

// counts how many instances are displayed
Fractal.prototype.count = function(iter) {
    return Math.pow(this.transforms.length, iter);
}

// updates the fractal (only used for moving fractals)
Fractal.prototype.update = function(openingTime, normTime) {
    return this.modifiers;
}
  
// creates the fractal
Fractal.prototype.create = function(material) {
}