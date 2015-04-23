#ifdef GL_ES
precision highp float;
#endif

uniform float radius;
uniform float angle;
uniform float time;
uniform float modV;
uniform float brightSound;

attribute float vIndex;
attribute vec2 addAngle;

varying vec4 stagePos;
varying vec3 pos;
varying float currTime;

const float M_PI = 3.1415926535897932384626433832795;

void main() {
    pos = position;
    float indexRatio = vIndex / 127.0;
    float modTime = mod(time, modV) / modV;
    currTime = modTime;
    float aAngle = addAngle.x;
    pos.x = cos(indexRatio * (M_PI * 2.0)) * (300.0 - (radius + addAngle.y * 5.0) * brightSound);
    pos.y = sin(indexRatio * (M_PI * 2.0)) * (300.0 - (radius + addAngle.y * 5.0) * brightSound);
    pos.z = -1.0 * (radius * 3.0 * ((brightSound)));
    stagePos = modelMatrix * vec4(pos,1.0);
  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}