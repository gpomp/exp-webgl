
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



    export class CopyShader {
        static uniforms = {
            "tDiffuse":     { type: "t", value: null },
            "opacity":     { type: "f", value: 1.0 }

        };

        static vertexShader = SHADERLIST.copy.vertex;

        static fragmentShader = SHADERLIST.copy.fragment;
    };

}