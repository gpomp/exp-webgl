#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D inkText;
uniform sampler2D inkspillText;

attribute vec3 rand;

varying vec4 stagePos;
varying vec3 pos;
varying vec3 vNormal;
varying vec3 randoms;
varying vec2 vUv;
varying vec2 paperUv;
varying float colV;

void main() {
	randoms = rand;
	vNormal = normal;
    pos = position;
	vUv = uv;
	
	vec2 rText = vec2(1024.0 / 256.0);
	paperUv = uv * rText;

	vec4 texel = texture2D(inkText, vUv);
	vec4 texelInk = texture2D(inkspillText, vUv);
	colV = texelInk.r;

	pos.z += (1.0 - colV) * 10.0;

	stagePos = modelMatrix * vec4(pos,1.0);
  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}