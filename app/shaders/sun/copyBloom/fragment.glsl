#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif

#pragma glslify: noise = require(../../../../node_modules/glsl-noise/classic/2d)

uniform sampler2D tDiffuse2;
uniform sampler2D tDiffuse3;
uniform float time;

varying vec2 vUv;

void main() {
	vec2 displacement = vUv - vec2(0.5);
	displacement.x += sin(vUv.x + time * 0.1) * displacement.y + cos(vUv.x - time) * displacement.x;
	displacement.y -= sin(vUv.y + time * 0.5) * displacement.y + cos(vUv.y - time) * displacement.x;

	vec2 vvUv = vec2(vUv.x + displacement.y * 0.015, vUv.y - displacement.x * 0.015);
	
	// vec4 texel2 = texture2D( tDiffuse2, vvUv );
	// vec4 texel3 = texture2D( tDiffuse3, vvUv );
	
	vec4 finalt2 = texture2D( tDiffuse2, vvUv );
	vec4 finalt3 = texture2D( tDiffuse3, vvUv );
	float k = 0.001;
	float sc = 2.0 * k;
	float divide = 0.0;
	for(float i = 0.0; i < 4.0; i++) {
		vec2 disp = vec2(-sc + (float(i) + 1.0) * k);
		float perc = (1.0 - (float(i) + 1.0) / 4.0);
		finalt2.rgb += texture2D( tDiffuse2, vvUv + disp).rgb;
		finalt3.rgb += texture2D( tDiffuse3, vvUv + disp).rgb;
		divide += perc;
	}

	finalt2.rgb = finalt2.rgb / (4.0);
	finalt3.rgb = finalt3.rgb / (4.0);

  	// gl_FragColor = mix(finalt2, finalt3, finalt3.a);
  	gl_FragColor = finalt2 + vec4((vec3(1.0) - finalt2.rgb) * finalt3.rgb, finalt3.a);
}