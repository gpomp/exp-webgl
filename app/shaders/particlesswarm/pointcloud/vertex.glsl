#ifdef GL_ES
precision highp float;
#endif

uniform float time;
uniform float radius;
uniform sampler2D text;
uniform int audioData[256];
uniform float maxAV;

attribute vec3 timeD;

varying vec4 texel;
varying vec4 stagePos;
varying vec3 pos;
varying vec2 vUv;

void main() {

    pos = position;
    float PI = 3.1415926535897932384626433832795;
    
    float cosTime = time * 0.08 * timeD.x;

    pos.x += cos(cosTime) * (timeD.y);
    pos.y += sin(cosTime) * (timeD.y);

    vUv = vec2((pos.x + 256.0) / 512.0, (pos.y + 256.0) / 512.0);
    texel = vec4(0.0);
    vec4 t = texture2D( text, vUv );

    float colValue = (t.x + t.y + t.z) / 3.0;
    float angle = 0.0;
    float aPlus = (PI * 2.0) / 160.0;
    float maxDist = 10.0 * 10.0;

    float texAngle = atan(pos.y, pos.x);

    float x = cos(texAngle) * 246.0;
    float y = sin(texAngle) * 246.0;

    float percAngle = (PI + texAngle) / ( 2.0 * PI);

    float dx = x - pos.x;
    float dy = y - pos.y;
    float distSquare = abs(dx * dx + dy * dy);
    float inArea = 1.0 - max(0.0, min(1.0, distSquare / maxDist));

    int soundPos = int(percAngle * 160.0);
    float aData = float(audioData[soundPos]);

    texel.rgb += inArea * vec3(percAngle, 1.0 - percAngle, aData / maxAV); 
    
    float z = inArea * (aData * 4.2);

    texel.rgb += t.rgb * (1.0 - inArea);

    pos.z += z;

    pos.z += (-50.0 + colValue * 100.0) * (1.0 - ceil(inArea)); 
 
    stagePos = modelMatrix * vec4(pos,1.0);
  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}