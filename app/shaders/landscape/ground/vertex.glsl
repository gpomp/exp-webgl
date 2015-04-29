#ifdef GL_ES
precision highp float;
#endif

uniform float time;
uniform float width;
uniform float height;
uniform vec2 repeatText;
uniform vec2 scroll;
uniform float noisePond;
uniform float noiseAspPond;
uniform float heightAspVal;
uniform float heightVal;
uniform float avWSeg;
uniform float avHSeg;
uniform float uH;
uniform float uLacunarity;

uniform sampler2D bumpMat;

varying vec4 stagePos;
varying vec3 pos;
varying vec3 vNormal;
varying vec2 vUv;
varying vec2 rgUv;
varying mat3 vNormalMatrix;

void main() { 
	vNormalMatrix = normalMatrix;
	vec4 bump = texture2D(bumpMat, uv);
	rgUv = uv;
	// Scale uv to fit plane
	vec2 rText = vec2((width) / repeatText.x, (height) / repeatText.y);
	vUv = (uv + scroll / vec2(width, height)) * rText;

	pos = vec3(position.xy, bump.r * heightVal);

    stagePos = modelMatrix * vec4(pos,1.0);

    // Calculate normal from face's tangent/bitangent
    vNormal = bump.xzy;

  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}