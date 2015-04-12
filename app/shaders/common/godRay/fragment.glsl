#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif

const float NUM_SAMPLES = 50.0 ;

uniform sampler2D tDiffuse;
varying vec2 vUv;

void main() {
	vec4 texel = texture2D( tDiffuse, vUv );
	float decay = 0.2;

	vec4 col = vec4(0.0);
	vec2 uv = vUv;
	vec2 deltaTextCoord = vUv;

	deltaTextCoord *= 1.0 /  float(NUM_SAMPLES) * 2.0;
	float illuminationDecay = 1.0;
	for(float i = 0.0; i < NUM_SAMPLES; i++) {
		uv -= deltaTextCoord;
	    vec4 sample = texture2D( tDiffuse, vUv );

	     sample *= illuminationDecay * 1.0;

	     col += sample;

	     illuminationDecay *= decay;
	}

  	gl_FragColor = col;
}