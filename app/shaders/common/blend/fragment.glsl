#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif

const float NUM_SAMPLES = 50.0 ;

uniform sampler2D tDiffuse1;
uniform sampler2D tDiffuse2;
varying vec2 vUv;

void main() {
	vec4 texel1 = texture2D( tDiffuse1, vUv );
	vec4 texel2 = texture2D( tDiffuse2, vUv );
  	gl_FragColor = mix(texel1, texel2, texel2.a);
}