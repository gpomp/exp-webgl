#ifdef GL_ES
precision highp float;
#endif

uniform float radius;
uniform vec2 textSize;
uniform vec2 mousePos;

varying vec4 stagePos;
varying vec3 pos;
varying vec2 vUv;

const float M_PI = 3.1415926535897932384626433832795;

void main() {
	vUv = uv * textSize;
    pos = position;
    pos += normal.xyz * vec3(mousePos.xy, (mousePos.x + mousePos.y) * 0.5) * 50.0;
    stagePos = modelMatrix * vec4(pos,1.0);
  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}