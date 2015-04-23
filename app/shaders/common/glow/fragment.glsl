#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D tDiffuse;
uniform float quality;
uniform float glowPower;
uniform vec2 size;

varying vec2 vUv;

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
      		sum += texture2D(tex, tc + offset) * glowPower;
    	}
  	}
  
  	return ((sum / (float(samples) * float(samples))) + source) * colour;
}

void main() {
	
	vec4 glow = effect(vec4(1.0), tDiffuse, vUv);
  gl_FragColor = glow;
}