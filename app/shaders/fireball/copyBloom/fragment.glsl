#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D tDiffuse2;
uniform float time;
uniform float lightDirDOTviewDir;

varying vec2 vUv;
 
const int NUM_SAMPLES = 50;

vec4 godRay(sampler2D text, vec2 uv) {
	float exposure	= 0.1 / float(NUM_SAMPLES);
	float decay		= 1.0 ;
	float density	= 0.5;
	float weight	= 6.0;
	float illuminationDecay = 1.0;

  	vec2 deltaTextCoord = vec2( uv - vec2(0.5, 0.5));
	vec2 textCoo = uv;
	deltaTextCoord *= 1.0 / float(NUM_SAMPLES) * density;

	vec4 origColor = texture2D(text, uv);
	vec4 raysColor = vec4(0.0);

	for(int i=0; i < NUM_SAMPLES ; i++)
	{
		textCoo -= deltaTextCoord;
		vec4 tsample = texture2D(text, textCoo );
		tsample *= illuminationDecay * weight;
		raysColor += tsample;
		illuminationDecay *= decay;
	}
	raysColor *= exposure * lightDirDOTviewDir;
	return origColor + raysColor;
}

void main() {
	float x = vUv.x + sin(time + vUv.x * 20.0) * 0.01;
  	float y = vUv.y + sin(time + vUv.y * 20.0)  * sin(50.0 + 0.22 * 300.0) * 0.05;
	vec2 vvUv = vec2(x, y);
  	gl_FragColor = godRay(tDiffuse2, vvUv);
}