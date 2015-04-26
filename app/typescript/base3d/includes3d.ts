/// <reference path='../../../typings/node/node.d.ts' />

var THREE = require('../../../node_modules/three/three');
window['THREE'] = THREE;
var effect = require('../../../node_modules/three-effectcomposer')(THREE);
window['THREE']['EffectComposer'] = effect;
window['THREE']['RenderPass'] = effect.RenderPass;
window['THREE']['ShaderPass'] = effect.ShaderPass;
var dat = require('../../../node_modules/dat-gui/index');
window['dat'] = dat;
var Stats = require('../../../node_modules/stats-js/src/Stats');
window['Stats'] = Stats; 
var TweenMax = require('../../../node_modules/gsap/src/uncompressed/TweenMax');
window['TweenMax'] = TweenMax; 