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

    export class CopyBloomShader {
        static uniforms = {
            "tDiffuse1":     { type: "t", value: THREE.ImageUtils.generateDataTexture(4, 4, new THREE.Color(0x000000)) },
            "tDiffuse2":     { type: "t", value: null },
            "time": { type: "f", value: 0 },
            "lightDirDOTviewDir": { type: "f", value: 0 }
        };

        static vertexShader = SHADERLIST.copyBloom.vertex;

        static fragmentShader = SHADERLIST.copyBloom.fragment;
    }

    export class GodRayShader {
        static uniforms = {
            "tDiffuse":     { type: "t", value: null },
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

    export class CopyShader {
        static uniforms = {
            "tDiffuse":     { type: "t", value: THREE.ImageUtils.generateDataTexture(4, 4, new THREE.Color(0x000000)) },
            "opacity":     { type: "f", value: 1.0 }

        };

        static vertexShader = SHADERLIST.copy.vertex;

        static fragmentShader = SHADERLIST.copy.fragment;
    }

    export class ConvolutionShader {

        static defines = {

            "KERNEL_SIZE_FLOAT": "25.0",
            "KERNEL_SIZE_INT": "25",

        };

        static uniforms = {

            "tDiffuse": { type: "t", value: null },
            "uImageIncrement": { type: "v2", value: new THREE.Vector2(0.001953125, 0.0) },
            "cKernel": { type: "fv1", value: [] }

        };

        static vertexShader = [

            "uniform vec2 uImageIncrement;",

            "varying vec2 vUv;",

            "void main() {",

            "vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

            "}"

        ].join("\n");

        static fragmentShader = [

            "uniform float cKernel[ KERNEL_SIZE_INT ];",

            "uniform sampler2D tDiffuse;",
            "uniform vec2 uImageIncrement;",

            "varying vec2 vUv;",

            "void main() {",

            "vec2 imageCoord = vUv;",
            "vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",

            "for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {",

            "sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
            "imageCoord += uImageIncrement;",

            "}",

            "gl_FragColor = sum;",

            "}"


        ].join("\n");

        static buildKernel( sigma ) {

            // We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

            function gauss( x, sigma ) {

                return TheMath.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

            }

            var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * TheMath.ceil( sigma * 3.0 ) + 1;

            if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
            halfWidth = ( kernelSize - 1 ) * 0.5;

            values = new Array( kernelSize );
            sum = 0.0;
            for ( i = 0; i < kernelSize; ++i ) {

                values[ i ] = gauss( i - halfWidth, sigma );
                sum += values[ i ];

            }

            // normalize the kernel

            for ( i = 0; i < kernelSize; ++i ) values[ i ] /= sum;

            return values;

        }

    };
}


