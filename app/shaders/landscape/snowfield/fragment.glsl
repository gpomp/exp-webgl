#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D flake;
uniform vec2 scroll;
uniform float width;

varying vec4 stagePos;
varying vec3 pos;

void main() { 
	vec3 flakeColor = texture2D(flake, gl_PointCoord).rgb;
  	gl_FragColor = vec4(flakeColor, flakeColor.r * 0.75);
}