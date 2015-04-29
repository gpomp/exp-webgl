#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif

#pragma glslify: noise = require(../../../../node_modules/glsl-noise/simplex/3d)




uniform float time;
uniform float width;
uniform float height;
uniform vec2 scroll;
uniform float fogRatio;
uniform vec3 light;
uniform float heightVal;
uniform float crackPond;
uniform float noiseFogPond;
uniform float noiseFogAlpha;
uniform float maxDistSquare;
uniform vec3 bgCol;
uniform sampler2D grass;
uniform sampler2D snow;
uniform sampler2D rock;
uniform sampler2D crack;
uniform float avWSeg;
uniform float avHSeg;

uniform sampler2D bumpMat;

varying vec4 stagePos;
varying vec3 pos;
varying vec3 vNormal;
varying vec2 vUv;
varying vec2 rgUv;
varying mat3 vNormalMatrix;

vec3 getNorm(sampler2D text, vec2 uv) {
	float NORMAL_OFF = 1.0 / 32.0;
	vec3 off = vec3(-NORMAL_OFF, 0, NORMAL_OFF);

	// s11 = Current
	float s11 = texture2D(text, uv).x;

	// s01 = Left
	float s01 = texture2D(text, uv.xy + off.xy).x;

	// s21 = Right
	float s21 = texture2D(text, uv.xy + off.zy).x;

	// s10 = Below
	float s10 = texture2D(text, uv.xy + off.yx).x;

	// s12 = Above
	float s12 = texture2D(text, uv.xy + off.yz).x;

	vec3 va = vec3(NORMAL_OFF, 0.0, s21 - s01);
	vec3 vb = vec3(0.0, NORMAL_OFF, s12 - s10);

 	return normalize(cross(va,vb));
}

void main() {
	float minDistSquare = maxDistSquare - 10000000.0;
	float distSquare = abs(pos.x) * abs(pos.x) + abs(pos.y) * abs(pos.y);
	float fog = 1.0 - max(0.0, min(1.0, (distSquare - minDistSquare) / (maxDistSquare - minDistSquare)));
	vec3 fogCol = bgCol;

	vec3 groundColor = texture2D( grass, vUv ).rgb;
	vec3 iceColor = texture2D( snow, vUv ).rgb;
	vec3 rockColor = texture2D( rock, vUv ).rgb;
	vec3 crackColor = texture2D( crack, vUv ).rgb;

	vec3 posV = vec3(pos.xy + scroll, pos.z);

	float zRatio = 1.0 - (pos.z) / heightVal;
	// float noiseCol = max(-0.05, min(1.0, noise(posV / (heightVal * 0.5))));
	float grassLimit = 	max(0.0, min(0.2, 1.0 - zRatio / 0.3));
	float iceLimit = 	max(0.0, min(1.0, (zRatio - 0.6) / 0.4));
	float rockLimit = 	max(0.0, min(1.0, 1.0 - (grassLimit + iceLimit)));
	

	float noiseCrack = min(1.0, noise(posV / crackPond));
	vec3 col = grassLimit * groundColor * 4.0;
	col = mix(col, rockColor, rockLimit);
	col = mix(col, crackColor, noiseCrack);
	col = mix(col, iceColor, iceLimit);
	// col += ((noiseCol) * (iceLimit)) * rockColor;

 	//  + vec3(fog)mix(fogCol, col * dProd, fog)

 	vec3 norm = getNorm(bumpMat, rgUv);
 	float dProd = 0.2 + max(0.0, dot(norm, normalize(light))) * 0.8;
  	// gl_FragColor = vec4(norm, 1.0);
  	gl_FragColor = vec4(vec3(dProd) * col * fog, 1.0);
}