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

    export class GlowShader {

        static uniforms = {
            "tDiffuse": { type: "t", value: THREE.ImageUtils.generateDataTexture(4, 4, new THREE.Color(0x000000)) },
            "size": { type: "v2", value: null },
            "quality": { type: "f", value: null },
            "glowPower": { type: "f", value: null },
            "glowColor": { type: "v4", value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) }
 
        };

        static vertexShader = SHADERLIST.glow.vertex;
        static fragmentShader = SHADERLIST.glow.fragment;
    };

    export class GodRayShader {
        static uniforms = {
            "tDiffuse":     { type: "t", value: null },
            "radiusLight": { type: "f", value: 0.2 },
            "lightDirDOTviewDir": { type: "f", value: 1.9 },
            "exposureNB": { type: "f", value: 0.35 },
            "decay": { type: "f", value: 0.95 },
            "density": { type: "f", value: 0.4 },
            "weight": { type: "f", value: 15.0 },
            "illuminationDecay": { type: "f", value: 1.4 },
            "lightPos": { type: "v2", value: new THREE.Vector2(0.5, 0.5) }

        };

        static vertexShader = SHADERLIST.godRay.vertex;

        static fragmentShader = SHADERLIST.godRay.fragment;
    }

    export class CopyShader {
        static uniforms = {
            "tDiffuse":     { type: "t", value: THREE.ImageUtils.generateDataTexture(4, 4, new THREE.Color(0x000000)) },
            "opacity":     { type: "f", value: 1.0 }

        };

        static vertexShader = SHADERLIST.copy.vertex;

        static fragmentShader = SHADERLIST.copy.fragment;
    }
}


