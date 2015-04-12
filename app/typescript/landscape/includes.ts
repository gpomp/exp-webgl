/// <reference path='../../../typings/node/node.d.ts' />

var glslify = require('glslify');

var gVertex = glslify('./../../shaders/landscape/ground/vertex.glsl');
var gFragment = glslify('./../../shaders/landscape/ground/fragment.glsl');

var sVertex = glslify('./../../shaders/landscape/snowfield/vertex.glsl');
var sFragment = glslify('./../../shaders/landscape/snowfield/fragment.glsl');



window['SHADERLIST'] = {
    ground: {
        vertex: gVertex,
        fragment: gFragment
    },
    snowfield: {
        vertex: sVertex,
        fragment: sFragment
    }
}