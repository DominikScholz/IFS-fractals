// manual imports
var Vector3 = THREE.Vector3;

function MengerSponge() {

    // menger cube transforms
    var transforms = [
        new Vector3(0.5,1,0.5),
        new Vector3(-0.5,1,0.5),
        new Vector3(0.5,1,-0.5),
        new Vector3(-0.5,1,-0.5),
        new Vector3(0.5,0,0.5),
        new Vector3(-0.5,0,0.5),
        new Vector3(0.5,0,-0.5),
        new Vector3(-0.5,0,-0.5),
    
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

    var maxDepth = 4; // max fractal depth that should be rendered

    Fractal3x3x3Cube.call(this, transforms, maxDepth);
}

MengerSponge.prototype = Object.create(Fractal3x3x3Cube.prototype);
MengerSponge.prototype.constructor = MengerSponge; 
fractals.push({"class": MengerSponge, "name": "Menger Sponge"});