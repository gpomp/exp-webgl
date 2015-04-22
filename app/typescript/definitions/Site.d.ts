/// <reference path="core/Scene3D.d.ts" />
/// <reference path="core/Gui.d.ts" />
/// <reference path="helper/Detector.d.ts" />
declare module webglExp {
    class Site {
        static activeDevice: string;
        static activeDeviceType: string;
        private mainScene;
        private siteReady;
        private callback;
        private _expMenu;
        private _expMenuTip;
        private _showInfoBtn;
        private _infos;
        private _footer;
        constructor(callback: Function);
        configSite(): void;
        toggleMenu: (event: MouseEvent) => void;
        toggleInfo: (event: MouseEvent) => void;
        configWebgl(): void;
        scroll: (event: any) => void;
        checkScrollAnim: () => void;
        checkScroll(): void;
        shaderLoaded: (scene3d: Scene3D) => void;
        resize: (event: any) => void;
        deviceType(): void;
    }
}
