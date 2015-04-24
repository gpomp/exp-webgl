#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif

#pragma glslify: noise = require(../../../../node_modules/glsl-noise/classic/2d)

uniform sampler2D tDiffuse1;
uniform sampler2D tDiffuse2;
uniform float time;

varying vec2 vUv;

const float M_PI = 3.1415926535897932384626433832795;

const int samples = 9; // pixels per axis; higher = bigger glow, worse performance
const int diff = 4; 

void main() {
	vec2 displacement = vUv - vec2(0.5);
	// displacement.x += sin(vUv.x + time * 0.1) * displacement.y + cos(vUv.x - time) * displacement.x;
	// displacement.y -= sin(vUv.y + time * 0.5) * displacement.y + cos(vUv.y - time) * displacement.x;
  float noised = noise(vec2(vUv.x + time * 0.5, vUv.y - time * 0.4));
	vec2 vvUv = vec2(vUv.x, vUv.y - sin(vUv.x + noised) * 0.05);
	
	vec4 texel1 = texture2D(tDiffuse1, vvUv);
  vec4 texel2 = texture2D(tDiffuse2, vvUv);

  gl_FragColor = mix(texel1, texel2, texel2.a);
}