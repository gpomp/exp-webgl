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
	vec3 bumpColor = vec3(0.7) + texture2D( bump, vUv ).rgb * vec3(1.0, 0.5, 0.2) * 4.0;
	vec3 crackColor = texture2D( crack, vUv ).rgb;
	vec3 tColor = topColor * (crackColor);
	float t = time * 0.75;
	vec3 noisePos = vec3(t + pos.x, pos.y, pos.z + t) / (0.5 + cos(time * 0.001) * 0.1) * 1.5;
	float brightnessBase = max(0.0, noise(noisePos));

	vec3 noisemiddlePos = vec3(t - pos.x, pos.y + t * 0.5, pos.z + t);
	float brightnessMiddle = abs(max(0.0, min(1.0, fBm(noisemiddlePos * (2.0 + sin(time * 3.0) * 0.1), 0.4, 0.33) * 0.01)));

	vec3 noise3dPos = vec3((pos.x), (pos.y), pos.z);
	float brightnessTop = max(0.0, min(1.0, fBm(noise3dPos * (1.0 + cos(time * 0.2) * 0.4), 1.0, 0.4) * 0.03));
	//brightnessBase = floor(brightnessBase * 5.0) / 5.0;
	//  * (brightnessBase) + tColor.b * brightnessTop
	vec3 bottomCol = baseColor * bumpColor;

	vec3 bottom = bottomCol + bottomCol * brightnessBase * 2.0;
	vec3 middle = middleColor * bumpColor * brightnessMiddle * 2.0;
	vec3 top = tColor * brightnessTop * 6.0;
	// brightnessTop = floor(brightnessTop * 15.0) / 15.0;
  	gl_FragColor = vec4(bottom + middle + top, 1.0);
}