/// <reference path="../../../../typings/threejs/three.d.ts" />
/// <reference path="../Site.d.ts" />
declare module webglExp {
    class MouseSpeed {
        distSquared: number;
        private mousePosX;
        private mousePosY;
        private ratio;
        constructor(ratio?: number);
        mousemove: (event: MouseEvent) => void;
    }
    class Tools {
        constructor();
        static createCustomEvent(name: string): CustomEvent;
        static getVertexNB(nb: number): number;
    }
}
declare module THREE {
    class BlendShader {
        static uniforms: {
            "tBackground": {
                type: string;
                value: any;
            };
            "tDiffuse1": {
                type: string;
                value: any;
            };
            "tDiffuse2": {
                type: string;
                value: any;
            };
            "tDiffuse3": {
                type: string;
                value: any;
            };
            "mixRatio": {
                type: string;
                value: number;
            };
            "opacity": {
                type: string;
                value: number;
            };
        };
        static vertexShader: string;
        static fragmentShader: string;
    }
    class CopyOneShader {
        static uniforms: {
            "tBackground": {
                type: string;
                value: any;
            };
        };
        static vertexShader: string;
        static fragmentShader: string;
    }
}
declare module THREE {
    class HorizontalBlurShader {
    }
    class VerticalBlurShader {
    }
    class BloomPass {
        static blurX: any;
        static blurY: any;
        constructor(...args: any[]);
    }
    class FXAAShader {
    }
    class EffectComposer {
        constructor(...args: any[]);
    }
}
declare var TheMath: Math;
declare module THREE {
    class MouseControls {
        enabled: any;
        orientation: any;
        private PI_2;
        private mouseQuat;
        private object;
        private xVector;
        private yVector;
        oldOr: THREE.Vector2;
        private lastPos;
        constructor(object: THREE.Object3D);
        clear(): void;
        onMouseDown: (event: any) => void;
        onMouseUp: (event: any) => void;
        onMouseMove: (event: any) => void;
        update(): void;
    }
    class MoveOnSphere {
        private radius;
        private distance;
        private p1;
        private p2;
        private pointVec;
        constructor(radius: number);
        setRadius(radius: number): void;
        setPoints(p1: THREE.Vector2, p2: THREE.Vector2): void;
        getPointAt(n: number): THREE.Vector3;
    }
}
