/// <reference path='../../../typings/node/node.d.ts' />

var glslify = require('glslify');

var pVertex = glslify('./../../shaders/cubeExample/plane/vertex.glsl');
var pFragment = glslify('./../../shaders/cubeExample/plane/fragment.glsl');

var pcVertex = glslify('./../../shaders/particlesswarm/pointcloud/vertex.glsl');
var pcFragment = glslify('./../../shaders/particlesswarm/pointcloud/fragment.glsl');

var cVertex = glslify('./../../shaders/common/copy/vertex.glsl');
var cFragment = glslify('./../../shaders/common/copy/fragment.glsl');

var BloomPass = require('./BloomPass');
window['THREE']['BloomPass'] = BloomPass;



window['SHADERLIST'] = {
    plane: {
        vertex: pVertex,
        fragment: pFragment
    },
    pointcloud: {
        vertex: pcVertex,
        fragment: pcFragment
    },
    copy: {
        vertex: cVertex,
        fragment: cFragment
    }
}