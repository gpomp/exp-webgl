#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D tDiffuse1;
uniform sampler2D tDiffuse2;
uniform float time;

varying vec2 vUv;

void main() {
  float x = vUv.x + sin(time + vUv.x * 20.0) * 0.01;
  float y = vUv.y + sin(time + vUv.y * 20.0)  * sin(50.0 + 0.22 * 300.0) * 0.05;
	vec2 vvUv = vec2(x, y);
	
	vec4 texel1 = texture2D(tDiffuse1, vvUv);
  vec4 texel2 = texture2D(tDiffuse2, vvUv);

  gl_FragColor = mix(texel1, texel2, texel2.a);
}