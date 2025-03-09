// manual imports
var Vector3 = THREE.Vector3;

function MengerInverse() {
    
    // inverse of menger cube (everywhere where their would be a point there is non and vice versa)
    var transforms = [
        new Vector3(0,1,0),
        new Vector3(0,0.5,0),
        new Vector3(0,0,0),

        new Vector3(0.5,0.5,0),
        new Vector3(-0.5,0.5,0),
        new Vector3(0,0.5,-0.5),
        new Vector3(0,0.5,0.5)
    ];

    var maxDepth = 6; // max fractal depth that should be rendered

    Fractal3x3x3Cube.call(this, transforms, maxDepth);
}

MengerInverse.prototype = Object.create(Fractal3x3x3Cube.prototype);
MengerInverse.prototype.constructor = MengerInverse;
fractals.push({"class": MengerInverse, "name": "Menger Inverse"});