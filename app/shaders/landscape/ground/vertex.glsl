#ifdef GL_ES
precision highp float;
#endif

#pragma glslify: noise = require(../../../../node_modules/glsl-noise/classic/2d)
#pragma glslify: noisep = require(../../../../node_modules/glsl-noise/periodic/2d)

// procedural fBm (p.437)
float fBm(vec2 p, float H, float lacunarity) {
	float value = 0.0;
	for(int i=0;i<6; ++i) {
		value+= noise(p) * pow(lacunarity, -H*float(i));
		p*= lacunarity;
	}
	return value;
}

uniform float time;
uniform float width;
uniform float height;
uniform vec2 repeatText;
uniform vec2 scroll;
uniform float noisePond;
uniform float noiseAspPond;
uniform float heightAspVal;
uniform float heightVal;
uniform float avWSeg;
uniform float avHSeg;
uniform float uH;
uniform float uLacunarity;

varying vec4 stagePos;
varying vec3 pos;
varying vec3 vNormal;
varying vec2 vUv;

// Get height at position
vec3 zAt(vec2 p) {
	float x = p.x + scroll.x;
	float y = p.y + scroll.y;
	vec2 noisePos = vec2(x / noisePond, y  / noisePond);
	float n = fBm(noisePos, uH, uLacunarity);
	return vec3(p.x, p.y, heightVal * 0.5 + n * heightVal);
}

void main() { 
	// Scale uv to fit plane
	vec2 rText = vec2((width) / repeatText.x, (height) / repeatText.y);
	vUv = (uv + scroll / vec2(width, height)) * rText;
	pos = zAt(position.xy);

    stagePos = modelMatrix * vec4(pos,1.0);

    // Get average neighbour to get face
    vec3 n1 = zAt(vec2(pos.x + avWSeg, pos.y));
    vec3 n2 = zAt(vec2(pos.x, pos.y + avHSeg));

    // Calculate normal from face's tangent/bitangent
    vNormal = normalize(cross(n1 - pos.xyz, n2 - pos.xyz));

  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}