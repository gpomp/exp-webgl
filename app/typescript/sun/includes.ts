/// <reference path='../../../typings/node/node.d.ts' />

var glslify = require('glslify');

var sVertex = glslify('./../../shaders/sun/sphere/vertex.glsl');
var sFragment = glslify('./../../shaders/sun/sphere/fragment.glsl');

var bVertex = glslify('./../../shaders/sun/burst/vertex.glsl');
var bFragment = glslify('./../../shaders/sun/burst/fragment.glsl');

var rVertex = glslify('./../../shaders/sun/ring/vertex.glsl');
var rFragment = glslify('./../../shaders/sun/ring/fragment.glsl');

var gVertex = glslify('./../../shaders/common/godRay/vertex.glsl');
var gFragment = glslify('./../../shaders/common/godRay/fragment.glsl');

var cVertex = glslify('./../../shaders/common/copy/vertex.glsl');
var cFragment = glslify('./../../shaders/common/copy/fragment.glsl');

var BloomPass = require('./BloomPass');
window['THREE']['BloomPass'] = BloomPass;

window['SHADERLIST'] = {
    sphere: {
        vertex: sVertex,
        fragment: sFragment
    },
    burst: {
        vertex: bVertex,
        fragment: bFragment
    },
    ring: {
        vertex: rVertex,
        fragment: rFragment
    },
    godRay: {
        vertex: gVertex,
        fragment: gFragment
    },
    copy: {
        vertex: cVertex,
        fragment: cFragment
    }
}