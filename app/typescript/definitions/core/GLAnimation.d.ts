/// <reference path="../../../../typings/threejs/three.d.ts" />
/// <reference path="Gui.d.ts" />
/// <reference path="../helper/ThreeAddOns.d.ts" />
declare module webglExp {
    class GLAnimation {
        static SHADERLIST: any;
        static ON_LEAVE_ANIMATION: string;
        private id;
        private scene;
        private camera;
        private renderer;
        private gui;
        private isCameraAround;
        private camCenter;
        private diff;
        private isTurning;
        ctn: THREE.Object3D;
        private mouseSpeed;
        private mousePos;
        private internalRender;
        private controls;
        private leaveEvent;
        constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, href?: string);
        render(): void;
        getScene(): THREE.Scene;
        getCamera(): THREE.PerspectiveCamera;
        getRenderer(): THREE.WebGLRenderer;
        getGui(): webglExp.Gui;
        getMouseSpeed(): number;
        setInternalRender(b: boolean): void;
        getInternalRender(): boolean;
        getLeaveEvent(): CustomEvent;
        getIsTurning(): boolean;
        getID(): string;
        setID(s: string): void;
        getControl(): THREE.MouseControls;
        disableCameraAround(interactiveEl: HTMLElement): void;
        enableCameraAround(object: THREE.Object3D, interactiveEl: HTMLElement): void;
        setCamCenter(c: THREE.Vector3): void;
        resize(): void;
        clear(): void;
        private turnAround;
        private stopTurning;
    }
}
