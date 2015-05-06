/// <reference path="../../../typings/threejs/three.d.ts" />
/// <reference path="../definitions/helper/ThreeAddOns.d.ts" />
/// <reference path="../definitions/core/EffectComposer.d.ts" /> 

// Adding bloomPass
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */
declare var SHADERLIST;

module THREE {

    export class InkShader {

        static uniforms = {

            "time": { type: 'f', value: 0.0 },
            "inkText": { type: 't', value:null },
            "source": { type: 'v3v', value: [] }
        };

        static vertexShader = SHADERLIST.ink.vertex;
        static fragmentShader = SHADERLIST.ink.fragment;
    };


    export class CopyShader {
        static uniforms = {
            "tDiffuse":     { type: "t", value: null },
            "opacity":     { type: "f", value: 1.0 }

        };

        static vertexShader = SHADERLIST.copy.vertex;

        static fragmentShader = SHADERLIST.copy.fragment;
    };


    export class AddShader {
        static uniforms = {
            "tDiffuse1":     { type: "t", value: null },
            "tDiffuse2":     { type: "t", value: null }

        };

        static vertexShader = SHADERLIST.add.vertex;

        static fragmentShader = SHADERLIST.add.fragment;
    };
}


