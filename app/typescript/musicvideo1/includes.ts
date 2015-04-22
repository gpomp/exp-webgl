/// <reference path='../../../typings/node/node.d.ts' />

var glslify = require('glslify');

var pcVertex = glslify('./../../shaders/musicvideo1/pointcloud/vertex.glsl');
var pcFragment = glslify('./../../shaders/musicvideo1/pointcloud/fragment.glsl');

var cVertex = glslify('./../../shaders/common/copy/vertex.glsl');
var cFragment = glslify('./../../shaders/common/copy/fragment.glsl');

var BloomPass = require('./BloomPass');
window['THREE']['BloomPass'] = BloomPass;



window['SHADERLIST'] = {
    pointcloud: {
        vertex: pcVertex,
        fragment: pcFragment
    },
    copy: {
        vertex: cVertex,
        fragment: cFragment
    }
}