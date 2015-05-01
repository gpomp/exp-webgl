/// <reference path='../../../typings/node/node.d.ts' />

var glslify = require('glslify');

var pVertex = glslify('./../../shaders/vol_ink/plane/vertex.glsl');
var pFragment = glslify('./../../shaders/vol_ink/plane/fragment.glsl');



window['SHADERLIST'] = {
    plane: {
        vertex: pVertex,
        fragment: pFragment
    }
} 