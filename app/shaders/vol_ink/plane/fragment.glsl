#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D inkText;
uniform sampler2D paperText;

varying vec4 stagePos;
varying vec4 texelInk;
varying vec3 pos;
varying vec3 vNormal;
varying vec2 vUv;
varying vec2 paperUv;
varying float colV;

void main() {
	vec4 texel = texture2D(inkText, vUv);
	vec4 texelP = texture2D(paperText, paperUv);

	vec2 trUV = vec2(abs(vUv.x - 0.5), abs(vUv.y - 0.5));

	vec2 distXY = vec2(vUv.x - 0.5, vUv.y - 0.5);

	float dist = 1.0 - (distXY.x * distXY.x + distXY.y * distXY.y) / 2.0;

	// vec3 light = vec3(300.0, 200.0, 0.0);
	// float dProd = 1.0 - max(0.0, dot(vNormal, normalize(light)));
	// 
	vec3 ink = vec3(colV * 0.5) + vec3(colV) * texel.rgb;
	vec3 invInk = vec3(1.0) - ink;
  	gl_FragColor = vec4(texelP.rgb - vec3(ink.r * dist * vUv.x, ink.g * dist * ((trUV.x + trUV.y) * 0.5), ink.b * vUv.y * 0.6) * 3.0, 1.0);
}