#ifdef GL_ES
precision highp float;
#endif

uniform float time;
uniform float radius;
uniform float aPos;
uniform vec2 startPos;
uniform float total;
uniform float addRadius;

attribute vec2 a;
attribute float id;
attribute float departed;

varying vec4 stagePos;
varying vec3 pos;
varying vec2 currPos;
varying float dispRad;

const float M_PI = 3.1415926535897932384626433832795;

vec2 latngFromCoords(vec3 coords) {
	float lat = acos(coords.y / radius); //theta
    float lon = atan(coords.x / coords.z); //phi
    return vec2(lat, lon);
}

vec3 coordsFromLatLng(vec2 latlng) {
	float x = dispRad * cos(latlng.x) * cos(latlng.y);
	float y = dispRad * sin(latlng.x);
	float z = dispRad * cos(latlng.x) * sin(latlng.y);
	return vec3(x, y, z);
}

void main() {
    pos = position;

	float idDef = (id) * 0.01;
	float angleid = id / total * a.y;
	
	float modId = mod(id, 2.0);
	dispRad = radius + time * idDef * 0.1 + (departed * 0.4) * time * modId;
	float llRad = dispRad - radius;

	vec2 startLatLng = startPos;
	startLatLng.x += cos(time * 2.0 + angleid) * ((addRadius + departed * 0.001) * time + llRad * 0.01);
	startLatLng.y += sin(time * 2.0 + angleid) * ((addRadius + departed * 0.001) * time + llRad * 0.01);

	pos = coordsFromLatLng(startLatLng);

	gl_PointSize = 1.0;

	currPos = pos.xy;

    gl_PointSize = 4.0;
    stagePos = modelMatrix * vec4(pos,1.0);
  	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos,1.0);  
}