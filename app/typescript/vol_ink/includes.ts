/// <reference path='../../../typings/node/node.d.ts' />

var glslify = require('glslify');

var iVertex = glslify('./../../shaders/vol_ink/ink/vertex.glsl');
var iFragment = glslify('./../../shaders/vol_ink/ink/fragment.glsl');

var pVertex = glslify('./../../shaders/vol_ink/plane/vertex.glsl');
var pFragment = glslify('./../../shaders/vol_ink/plane/fragment.glsl');

var cVertex = glslify('./../../shaders/common/copy/vertex.glsl');
var cFragment = glslify('./../../shaders/common/copy/fragment.glsl');

var aVertex = glslify('./../../shaders/common/add/vertex.glsl');
var aFragment = glslify('./../../shaders/common/add/fragment.glsl');



window['SHADERLIST'] = {
    plane: {
        vertex: pVertex,
        fragment: pFragment
    },
    ink: {
        vertex: iVertex,
        fragment: iFragment
    },
    copy: {
        vertex: cVertex,
        fragment: cFragment
    },
    add: {
        vertex: aVertex,
        fragment: aFragment
    }
} 