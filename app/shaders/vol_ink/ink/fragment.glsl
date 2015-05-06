#ifdef GL_ES
precision highp float;
#endif

const int NB_SOURCE = 4;
const float M_PI = 3.1415926535897932384626433832795;

uniform sampler2D inkText;
uniform vec3 source[NB_SOURCE];

varying vec4 stagePos;
varying vec3 pos;
varying vec3 vNormal;
varying vec2 vUv;

float getSource(vec3 src, vec2 uvs) {
	

	// uvs.x += cos((texel.r + n + globNoise * 5.0 * src.z)) * ((src.x - uvs.x) * n);
	// uvs.y += sin((texel.r + n * src.z - globNoise * 10.0)) * ((src.y - uvs.y) * n);

	float dX = src.x - uvs.x;
	float dY = src.y - uvs.y;

	float dist = dX * dX + dY * dY;
	//  * n * (0.5 + texel.r * 0.5))
	float distPerc = 1.0 - max(0.0, min(1.0, dist / (0.03 * src.z)));

	return floor(distPerc * 50.0) / 50.0;
}

void main() {
	float colV = 0.0;
	for(int i = 0; i < NB_SOURCE; i++) {
		colV = min(1.0, max(getSource(source[i], vUv), colV));
		

	} 
  	gl_FragColor = vec4(colV);
}