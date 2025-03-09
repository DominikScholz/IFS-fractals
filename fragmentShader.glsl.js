var fragmentShader = /* glsl */`

varying vec3 vpos;
varying vec3 vnorm;
varying vec3 vcolor;

void main() {
    gl_FragColor = vec4(vcolor, 1.0);
}

`;