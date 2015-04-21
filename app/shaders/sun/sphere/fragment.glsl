#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES

#pragma glslify: noise = require(../../../../node_modules/glsl-noise/classic/3d)
#pragma glslify: noise3d = require(../../../../node_modules/glsl-noise/simplex/3d)

// procedural fBm (p.437)
float fBm(vec3 p, float H, float lacunarity) {
	float value = 0.0;
	for(int i=0;i<6; ++i) {
		value+= noise3d(p) * pow(lacunarity, -H*float(i));
		p*= lacunarity;
	}
	return value;
}

precision highp float;
#endif

uniform float time;
uniform float speedNoise;

uniform vec3 baseColor;
uniform vec3 middleColor;
uniform vec3 topColor;
uniform sampler2D crack;
uniform sampler2D bump;

varying vec4 stagePos;
varying vec3 pos;
varying vec2 vUv;

void main() { 
	// vec3 baseColor = vec3(1.0, 0.5234375, 0.078125);
	// vec3 topColor = vec3(1.0);
	vec3 bumpColor = texture2D( bump, vUv ).rgb * vec3(0.2);
	vec3 crackColor = texture2D( crack, vUv ).rgb;
	vec3 tColor = topColor * (crackColor);
	// float t = (cos(time) + sin(time)) * 0.5;
	vec3 noisePos = vec3(pos.x, pos.y + time * 50.0 * speedNoise, pos.z - time * 110.0 * speedNoise);
	float brightnessBase = max(0.0, min(1.0, noise(noisePos * 0.1))) * 5.0;

	vec3 noisemiddlePos = vec3(pos.x, pos.y + time * 50.0 * speedNoise, pos.z - time * 100.0 * speedNoise);
	float brightnessMiddle = abs(max(0.0, min(1.0, fBm(noisemiddlePos, 0.95, 0.45))));

	vec3 noise3dPos = vec3(pos.x, pos.y + time * 150.0 * speedNoise, pos.z + time * 100.0 * speedNoise);
	float brightnessTop = max(0.0, min(1.0, fBm(noise3dPos * (1.0), 1.0, 0.4) * 0.03));
	//  + t * (0.2)
	//brightnessBase = floor(brightnessBase * 5.0) / 5.0;
	//  * (brightnessBase) + tColor.b * brightnessTop
	vec3 bottomCol = baseColor * bumpColor;

	vec3 bottom = mix(bottomCol, baseColor - bumpColor * 2.0, brightnessBase);
	vec3 middle = middleColor * brightnessMiddle;
	vec3 top = tColor * brightnessTop * 6.0;
	// brightnessTop = floor(brightnessTop * 15.0) / 15.0;
  	gl_FragColor = vec4(bottom + middle + top, 1.0);
}