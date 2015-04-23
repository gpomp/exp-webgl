/// <reference path="../../../../typings/threejs/three.d.ts" />
declare module utils {
    class Video2Canvas {
        isDrawing: boolean;
        private _canvas;
        private _context;
        private _videoEl;
        private _pos;
        private _size;
        dataArray: any;
        dArray: any;
        audioLoaded: any;
        maxAudioV: number;
        mostChange: any;
        private _mChange;
        private _bufferLength;
        private _analyser;
        private _audioContext;
        private _tempArray;
        private _audioCallback;
        private _soundSetup;
        private _levelsCount;
        private _levelBins;
        constructor(audioCallback: Function, isSpectrum?: boolean);
        canplay: () => void;
        getSound(): void;
        drawCanvas: () => void;
        getCanvas(): HTMLCanvasElement;
        render(isSpectrum?: boolean): void;
        renderDiff(): void;
        renderSpectrum(): void;
    }
    class Prefix {
        constructor();
        static transformPrefix(): string;
        static GetVendorPrefix(arrayOfPrefixes: any): string;
    }
    class GameKeyBoardControl {
        private _callbackKeyPressed;
        private _callbackKeyUp;
        private _keyHTML;
        constructor(callbackKeyPressed: Function, callbackKeyUp: Function);
        keydown: (event: KeyboardEvent) => void;
        keyup: (event: KeyboardEvent) => void;
    }
}
