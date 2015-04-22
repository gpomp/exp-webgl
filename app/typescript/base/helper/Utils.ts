/// <reference path="../../../../typings/threejs/three.d.ts" />

module utils {
    export class Video2Canvas {

        public isDrawing: boolean;

        private _canvas: HTMLCanvasElement;
        private _context;

        private _videoEl: HTMLVideoElement;
        private _pos: THREE.Vector2;

        public dataArray;
        public dArray;
        public audioLoaded;
        public maxAudioV: number;
        public mostChange;

        private _mChange;
        
        private _bufferLength;
        private _analyser;
        private _audioContext;
        private _tempArray;

        private _audioCallback: Function;

        private _soundSetup: boolean;

        private _levelsCount: number = 64;
        private _levelBins: number;


        constructor(audioCallback:Function, isSpectrum:boolean = false) {
            this._audioCallback = audioCallback;
            this.dArray = [];
            this._tempArray = [];
            this.maxAudioV = 0;

            this._soundSetup = false;
            this.mostChange = [];
            this._mChange = [];
            for (var i = 0; i < 100; ++i) {
                this._mChange.push(0);
            }

            if(!isSpectrum) {
                for (var i = 0; i < 256; ++i) {
                    this.dArray.push(i);
                    this._tempArray.push(i);
                }
            }
            


            this.isDrawing = false;

            this._canvas = document.createElement('canvas');
            this._context = this._canvas.getContext('2d');

            this._canvas.setAttribute("width", "512px");
            this._canvas.setAttribute("height", "512px");

            this._videoEl = <HTMLVideoElement>document.getElementById('video');

            this._pos = new THREE.Vector2((512 - 640) * 0.5, (512 - 360) * 0.5);

            this._videoEl.oncanplay = function() { this.drawCanvas(); }.bind(this); 

            this._videoEl.addEventListener('canplay', this.drawCanvas);

            if (this._videoEl.readyState > 3) {
                this.drawCanvas();
            }
        }

        canplay = () => {
            window['AudioContext'] = window['AudioContext']||window['webkitAudioContext'];
            this._audioContext = new AudioContext();
            this.getSound();
        }

        getSound() {
            console.log('getSound');
            var source = this._audioContext.createMediaElementSource(this._videoEl);

            this._analyser = this._audioContext.createAnalyser();
            this._analyser.fftSize = 2048; 
            this._bufferLength = this._analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this._bufferLength);
            this._analyser.getByteFrequencyData(this.dataArray);

            source.connect(this._analyser);
            this._analyser.connect(this._audioContext.destination);

            this._levelBins = Math.floor(this._analyser.frequencyBinCount / this._levelsCount);

            this._audioCallback();

            this.audioLoaded = true;

            this._videoEl.play();
            this._soundSetup = true;
        }

        drawCanvas = () => {
            if (this._soundSetup) return;
            this.isDrawing = true;
            this.canplay();
            
        }

        getCanvas():HTMLCanvasElement {
            return this._canvas;
        }

        render(isSpectrum:boolean = false) {
            this._context.drawImage(this._videoEl, this._pos.x, this._pos.y, 640, 360);
            if(this.audioLoaded) {
                this._analyser.getByteFrequencyData(this.dataArray);
                this.maxAudioV = 0;
                this.mostChange = this._mChange.slice();
                
                if(isSpectrum) {
                    this.renderSpectrum();
                } else {
                    this.renderDiff();
                }
                
            }
        }

        renderDiff() {
            for (var i = 0; i < this.dArray.length; i ++) {
                this.dArray[i] += (Math.abs(this.dataArray[i * 4] - this._tempArray[i]) - this.dArray[i]) * 0.3;
                this.maxAudioV = Math.max(this.maxAudioV, this.dArray[i]);
                this._tempArray[i] = this.dataArray[i * 4]; 
            }
        }

        renderSpectrum() {
            for(var i = 0; i < this._levelsCount; i++) {
                var sum = 0;
                for(var j = 0; j < this._levelBins; j++) {
                    sum += this.dataArray[(i * this._levelBins) + j];
                }
                this.dArray[i] = sum / this._levelBins/256;
            }
        }
    }


    export class Prefix {

        constructor() {
            
        }

        static transformPrefix():string {
            return utils.Prefix.GetVendorPrefix(["transform", "msTransform", "MozTransform", "WebkitTransform", "OTransform"]);
        }

        static GetVendorPrefix(arrayOfPrefixes):string {

           var tmp = document.createElement("div");
           var result:string = "";

            for (var i = 0; i < arrayOfPrefixes.length; ++i) {
                if (typeof tmp.style[arrayOfPrefixes[i]] !== 'undefined') {
                    result = arrayOfPrefixes[i];
                    break;
                } else {
                    result = null;
                }
            }

           return result;
        }
    }

    export class GameKeyBoardControl {

        private _callbackKeyPressed:Function;
        private _callbackKeyUp:Function;

        private _keyHTML: HTMLElement;

        constructor(callbackKeyPressed:Function, callbackKeyUp:Function) {
            this._callbackKeyPressed = callbackKeyPressed;
            this._callbackKeyUp = callbackKeyUp;

            this._keyHTML = <HTMLElement>document.getElementById('keyboard-control');

            document.addEventListener('keydown', this.keydown);
            document.addEventListener('keyup', this.keyup);
        }

        keydown = (event:KeyboardEvent) => {
            var key: string = '';

            switch(event.keyCode) {
                case 87:
                case 38:
                    key = 'up';
                break;
                case 83:
                case 40:
                    key = 'down';
                break;
                case 65:
                case 37:
                    key = 'left';
                break;
                case 68:
                case 39:
                    key = 'right';
                break;
                case 13:
                    key = 'enter';
                break;
            }

            if(key !== '' && key !== 'enter') {
                (<HTMLElement>this._keyHTML.querySelector('.' + key)).classList.add('pushed');
            }
            
            this._callbackKeyPressed(key);
        }

        keyup = (event:KeyboardEvent) => {
            var key: string = '';

            switch(event.keyCode) {
                case 87:
                case 38:
                    key = 'up';
                break;
                case 83:
                case 40:
                    key = 'down';
                break;
                case 65:
                case 37:
                    key = 'left';
                break;
                case 68:
                case 39:
                    key = 'right';
                break;
                case 13:
                    key = 'enter';
                break;
            }

            if(key !== '' && key !== 'enter') {
                (<HTMLElement>this._keyHTML.querySelector('.' + key)).classList.remove('pushed');
            }

            this._callbackKeyUp(key);
        }
    }
}