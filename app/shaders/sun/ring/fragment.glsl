#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif

#pragma glslify: noise3d = require(../../../../node_modules/glsl-noise/simplex/3d)

uniform float time;
uniform sampler2D sunRays;

varying vec4 stagePos;
varying vec3 pos;
varying vec2 vUv;

const float M_PI = 3.1415926535897932384626433832795;


void main() {

	vec3 baseColor = vec3(0.9, 0.45, 0.1);
	float rad = 250.0 * 250.0;
	float angle = atan(pos.y, pos.x);
	float signX = -1.0 * sign(pos.x);
	float signY = -1.0 * sign(pos.y);
	vec3 noise3dPos = vec3(pos.x + signX, signY * pos.y + time * 10.0, time * 20.0) / 100.0;
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

	vec3 ray = vec3(0);
	float a = (M_PI * 2.0) / 900.0;
	for(float i = 0.0; i < 3.0; i++) {
		
		float cos_factor = cos(a * i);
		float sin_factor = sin(a * i);
		vec2 coords = (vUv - 0.5) * mat2(cos_factor, sin_factor, -sin_factor, cos_factor);
        coords += 0.5;
		ray += texture2D(sunRays, coords).rgb * vec3((i + 1.0) / 3.0);
	}
	ray /= 3.0;
	// 
  	gl_FragColor = vec4(baseColor * d * 2.0 + baseColor * vec3(c * 0.1) + vec3(ray.r * 0.9, ray.g * 0.45, ray.b * 0.1), 1.0);
}