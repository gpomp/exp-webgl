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
uniform sampler2D grass;
uniform sampler2D snow;
uniform sampler2D rock;
uniform sampler2D crack;

varying vec4 stagePos;
varying vec3 pos;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
	float distSquare = abs(pos.x) * abs(pos.x) + abs(pos.y - height * 0.5) * abs(pos.y - height * 0.5);
	float fog = max(0.0, min(1.0, distSquare / maxDistSquare));

	vec3 groundColor = texture2D( grass, vUv ).rgb;
	vec3 iceColor = texture2D( snow, vUv ).rgb;
	vec3 rockColor = texture2D( rock, vUv ).rgb;
	vec3 crackColor = texture2D( crack, vUv ).rgb;

	vec3 posV = vec3(pos.xy + scroll, pos.z);

	float zRatio = 1.0 - (pos.z) / heightVal;
	float noiseCol = max(-0.05, min(1.0, noise(posV / (heightVal * 0.5))));
	float grassLimit = 	max(0.0, min(0.2, 1.0 - zRatio / 0.3));
	float iceLimit = 	max(0.0, min(1.0, (zRatio - 0.6) / 0.4));
	float rockLimit = 	max(0.0, min(1.0, 1.0 - (grassLimit + iceLimit)));
	

	float noiseCrack = min(1.0, noise(posV / crackPond));
	vec3 col = grassLimit * groundColor * 4.0;
	col = mix(col, rockColor, rockLimit);
	col = mix(col, crackColor, noiseCrack);
	col = mix(col, iceColor, iceLimit);
	col += ((noiseCol) * (iceLimit)) * rockColor;

 	float dProd = max(0.0, dot(vNormal, normalize(light))) * 0.8;

  	gl_FragColor = vec4(col * dProd + vec3(fog), 1.0);
}