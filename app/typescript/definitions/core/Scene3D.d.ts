/// <reference path="../../../../typings/threejs/three.d.ts" />
/// <reference path="GLAnimation.d.ts" />
/// <reference path="EffectComposer.d.ts" />
/// <reference path="../helper/ShaderLoader.d.ts" />
declare module webglExp {
    class Scene3D {
        static ASPECT: number;
        static FAR: number;
        static NEAR: number;
        static VIEW_ANGLE: number;
        static WIDTH: number;
        static HEIGHT: number;
        private renderer;
        private camera;
        private scene;
        private gui;
        private stats;
        private currentAnim;
        private shaderLoadedCB;
        private scroll;
        private frame;
        private body;
        constructor(shaderLoadedCB: Function);
        shaderLoaded: (data: any) => void;
        getScene(): THREE.Scene;
        getCamera(): THREE.PerspectiveCamera;
        getRenderer(): THREE.WebGLRenderer;
        setAnim(a: webglExp.GLAnimation): void;
        render: () => void;
        leaveAnimation: (event: CustomEvent) => void;
        resize(): void;
    }
}
