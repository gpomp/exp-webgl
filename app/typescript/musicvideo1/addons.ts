/// <reference path="../../../typings/threejs/three.d.ts" />
/// <reference path="../definitions/helper/ThreeAddOns.d.ts" />
/// <reference path="../definitions/core/EffectComposer.d.ts" /> 

// Adding bloomPass
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */


module THREE {
    export class Blend2Shader {
        static uniforms = {
            "tDiffuse1": { type: "t", value: null },
            "tDiffuse2": { type: "t", value: null }
 
        };

        static vertexShader = SHADERLIST.blend.vertex;
        static fragmentShader = SHADERLIST.blend.fragment;
    };
    
    export class CopyShader {
        static uniforms = {
            "tDiffuse":     { type: "t", value: null },
            "opacity":     { type: "f", value: 0.0 }

        }; 

        static vertexShader = SHADERLIST.copy.vertex;

        static fragmentShader = SHADERLIST.copy.fragment;
    };

    export class GlowShader {

        static uniforms = {
            "tDiffuse": { type: "t", value: null },
            "size": { type: "v2", value: null },
            "quality": { type: "f", value: null },
            "glowPower": { type: "f", value: null }
 
        };

        static vertexShader = SHADERLIST.glow.vertex;
        static fragmentShader = SHADERLIST.glow.fragment;
    };
}


