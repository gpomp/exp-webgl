#ifdef GL_ES
precision highp float;
#endif

varying vec4 stagePos;
varying vec3 pos;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
	vNormal = normal;
    pos = position;
	vUv = uv;

	stagePos = modelMatrix * vec4(pos,1.0);
  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}