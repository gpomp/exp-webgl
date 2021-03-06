#ifdef GL_ES
precision highp float;
#endif

const int NUM_SAMPLES = 50;

uniform sampler2D tDiffuse;
uniform sampler2D tDiffuse1;
uniform float lightDirDOTviewDir;
uniform float exposureNB;
uniform float decay;
uniform float density;
uniform float weight;
uniform float illuminationDecay;
uniform float radiusLight;
uniform vec2 lightPos;

varying vec2 vUv;

vec4 godRay(sampler2D text, vec2 uv) {
	float exposure	= exposureNB / float(NUM_SAMPLES);
  	vec2 deltaTextCoord = uv - lightPos;
	vec2 textCoo = uv;
	deltaTextCoord *= 1.0 / float(NUM_SAMPLES) * density;

	vec4 origColor = texture2D(text, uv);
	vec4 raysColor = vec4(0.0);

	float illDecay = illuminationDecay;

	for(int i=0; i < NUM_SAMPLES ; i++)
	{
		textCoo -= deltaTextCoord;
		vec4 tsample = texture2D(text, textCoo );
		float b = (tsample.b + tsample.g + tsample.b) / 3.0;
		tsample *= illDecay * weight * b;
		raysColor += tsample;
		illDecay *= decay;
	}
	raysColor *= exposure * lightDirDOTviewDir;
	vec4 finalCol = origColor + raysColor;

	return finalCol;
}

void main() {
	vec4 gr = godRay(tDiffuse, vUv);
  	gl_FragColor = gr;
}