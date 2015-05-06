#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D tDiffuse1;
uniform sampler2D tDiffuse2;
varying vec2 vUv;

void main() {
	vec4 texel1 = texture2D( tDiffuse1, vUv );
	vec4 texel2 = texture2D( tDiffuse2, vUv );
	// max(texel1.g, texel2.g),
 //  							max(texel1.b, texel2.b),
 //  							max(texel1.a, texel2.a)
  	gl_FragColor = vec4(	max(texel1.r, texel2.r),
  							max(texel1.g, texel2.g),
							max(texel1.b, texel2.b),
   							max(texel1.a, texel2.a));
}