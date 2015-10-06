

#ifdef GL_ES
precision highp float;
#endif

uniform float time;
uniform float radius;
uniform float lineAlpha;

varying vec4 stagePos;
varying vec4 texel;
varying vec3 pos;
varying vec2 vUv;

void main() {
	vec3 col = texel.rgb;
	// vec3 col = vec3(vUv.x * texel.r, vUv.y * texel.g, texel.b);
  	gl_FragColor = vec4(col, lineAlpha); 
}
