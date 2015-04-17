#ifdef GL_ES
precision highp float;
#endif

attribute vec3 displacement;
attribute float frac;

varying vec4 stagePos;
varying vec3 pos;
varying vec2 vUv;

void main() {
	vUv = uv;
    pos = position;
    stagePos = modelMatrix * vec4(pos,1.0);
  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}