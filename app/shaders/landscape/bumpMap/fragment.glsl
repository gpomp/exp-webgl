#ifdef GL_ES
precision highp float;
#endif

#pragma glslify: noise = require(../../../../node_modules/glsl-noise/classic/2d)

uniform vec2 scroll;
uniform float noisePond;
uniform float uH;
uniform float uLacunarity;

varying vec2 vUv;
varying vec4 stagePos;
varying vec3 pos;

// procedural fBm (p.437)
float fBm(vec2 p, float H, float lacunarity) {
	float value = 0.0;
	for(int i=0;i<6; ++i) {
		value+= noise(p) * pow(lacunarity, -H*float(i));
		p*= lacunarity;
	}
	return value;
}

// Get height at position
float zAt(vec2 p) {
	float x = p.x + scroll.x;
	float y = p.y + scroll.y;
	vec2 noisePos = vec2(x * 10000.0 / noisePond, y * 10000.0 / noisePond);
	float n = (fBm(noisePos, uH, uLacunarity) + 1.0) * 0.5;
	return n;
}



void main() {
	float col = zAt(vUv.xy);
  	gl_FragColor = vec4(vec3(col, 0.0, 0.0), 1.0);
}