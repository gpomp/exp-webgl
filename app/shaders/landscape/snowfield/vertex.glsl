#ifdef GL_ES
precision highp float;
#endif

#pragma glslify: noise = require(../../../../node_modules/glsl-noise/classic/3d)

uniform float time;
uniform float width;
uniform float height;
uniform vec2 scroll;

uniform float noiseDivide;
uniform float zWind;
uniform float xWind;

attribute vec2 modValue;

varying vec4 stagePos;
varying vec3 pos;

void main() {
    pos = position;
    pos.y = mod(time, modValue.x) * -modValue.y;
    float xNoise = noise(pos / noiseDivide);
    pos.x -= xNoise * zWind;
    pos.z -= xNoise * -xWind;
    pos.x = mod(pos.x - scroll.x, width) - width * 0.5;
    pos.z = mod(pos.z - scroll.y, height) - height * 0.5;
    stagePos = modelMatrix * vec4(pos,1.0);
    gl_PointSize = 16.0 * ((height * 0.5 + stagePos.z) / height);

  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}