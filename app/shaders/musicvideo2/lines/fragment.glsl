#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif

uniform vec3 color;
uniform float brightSound;

varying vec4 stagePos;
varying vec3 pos;
varying float currTime;

void main() {
	float htime = 1.0 - (currTime - 0.5) * 2.0;
  	gl_FragColor = vec4(color, 0.1 + 0.89 * brightSound);
}