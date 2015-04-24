/// <reference path='../../../typings/node/node.d.ts' />

var glslify = require('glslify');

var glVertex = glslify('./../../shaders/common/glow/vertex.glsl');
var glFragment = glslify('./../../shaders/common/glow/fragment.glsl');

var sVertex = glslify('./../../shaders/fireball/sphere/vertex.glsl');
var sFragment = glslify('./../../shaders/fireball/sphere/fragment.glsl');

var bVertex = glslify('./../../shaders/fireball/burst/vertex.glsl');
var bFragment = glslify('./../../shaders/fireball/burst/fragment.glsl');

var rVertex = glslify('./../../shaders/fireball/ring/vertex.glsl');
var rFragment = glslify('./../../shaders/fireball/ring/fragment.glsl');

var cbVertex = glslify('./../../shaders/fireball/copyBloom/vertex.glsl');
var cbFragment = glslify('./../../shaders/fireball/copyBloom/fragment.glsl');

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
    glow: {
        vertex: glVertex,
        fragment: glFragment
    },
    copy: {
        vertex: cVertex,
        fragment: cFragment
    },
    copyBloom: {
        vertex: cbVertex,
        fragment: cbFragment
    }
}