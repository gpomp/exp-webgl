/// <reference path='../../../typings/node/node.d.ts' />

var glslify = require('glslify');

var gVertex = glslify('./../../shaders/landscape/ground/vertex.glsl');
var gFragment = glslify('./../../shaders/landscape/ground/fragment.glsl');

var sVertex = glslify('./../../shaders/landscape/snowfield/vertex.glsl');
var sFragment = glslify('./../../shaders/landscape/snowfield/fragment.glsl');

var cVertex = glslify('./../../shaders/common/copy/vertex.glsl');
var cFragment = glslify('./../../shaders/common/copy/fragment.glsl');

var bVertex = glslify('./../../shaders/landscape/bumpMap/vertex.glsl');
var bFragment = glslify('./../../shaders/landscape/bumpMap/fragment.glsl');



window['SHADERLIST'] = {
    bumpMap: {
        vertex: bVertex,
        fragment: bFragment
    },
    ground: {
        vertex: gVertex,
        fragment: gFragment
    },
    snowfield: {
        vertex: sVertex,
        fragment: sFragment
    },
    copy: {
        vertex: cVertex,
        fragment: cFragment
    }
}