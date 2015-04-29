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
    stagePos = modelMatrix * vec4(pos,1.0);
    float distVX = mousePos.x - pos.x;
    float distVY = mousePos.y - (-pos.y);
    float distMouse = distVX * distVX + distVY * distVY;
    float perc = 1.0 - max(0.0, min(1.0, distMouse / 5000.0));
    pos += normal.xyz * vec3(perc * 60.0);
  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}