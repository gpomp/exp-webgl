/// <reference path='../../../typings/node/node.d.ts' />

var glslify = require('glslify');

var pVertex = glslify('./../../shaders/cubeExample/plane/vertex.glsl');
var pFragment = glslify('./../../shaders/cubeExample/plane/fragment.glsl');



window['SHADERLIST'] = {
    plane: {
        vertex: pVertex,
        fragment: pFragment
    }
}