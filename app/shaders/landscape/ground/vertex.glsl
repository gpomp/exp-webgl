#ifdef GL_ES
precision highp float;
#endif

#pragma glslify: noise = require(../../../../node_modules/glsl-noise/classic/2d)
#pragma glslify: noisep = require(../../../../node_modules/glsl-noise/periodic/2d)

uniform float time;
uniform float width;
uniform float height;
uniform vec2 repeatText;
uniform vec2 scroll;
uniform float noisePond;
uniform float heightVal;

varying vec4 stagePos;
varying vec3 pos;
varying vec3 vNormal;
varying vec2 vUv;

vec3 zAt(vec2 p) {
	vec2 noisePos = vec2((p.x + scroll.x) / noisePond, (p.y + scroll.y)  / noisePond);
	vec2 noisePos2 = vec2((p.x + scroll.x + 1.0) / 100.0, (p.y + scroll.y - 1.0)  / 100.0);

	float n = noise(noisePos);
	float n2 = noise(noisePos2);
	float z = heightVal * 0.5 + n * heightVal + n2 * 20.0;

	vec3 tempPos = vec3(p.x, p.y, z);

	return tempPos;
}

void main() { 
	vec2 rText = vec2((width) / repeatText.x, (height) / repeatText.y);
	vUv = (uv + scroll / vec2(width, height)) * rText;
	pos = zAt(position.xy);

	float small = 0.03;
	vec2 n1 = vec2(pos.x + small, pos.y);
	vec3 neigh1 = zAt(n1);

	vec2 n2 = vec2(pos.x, pos.y + small);
	vec3 neigh2 = zAt(n2);

	vec3 tangeant = neigh1 - pos;
	vec3 bitangeant = neigh2 - pos;
	vNormal = normalize(cross(tangeant, bitangeant));

	// pos += pos * (floor((vNormal.x + vNormal.y + vNormal.z) * 10.0) / 10.0) * 0.1;

    stagePos = modelMatrix * vec4(pos,1.0);
  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}