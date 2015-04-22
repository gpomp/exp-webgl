#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif

#pragma glslify: noise = require(../../../../node_modules/glsl-noise/classic/2d)

uniform sampler2D tDiffuse2;
uniform sampler2D tDiffuse3;
uniform float time;
uniform float quality;
uniform vec2 size;

varying vec2 vUv;

const float M_PI = 3.1415926535897932384626433832795;

const int samples = 9; // pixels per axis; higher = bigger glow, worse performance
const int diff = 4; 

 
vec4 effect(vec4 colour, sampler2D tex, vec2 tc)
{
  	vec4 source = texture2D(tex, tc);
  	vec4 sum = vec4(0);
  	vec2 sizeFactor = vec2(1) / size * quality;
  
  	for (int x = -diff; x <= diff; x++)
  	{
    	for (int y = -diff; y <= diff; y++)
    	{
      		vec2 offset = vec2(float(x), float(y)) * sizeFactor;
      		sum += texture2D(tex, tc + offset);
    	}
  	}
  
  	return ((sum / (float(samples) * float(samples))) + source) * colour;
}

void main() {
	vec2 displacement = vUv - vec2(0.5);
	displacement.x += sin(vUv.x + time * 0.1) * displacement.y + cos(vUv.x - time) * displacement.x;
	displacement.y -= sin(vUv.y + time * 0.5) * displacement.y + cos(vUv.y - time) * displacement.x;

	vec2 vvUv = vec2(vUv.x + displacement.y * 0.015, vUv.y - displacement.x * 0.015);
	
	vec4 glow = effect(vec4(1.0, 0.86666666666666666666666666666667, 0.1921568627450980392156862745098, 1.0), tDiffuse2, vvUv);
  	gl_FragColor = glow;
}