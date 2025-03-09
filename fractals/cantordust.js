// manual imports
var Vector3 = THREE.Vector3;

function CantorDust() {

    // cantor dust transforms (8 cubes - one in every corner)
    var transforms = [
        new Vector3(0.5,1,0.5),
        new Vector3(-0.5,1,0.5),
        new Vector3(0.5,1,-0.5),
        new Vector3(-0.5,1,-0.5),
        new Vector3(0.5,0,0.5),
        new Vector3(-0.5,0,0.5),
        new Vector3(0.5,0,-0.5),
        new Vector3(-0.5,0,-0.5)
    ];

    var maxDepth = 6; // max fractal depth that should be rendered

    Fractal3x3x3Cube.call(this, transforms, maxDepth);
}

CantorDust.prototype = Object.create(Fractal3x3x3Cube.prototype);
CantorDust.prototype.constructor = CantorDust;
fractals.push({"class": CantorDust, "name": "Cantor Dust"});