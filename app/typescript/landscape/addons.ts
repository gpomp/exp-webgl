/// <reference path="../../../typings/threejs/three.d.ts" />
declare var SHADERLIST;

module THREE {
    export class BumpMapShader {
        static uniforms = {
            "scroll":     { type: "v2", value: new THREE.Vector2(0, 0) },
            "noisePond": { type: 'f',  value: 3749 }, 
            "uH": { type: 'f', value: 1.0 }, 
            "uLacunarity": { type: 'f', value: 2.7 }

        };

        static vertexShader = SHADERLIST.bumpMap.vertex;

        static fragmentShader = SHADERLIST.bumpMap.fragment;
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