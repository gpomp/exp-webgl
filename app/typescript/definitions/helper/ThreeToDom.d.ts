/// <reference path="../../../../typings/threejs/three.d.ts" />
declare module webglExp {
    class ThreeToDom {
        middlePos: THREE.Vector2;
        private camera;
        private obj;
        private el;
        private enabled;
        private projScreenMat;
        private scale;
        private box;
        constructor(camera: THREE.PerspectiveCamera, obj: THREE.Mesh, el: HTMLElement);
        enable(): void;
        disable(): void;
        checkFaceCamera(): boolean;
        updatePosition(disableFaceTest?: boolean): void;
    }
}
