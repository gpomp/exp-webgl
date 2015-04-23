#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D text;
 
uniform vec3 pointLightColor[MAX_POINT_LIGHTS];
uniform vec3 pointLightPosition[MAX_POINT_LIGHTS];
uniform float pointLightDistance[MAX_POINT_LIGHTS];

varying vec4 stagePos;
varying vec3 pos;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
	vec4 addedLights = vec4(0.0,0.0,0.0, 1.0);
    for(int l = 0; l < MAX_POINT_LIGHTS; l++) {
        vec3 lightDirection = normalize(stagePos.xyz
                              -pointLightPosition[l]);
        addedLights.rgb += clamp(dot(-lightDirection,
                                 vNormal), 0.0, 1.0)
                           * pointLightColor[l];
    }

    //  texture2D(tVideo, vUv)
    vec4 textCol = texture2D( text, vUv );
  	gl_FragColor =	vec4(textCol.rgb * addedLights.rgb, textCol.a);
}