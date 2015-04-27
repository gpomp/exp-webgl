#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif

uniform vec3 color;
uniform float brightSound;

varying vec4 stagePos;
varying vec3 pos;
varying float currTime;
varying vec2 vaddAngle;

void main() {
  	gl_FragColor = vec4(color + vec3(0.8 * brightSound), 0.1 + vaddAngle.y * 0.89 * brightSound);
}