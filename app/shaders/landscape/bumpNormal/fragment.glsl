
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D tDiffuse;
uniform vec2 size;

varying vec4 stagePos;
varying vec3 pos;
varying vec2 vUv;

void main() {

	float NORMAL_OFF = 1.0 / 50.0;
	vec3 off = vec3(-NORMAL_OFF, 0, NORMAL_OFF);

	// s11 = Current
	float s11 = texture2D(tDiffuse, vUv).x;

	// s01 = Left
	float s01 = texture2D(tDiffuse, vUv.xy + off.xy).x;

	// s21 = Right
	float s21 = texture2D(tDiffuse, vUv.xy + off.zy).x;

	// s10 = Below
	float s10 = texture2D(tDiffuse, vUv.xy + off.yx).x;

	// s12 = Above
	float s12 = texture2D(tDiffuse, vUv.xy + off.yz).x;

	vec3 va = vec3(NORMAL_OFF, 0.0, s21 - s11);
	vec3 vb = vec3(0.0, NORMAL_OFF, s12 - s11);
  	gl_FragColor = vec4( normalize(cross(va,vb)), s11 );
}