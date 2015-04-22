/// <reference path='../../../typings/node/node.d.ts' />

var glslify = require('glslify');

var pVertex = glslify('./../../shaders/musicvideo2/pfragment/vertex.glsl');
var pFragment = glslify('./../../shaders/musicvideo2/pfragment/fragment.glsl');

var voronoi = require('../../../node_modules/voronoi-diagram/voronoi');
window['voronoi'] = voronoi;



window['SHADERLIST'] = {
    pfragment: {
        vertex: pVertex,
        fragment: pFragment
    }
}