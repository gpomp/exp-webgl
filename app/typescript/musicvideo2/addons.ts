
declare var SHADERLIST;
module THREE {
    export class Blend2Shader {
        static uniforms = {
            "tDiffuse1": { type: "t", value: null },
            "tDiffuse2": { type: "t", value: null }
 
        };

        static vertexShader = SHADERLIST.blend.vertex;
        static fragmentShader = SHADERLIST.blend.fragment;
    };

    export class GodRayShader {
        static uniforms = {
            "tDiffuse":     { type: "t", value: null },
            "tDiffuse1": { type: "t", value: THREE.ImageUtils.generateDataTexture(4, 4, new THREE.Color(0xFF0000)) },
            "radiusLight": { type: "f", value: 0.2 },
            "lightDirDOTviewDir": { type: "f", value: 1.9 },
            "exposureNB": { type: "f", value: 0.35 },
            "decay": { type: "f", value: 0.95 },
            "density": { type: "f", value: 0.4 },
            "weight": { type: "f", value: 15.0 },
            "illuminationDecay": { type: "f", value: 1.4 }

        };

        static vertexShader = SHADERLIST.godRay.vertex;

        static fragmentShader = SHADERLIST.godRay.fragment;
    }

    export class GlowShader {

        static uniforms = {
            "tDiffuse": { type: "t", value: null },
            "size": { type: "v2", value: null },
            "quality": { type: "f", value: null },
            "glowPower": { type: "f", value: null },
            "glowColor": { type: "v4", value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) }
 
        };

        static vertexShader = SHADERLIST.glow.vertex;
        static fragmentShader = SHADERLIST.glow.fragment;
    };



    export class CopyShader {
        static uniforms = {
            "tDiffuse":     { type: "t", value: null },
            "opacity":     { type: "f", value: 1.0 }

        };

        static vertexShader = SHADERLIST.copy.vertex;

        static fragmentShader = SHADERLIST.copy.fragment;
    };

}