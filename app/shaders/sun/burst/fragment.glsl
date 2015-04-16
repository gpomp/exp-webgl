#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif

uniform float alpha;
uniform vec3 baseColor;

varying vec4 stagePos;
varying vec3 pos;
varying vec2 currPos;

void main() {
	// float diffX = currPos.x - startPos.x;
	// float diffY = currPos.y - startPos.y;
	// float squareDist = diffX * diffX + diffY * diffY;
	// float dist = 1.0 - max(0.0, min(1.0, squareDist / 10000.0));
  	gl_FragColor = vec4(baseColor, alpha);
}