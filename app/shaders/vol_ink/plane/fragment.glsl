#ifdef GL_ES
precision highp float;
#endif

#pragma glslify: noise = require(../../../../node_modules/glsl-noise/classic/3d)

uniform sampler2D inkText;
uniform sampler2D paperText;
uniform sampler2D inkspillText;
uniform float time;

varying vec4 stagePos;
varying vec3 pos;
varying vec3 vNormal;
varying vec2 vUv;
varying vec2 paperUv;
varying float colV;
varying vec3 randoms;

void main() {
	vec4 texel = texture2D(inkText, vUv);
	vec4 texelP = texture2D(paperText, paperUv);

	vec2 trUV = vec2(abs(vUv.x - 0.5), abs(vUv.y - 0.5));

	vec2 distXY = vec2(vUv.x - 0.5, vUv.y - 0.5);

	float dist = 1.0 - (distXY.x * distXY.x + distXY.y * distXY.y) / 2.0;
	float cosTime = cos(time + randoms.z * 1000.0);


	vec2 noiseUV = vUv * 30.0;

	float globNoise = (noise(vec3(pos.x, pos.y, 1.0)) + 1.0) * 0.3;
	//
	float n = (noise(vec3(noiseUV.x, noiseUV.y, (texel.r * globNoise * 0.1))) + 1.0) * 0.03;

	vec2 modUV = vUv;

	modUV.x += n + cos((vUv.x + globNoise * colV + time * randoms.x * 1000.0)) * (globNoise * n * colV * cosTime * 0.05);
	modUV.y += n + sin((vUv.y - globNoise * colV + time * randoms.y * 1000.0)) * (n * colV * cosTime * 0.01);



	vec4 texelInk = texture2D(inkspillText, modUV);

	float vecCol = texelInk.r;

	// vec3 light = vec3(300.0, 200.0, 0.0);
	// float dProd = 1.0 - max(0.0, dot(vNormal, normalize(light)));
	// 
	vec3 ink = vec3(vecCol * 0.5) + vec3(vecCol) * texel.rgb;
	vec3 invInk = vec3(1.0) - ink;
	// vec3(ink.r * dist * vUv.x, ink.g * dist * ((trUV.x + trUV.y) * 0.5), ink.b * vUv.y * 0.6) * 3.0
  	gl_FragColor = vec4(texelP.rgb - vec3(ink.r * dist * vUv.x, ink.g * dist * ((trUV.x + trUV.y) * 0.5), ink.b * vUv.y * 0.6) * 2.0, 1.0);
}