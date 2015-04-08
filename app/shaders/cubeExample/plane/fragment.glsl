#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif

varying vec4 stagePos;
varying vec3 pos;

void main() {
  	gl_FragColor = vec4(vec3(pos.x, pos.y, 1.0), 1.0);
}