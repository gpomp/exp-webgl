///<reference path='../../../../typings/node/node.d.ts' />

/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */
module webglExp {
    export class Detector {
        constructor() {
            
        }

        public static isCanvas():boolean {
            return !! window["CanvasRenderingContext2D"];
        }

        public static isWebGL():boolean {
            return ( function () { try { var canvas = document.createElement( 'canvas' ); return !! ( window["WebGLRenderingContext"] && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) ); } catch( e ) { return false; } } )();
        }

        public static isWorkers():boolean {
            return !! window["Worker"];
        }

        public static isFileapi():boolean {
            return window["File"] && window["FileReader"] && window["FileList"] && window["Blob"];
        }
    }
}