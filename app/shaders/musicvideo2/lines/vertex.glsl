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
varying vec2 vaddAngle;

const float M_PI = 3.1415926535897932384626433832795;

void main() {
    vaddAngle = addAngle;
    pos = position;
    float indexRatio = vIndex / 127.0;
    float modTime = mod(time, modV) / modV;
    currTime = modTime;
    float aAngle = addAngle.x;
    pos.x = cos(aAngle + time * 0.1) * (indexRatio * (300.0 + brightSound * addAngle.y  * 10.0));
    pos.y = sin(aAngle + time * 0.1) * (indexRatio * (300.0 + brightSound * addAngle.y  * 10.0));
    pos.z = -1.0 * (10.0 * (brightSound) + brightSound * addAngle.y  * 10.0);
    stagePos = modelMatrix * vec4(pos,1.0);
  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}