#ifdef GL_ES
precision highp float;
#endif

uniform float time;
uniform float radius;
uniform sampler2D text;
uniform int audioData[256];
uniform float maxAV;

attribute vec3 timeD;
attribute float delay;
attribute float dir;

varying vec4 texel;
varying vec4 stagePos;
varying vec3 pos;
varying vec2 vUv;

float insideBox(vec2 v, vec2 bottomLeft, vec2 topRight) {
    vec2 s = step(bottomLeft, v) - step(topRight, v);
    return s.x * s.y;   
}

void main() {

    pos = position;
    float PI = 3.1415926535897932384626433832795;
    
    float cosTime = time * 0.08 * timeD.x;

    pos.x += cos(cosTime) * (timeD.y);
    pos.y += sin(cosTime) * (timeD.y);

    vUv = vec2((pos.x + 256.0) / 512.0, (pos.y + 256.0) / 512.0);
    texel = texture2D( text, vUv );
    float colValue = (texel.x + texel.y + texel.z) / 3.0;
    float angle = 0.0;
    float aPlus = (PI * 2.0) / 160.0;
    float maxDist = 10.0 * 10.0;

    float z = 0.0;
    for(int i = 0; i < 160; i++) {
        float currAngle = aPlus * float(i);
        float x = cos(currAngle) * 246.0;
        float y = sin(currAngle) * 246.0;
        float dx = x - position.x;
        float dy = y - position.y;
        float distSquare = abs(dx * dx + dy * dy);

        float inArea = 1.0 - max(0.0, min(1.0, distSquare / maxDist));
        float aperc = float(audioData[i]);
        texel.rgb += inArea * vec3(currAngle / (PI * 2.0), vUv.y, float(audioData[i]) / maxAV); 
        z += inArea * (aperc) * 3.2;

    }

    pos.z += z;

    pos.z += -50.0 + colValue * 100.0; 
 
    stagePos = modelMatrix * vec4(pos,1.0);
  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}