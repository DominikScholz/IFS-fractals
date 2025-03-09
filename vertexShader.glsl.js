var vertexShader = /* glsl */`

uniform mat4 modifier[8];
uniform vec3 colors[4];
uniform int shifts[4];
uniform float scale;
uniform float movement_time;
uniform float use_normal_color;

varying vec3 vpos;
varying vec3 vnorm;
attribute vec3 mask;
attribute vec3 instancePosition;
varying vec3 vcolor;

void main() {
    vpos = position;
    vnorm = normal;

    int face = int(mask.r); // getting face index from mask

    vec4 pos = vec4(position, 1.0);
    pos = mix(pos, modifier[face+4] * pos, mask.g); // transforming position with 2nd matrices [4 - 7]
    pos = modifier[face] * pos; // transforming position with 1st matrices [0 - 3]

    vec3 faceColor = mix(colors[face], colors[shifts[face]], sin(mask.g*movement_time)); // interpolate between face colors (for rotating faces)
    vec3 normalColor = abs(modifier[face] * vec4(vnorm,1.0)).xyz; // color by normal
    vcolor = mix(faceColor, normalColor, use_normal_color); // decide which color to use

    // apply fractal scaling per instance
    pos.xyz += instancePosition;
    pos.xyz *= scale;

    // transform to screen coords
    vec4 modelViewPosition = modelViewMatrix * pos;
    gl_Position = projectionMatrix * modelViewPosition;
}

`;