// manual imports
var Vector3 = THREE.Vector3;

function MengerMinusCantor() {

    // menger cube transforms but without the cantor dust (corners)
    var transforms = [
        new Vector3(0.5,1,0),
        new Vector3(-0.5,1,0),
        new Vector3(0,1,-0.5),
        new Vector3(0,1,0.5),
        new Vector3(0.5,0,0),
        new Vector3(-0.5,0,0),
        new Vector3(0,0,-0.5),
        new Vector3(0,0,0.5),

        new Vector3(0.5,0.5,0.5),
        new Vector3(-0.5,0.5,0.5),
        new Vector3(0.5,0.5,-0.5),
        new Vector3(-0.5,0.5,-0.5)
    ];

    var maxDepth = 5; // max fractal depth that should be rendered

    Fractal3x3x3Cube.call(this, transforms, maxDepth);
}

MengerMinusCantor.prototype = Object.create(Fractal3x3x3Cube.prototype);
MengerMinusCantor.prototype.constructor = MengerMinusCantor;
fractals.push({"class": MengerMinusCantor, "name": "Menger Cube minus Cantor Dust"});