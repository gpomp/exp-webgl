#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES

#pragma glslify: noise = require(../../../../node_modules/glsl-noise/classic/3d)

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
	vec3 bumpColor = vec3(0.7) + texture2D( bump, vUv ).rgb * vec3(1.0, 0.2, 0.2) * 4.0;
	vec3 crackColor = texture2D( crack, vUv ).rgb;
	vec3 tColor = topColor * (crackColor);
	float t = time * 0.75;
	vec3 noisePos = vec3(t * 10.0 + pos.x, pos.y, pos.z + t * 2.0) / (15.0 + cos(time * 0.001) * 3.0) * 1.5;
	float brightnessBase = max(0.0, noise(noisePos));

	vec3 noise3dPos = vec3(t * 10.0 + pos.x, pos.y, pos.z + t * 10.0);
	float brightnessTop = max(0.0, min(1.0, noise(noise3dPos / (50.0 + sin(time * 0.05) * 5.0)))) * 1.3;

	vec3 noisemiddlePos = vec3(t * 10.0 - pos.x, pos.y, -pos.z + t * 10.0);
	float brightnessMiddle = max(0.0, min(1.0, noise(noisemiddlePos / (30.0 + sin(time * 0.05) * 20.0))));
	//brightnessBase = floor(brightnessBase * 5.0) / 5.0;
	//  * (brightnessBase) + tColor.b * brightnessTop
	vec3 bottomCol = baseColor * bumpColor;

	vec3 bottom = bottomCol + bottomCol * brightnessBase;
	vec3 middle = middleColor * brightnessMiddle * 2.0;
	vec3 top = tColor * brightnessTop * 3.0;
	// brightnessTop = floor(brightnessTop * 15.0) / 15.0;
  	gl_FragColor = vec4(bottom + middle + top, 1.0);
}