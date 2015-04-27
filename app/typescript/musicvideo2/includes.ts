/// <reference path='../../../typings/node/node.d.ts' />

var glslify = require('glslify');

var bVertex = glslify('./../../shaders/common/blend/vertex.glsl');
var bFragment = glslify('./../../shaders/common/blend/fragment.glsl');

var cVertex = glslify('./../../shaders/common/copy/vertex.glsl');
var cFragment = glslify('./../../shaders/common/copy/fragment.glsl');

var gVertex = glslify('./../../shaders/common/glow/vertex.glsl');
var gFragment = glslify('./../../shaders/common/glow/fragment.glsl');

var pVertex = glslify('./../../shaders/musicvideo2/pfragment/vertex.glsl');
var pFragment = glslify('./../../shaders/musicvideo2/pfragment/fragment.glsl');

var lVertex = glslify('./../../shaders/musicvideo2/lines/vertex.glsl');
var lFragment = glslify('./../../shaders/musicvideo2/lines/fragment.glsl');

var grVertex = glslify('./../../shaders/common/godRay/vertex.glsl');
var grFragment = glslify('./../../shaders/common/godRay/fragment.glsl');

var voronoi = require('../../../node_modules/voronoi-diagram/voronoi');
window['voronoi'] = voronoi;

var randomColor = require('../../../node_modules/randomcolor/randomColor');
window['randomColor'] = randomColor;



window['SHADERLIST'] = {
    pfragment: {
        vertex: pVertex,
        fragment: pFragment
    },

    line: {
        vertex: lVertex,
        fragment: lFragment
    },

    blend: {
        vertex: bVertex,
        fragment: bFragment
    },

    copy: {
        vertex: cVertex,
        fragment: cFragment
    },

    godRay: {
        vertex: grVertex,
        fragment: grFragment
    },

    glow: {
        vertex: gVertex,
        fragment: gFragment
    }
}