#ifdef GL_ES
precision highp float;
#endif

#pragma glslify: noise = require(../../../../node_modules/glsl-noise/classic/3d)
#pragma glslify: noise2d = require(../../../../node_modules/glsl-noise/classic/2d)

uniform sampler2D inkText;
uniform vec3 source[20];
uniform float time;

varying vec4 stagePos;
varying vec4 texelInk;
varying vec3 pos;
varying vec3 vNormal;
varying vec2 vUv;
varying vec2 paperUv;
varying float colV;

const int NB_SOURCE = 20;
const float M_PI = 3.1415926535897932384626433832795;

float getSource(vec3 src, vec2 uvs, vec2 noiseUV, vec4 texel, float globNoise) {
	float n = (noise(vec3(noiseUV.x, noiseUV.y, (texel.r * globNoise * src.z * 0.1))) + 1.0) * 0.2;

	uvs.x += cos((texel.r + n + globNoise * 5.0)) * ((src.x - uvs.x) * n);
	uvs.y += sin((texel.r + n - globNoise * 10.0)) * ((src.y - uvs.y) * n);

	float dX = src.x - uvs.x;
	float dY = src.y - uvs.y;

	float dist = dX * dX + dY * dY;

	float distPerc = 1.0 - max(0.0, min(1.0, dist / (0.4 * src.z * n * (0.5 + texel.r * 0.5))));

	return floor(distPerc * 50.0) / 50.0;
}

void main() {
	vNormal = normal;
    pos = position;
	vUv = uv;
	
	vec2 rText = vec2(1024.0 / 256.0);
	paperUv = uv * rText;

	float globNoise = (noise(vec3(pos.x / 50.0, pos.y / 50.0, 0.1)) + 1.0) * 0.3;
	//
	vec4 texel = texture2D(inkText, vUv);
	texelInk = texel;

	colV = 0.0;

	for(int i = 0; i < NB_SOURCE; i++) {
		colV = min(1.0, max(getSource(source[i], vUv, vUv * 30.0, texel, globNoise), colV));
		

	}    

	pos.z += (1.0 - colV) * 5.0;

	stagePos = modelMatrix * vec4(pos,1.0);
  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}