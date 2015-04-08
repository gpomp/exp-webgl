/// <reference path="../../../../typings/node/node.d.ts" />
/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */
declare module webglExp {
    class Detector {
        constructor();
        static isCanvas(): boolean;
        static isWebGL(): boolean;
        static isWorkers(): boolean;
        static isFileapi(): boolean;
    }
}
