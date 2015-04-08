/// <reference path='../../../typings/node/node.d.ts' />

var THREE = require('../../../node_modules/three/three');
window['THREE'] = THREE;
require('../../../node_modules/three-effectcomposer/index');
var dat = require('../../../node_modules/dat-gui/index');
window['dat'] = dat;
var Stats = require('../../../node_modules/stats-js/src/Stats');
window['Stats'] = Stats;