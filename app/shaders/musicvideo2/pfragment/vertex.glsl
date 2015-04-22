#ifdef GL_ES
precision highp float;
#endif

varying vec4 stagePos;
varying vec3 pos;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
	vUv = uv;
	vNormal = normalMatrix * normal;
    pos = position;
    stagePos = modelMatrix * vec4(pos,1.0);
  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}