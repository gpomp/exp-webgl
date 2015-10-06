/// <reference path='../../../typings/node/node.d.ts' />

var glslify = require('glslify');

var pVertex = glslify('./../../shaders/hairyball/plane/vertex.glsl');
var pFragment = glslify('./../../shaders/hairyball/plane/fragment.glsl');


window['SHADERLIST'] = {
    plane: {
        vertex: pVertex,
        fragment: pFragment
    }
} 