#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif

const float NUM_SAMPLES = 50.0 ;

uniform sampler2D tDiffuse;
varying vec2 vUv;

void main() {
  	gl_FragColor = texture2D( tDiffuse, vUv );
}