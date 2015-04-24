/// <reference path='../../../typings/node/node.d.ts' />

var glslify = require('glslify');

var bVertex = glslify('./../../shaders/common/blend/vertex.glsl');
var bFragment = glslify('./../../shaders/common/blend/fragment.glsl');

var gVertex = glslify('./../../shaders/common/glow/vertex.glsl');
var gFragment = glslify('./../../shaders/common/glow/fragment.glsl');

var pcVertex = glslify('./../../shaders/musicvideo1/pointcloud/vertex.glsl');
var pcFragment = glslify('./../../shaders/musicvideo1/pointcloud/fragment.glsl');

var cVertex = glslify('./../../shaders/common/copy/vertex.glsl');
var cFragment = glslify('./../../shaders/common/copy/fragment.glsl');



window['SHADERLIST'] = {
    pointcloud: {
        vertex: pcVertex,
        fragment: pcFragment
    },
    copy: {
        vertex: cVertex,
        fragment: cFragment
    },
    blend: {
        vertex: bVertex,
        fragment: bFragment
    },
    glow: {
        vertex: gVertex,
        fragment: gFragment
    }
}