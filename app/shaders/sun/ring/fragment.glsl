#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif

#pragma glslify: noise3d = require(../../../../node_modules/glsl-noise/simplex/3d)

uniform float time;

varying vec4 stagePos;
varying vec3 pos;

void main() {

	vec3 baseColor = vec3(0.703125, 0.02734375, 0.0);
	float rad = 250.0 * 250.0;
	float angle = atan(pos.y, pos.x);
	float signX = -1.0 * sign(pos.x);
	float signY = -1.0 * sign(pos.y);
	vec3 noise3dPos = vec3(pos.x + signX, signY * pos.y, time * 20.0) / 100.0;
	float noise = noise3d(noise3dPos);
	float x = abs(pos.x + cos(angle) * (20.0 + noise * 40.0));
	float y = abs(pos.y + sin(angle) * (20.0 + noise * 40.0));
	float distSquare = x * x + y * y;
	float d = 1.0 - max(0.0, min(1.0, abs(rad - distSquare) / 100000.0));
	float c = 0.0;

	float addColor = 0.0;

	for(float i = 0.0; i < 5.0; i++) {
		float r = 6.0 - i;
		c += floor(d * r) / r;
	}


  	gl_FragColor = vec4(baseColor * d * 2.0 + baseColor * vec3(c * 0.1), 1.0);
}