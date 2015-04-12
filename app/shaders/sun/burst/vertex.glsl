#ifdef GL_ES
precision highp float;
#endif

uniform float time;
uniform float radius;
uniform float aPos;

attribute vec2 a;
attribute float id;
attribute float departed;

varying vec4 stagePos;
varying vec3 pos;
varying vec2 startPos;
varying vec2 currPos;

void main() {
    pos = position;

	float currentAngleX = 	a.y;

	float px = cos(aPos) * radius;
	float py = sin(aPos) * radius;

	startPos = vec2(px, py);

	float idDef = (id + 1.0) * 0.01;
	pos.x = px + departed * time + cos(aPos) * (40.0 * time) + (cos(aPos + currentAngleX * time) * (10.0 * idDef * time));
	pos.y = py + departed * time + sin(aPos) * (40.0 * time) + (sin(aPos + currentAngleX * time) * (10.0 * idDef * time));

	currPos = pos.xy;

    gl_PointSize = 1.0;
    stagePos = modelMatrix * vec4(pos,1.0);
  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}