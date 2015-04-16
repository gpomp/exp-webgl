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
    
    export class CopyShader {
        static uniforms = {
            "tDiffuse":     { type: "t", value: null },
            "opacity":     { type: "f", value: 0.0 }

        }; 

        static vertexShader = SHADERLIST.copy.vertex;

        static fragmentShader = SHADERLIST.copy.fragment;
    };

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


