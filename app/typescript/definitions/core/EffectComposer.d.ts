/// <reference path="../../../../typings/threejs/three.d.ts" />
/// <reference path="Gui.d.ts" />
declare module webglExp {
    class EffectComposer {
        private renderer;
        private camera;
        private scene;
        private width;
        private height;
        private composer;
        private rt;
        effectBloom: any;
        bloomStrength: any;
        folder: any;
        constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, width: number, height: number);
        addPass(p: any): void;
        reset(): void;
        getComposer(): any;
        getRenderTarget(): THREE.WebGLRenderTarget;
    }
}
