/// <reference path="../../../../typings/threejs/three.d.ts" />
/// <reference path="../Site.d.ts" />
/// <reference path="../core/Scene3D.d.ts" />
declare module webglExp {
    class FakeTranspTexture {
        constructor();
    }
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
    class HorizontalBlurShader {
    }
    class VerticalBlurShader {
    }
    class FXAAShader {
    }
    class ShaderPass {
        uniforms: any;
        renderToScreen: any;
        constructor(...args: any[]);
    }
    class RenderPass {
        constructor(...args: any[]);
    }
    class BloomPass {
        static blurX: any;
        static blurY: any;
        copyUniforms: any;
        constructor(strength: any, kernelSize: any, sigma: any, resolution: any, maskActive: any);
    }
    class EffectComposer {
        constructor(...args: any[]);
    }
}
declare var TheMath: Math;
declare module THREE {
    class Mouse2DControls {
        private _object;
        private lastPos;
        private _pos;
        private _currPos;
        private _enabled;
        constructor(object: THREE.Object3D[]);
        onMouseDown: (event: any) => void;
        onMouseUp: (event: any) => void;
        onMouseMove: (event: any) => void;
        transformCoordinates(v: THREE.Vector2): THREE.Vector2;
        toggleEnable(b: boolean): void;
        render(): void;
    }
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
