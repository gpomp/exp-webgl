/// <reference path="../../../typings/threejs/three.d.ts" />
/// <reference path="../definitions/core/GLAnimation.d.ts" />
/// <reference path="../definitions/Site.d.ts" />
/// <reference path="../definitions/helper/ThreeAddOns.d.ts" />
/// <reference path="../definitions/core/EffectComposer.d.ts" />
/// <reference path="../definitions/core/Scene3D.d.ts" />
/// <reference path="addons.ts" />

declare var SHADERLIST;

  
 
  
module webglExp {
 
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
        
        private _bufferLength;
        private _analyser;
        private _audioContext;
        private _tempArray;

        private _audioCallback: Function;

        constructor(audioCallback:Function) {
            this._audioCallback = audioCallback;
            this.dArray = [];
            this._tempArray = [];
            this.maxAudioV = 0;
            for (var i = 0; i < 256; ++i) {
                this.dArray.push(i);
                this._tempArray.push(i);
            }


            this.isDrawing = false;

            this._canvas = document.createElement('canvas');
            this._context = this._canvas.getContext('2d');

            this._canvas.setAttribute("width", "512px");
            this._canvas.setAttribute("height", "512px");

            this._videoEl = <HTMLVideoElement>document.getElementById('video');

            this._pos = new THREE.Vector2((512 - 640) * 0.5, (512 - 360) * 0.5);



            this._videoEl.addEventListener('play', this.drawCanvas);
        }

        canplay = () => {
            // try {
            // Fix up for prefixing
            window['AudioContext'] = window['AudioContext']||window['webkitAudioContext'];
            this._audioContext = new AudioContext();
            this.getSound();
          /*}
          catch(e) {
            alert('Web Audio API is not supported in this browser');
          }*/
        }

        getSound() {
            var source = this._audioContext.createMediaElementSource(this._videoEl);

            this._analyser = this._audioContext.createAnalyser();
            this._analyser.fftSize = 2048; 
            this._bufferLength = this._analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this._bufferLength);
            this._analyser.getByteFrequencyData(this.dataArray);

            source.connect(this._analyser);
            this._analyser.connect(this._audioContext.destination);

            this._audioCallback();

            this.audioLoaded = true;

            this._videoEl.play();
        }

        drawCanvas = () => {
            this.isDrawing = true;
            this.canplay();
            
        }

        getCanvas():HTMLCanvasElement {
            return this._canvas;
        }

        render() {
            this._context.drawImage(this._videoEl, this._pos.x, this._pos.y, 640, 360);
            if(this.audioLoaded) {
                this._analyser.getByteFrequencyData(this.dataArray);
                this.maxAudioV = 0;
                for (var i = 0; i < this.dArray.length; i ++) {
                    this.dArray[i] += (Math.abs(this.dataArray[i * 4] - this._tempArray[i]) - this.dArray[i]) * 0.3;
                    this.maxAudioV = Math.max(this.maxAudioV, this.dArray[i]);
                    this._tempArray[i] = this.dataArray[i * 4]; 
                }
            }
        }
    }

    export class Swarm extends THREE.Line {

        public static NB_VERTS: number;

        private _time: number;
        private _dir: number;
        private _speed: number;

        private _uniforms;
        private _attributes;

        private v2c: webglExp.Video2Canvas;

        private _shaderMat: THREE.ShaderMaterial;


        constructor(geom:THREE.BufferGeometry, mat:THREE.ShaderMaterial, radius:number, dir:number, nbVertices:number) {
            super(geom, mat);
            Swarm.NB_VERTS = nbVertices;
            this._dir = dir;
            this._time = 0;
            this._speed = 0.0005 + Math.random() * 0.0005;

            this.v2c = new webglExp.Video2Canvas(this.audioLoaded);

            this._attributes = {
                timeD: {
                    type: 'v3',
                    value: null
                }
            };

            this._uniforms = {
                time: {
                    type: 'f',
                    value: 0.0
                },
                radius: {
                    type: 'f',
                    value: radius
                },
                swarmPos: {
                    type: 'v3',
                    value: new THREE.Vector3(0)
                },
                text:     { 
                    type: "t", 
                    value: new THREE.Texture(this.v2c.getCanvas())
                },
                maxAV: {
                    type: 'f',
                    value: this.v2c.maxAudioV
                },
                audioData: {
                    type: 'iv1',
                    value: this.v2c.dArray
                }
            };

            

            this._shaderMat = <THREE.ShaderMaterial>mat;
            this._shaderMat.uniforms = this._uniforms;
            this._shaderMat.attributes = this._attributes;
        }

        audioLoaded = () => {

        }

        changePos() {

        }

        render() {
            this._uniforms.time.value++;
            this._uniforms.maxAV.value = this.v2c.maxAudioV;
            // this.rotation.y += this._dir * Math.PI * this._speed;

            if(this.v2c.isDrawing) {
                this.v2c.render();
                this._uniforms.text.value.needsUpdate = true;
            }
            
        }
    }

	export class ParticleSwarm extends webglExp.GLAnimation {
        private _scene: THREE.Scene;
        private _camera: THREE.PerspectiveCamera;
        private _renderer: THREE.WebGLRenderer;
        private _gui;

        private _swarm: webglExp.Swarm;

        private _swarmList: webglExp.Swarm[];

        private mouseControl: THREE.Mouse2DControls;

        private _composerBloom:webglExp.EffectComposer;
        private _composer:webglExp.EffectComposer;
        private _blendComposer;

        private _bloomStrength: number;
        private _blurh: number;
        private _effectBloom: THREE.BloomPass;
        private _blendPass: THREE.ShaderPass;


		constructor(scene:THREE.Scene, camera:THREE.PerspectiveCamera, renderer:THREE.WebGLRenderer, href?:string) {
			super(scene, camera, renderer);
            super.setInternalRender(true);
            this._scene = scene;
            this._camera = camera;
            this._renderer = renderer;
            this._renderer.autoClear = true;

            this._gui = super.getGui().get_gui();

            var geom: THREE.BufferGeometry = new THREE.BufferGeometry();
            var w: number = 512;
            var h: number = 512; 
            var vw: number = 320;
            var vh: number = 320;
            var vW1: number = vw + 1;
            var vH1: number = vh + 1;
            var hw: number = w / 2;
            var hh: number = h / 2;
            var xs: number = -hw;
            var ys: number = -hh;
            var wSeg: number = w / vW1;
            var hSeg: number = h / vH1;

            var dir: number = 1;

            var vertices = new Float32Array( vW1 * vH1 * 3 );
            var uvs = new Float32Array( vW1 * vH1 * 2 );


            var offset = 0;
            var offset2 = 0;

            for (var y = 0; y < vH1; ++y) {
                var ypos: number = ys + y * hSeg;
                for (var x = 0; x < vH1; ++x) {
                    var stx = dir === 1 ? xs : xs + w;
                    var xpos: number = stx + dir * x * wSeg;

                    vertices[ offset   ] = xpos;
                    vertices[offset + 1] = ypos;

                    uvs[ offset2     ] = (xpos + hw) / w;
                    uvs[ offset2 + 1 ] = 1 - ( (ypos + hh) / h );


                    offset += 3;
                    offset2 += 2;
                }

                dir *= -1;
            }

            var stepAngle: number = (Math.PI * 2) / vertices.length;
            var angle: number = 0;
            offset = 0;

            var timeD = new Float32Array( vertices.length * 3 );
            var delay = new Float32Array( vertices.length * 1 );

            for (var i = 0; i < vertices.length; ++i) {

                timeD[ offset + 0 ] =  Math.random();
                timeD[ offset + 1 ] =  Math.random();
                timeD[ offset + 2 ] =  angle;
                
                angle += stepAngle;

                offset += 3;
            }

            geom.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
            geom.addAttribute( 'timeD', new THREE.BufferAttribute( timeD, 3 ) );
            geom.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

            

           /* for (var i = 0; i < 100000; ++i) {
                geom.vertices.push(new THREE.Vector3(0, 0, 0));
            }*/

            this._swarmList = [];
            var startRad: number = 400;
            var dir = 1; 
            for (var i = 0; i < 1; ++i) {
                
                var pcMat: THREE.ShaderMaterial = new THREE.ShaderMaterial({
                    vertexShader: SHADERLIST.pointcloud.vertex,
                    fragmentShader: SHADERLIST.pointcloud.fragment,
                    side: THREE.DoubleSide,
                    transparent:true,
                    blending: THREE.AdditiveBlending 
                }); 

                var swarm:webglExp.Swarm = new webglExp.Swarm(geom, pcMat, startRad, dir, vertices.length);
                this._scene.add(swarm);
                this._swarmList.push(swarm);
                startRad -= 50;
                dir *= -1;
            }

            this.mouseControl = new THREE.Mouse2DControls(this._swarmList[0]);
            this.mouseControl.toggleEnable(true);

            this.setComposers();
            this.setComposerPasses();

            this._camera.position.z = 500;
            this._camera.lookAt(new THREE.Vector3(0));
            
		}

        setComposers() {
            this._composerBloom = new webglExp.EffectComposer(this._renderer, this._scene, this._camera, Scene3D.WIDTH, Scene3D.HEIGHT);
            this._composer = new webglExp.EffectComposer(this._renderer, this._scene, this._camera, Scene3D.WIDTH, Scene3D.HEIGHT);
            
            var renderTargetParams = {    minFilter: THREE.LinearFilter,
                                        magFilter: THREE.LinearFilter, 
                                        format: THREE.RGBAFormat,
                                        stencilBuffer: true };

            var rt:THREE.WebGLRenderTarget = new THREE.WebGLRenderTarget(Scene3D.WIDTH, Scene3D.HEIGHT, renderTargetParams);

            this._blendComposer = new THREE.EffectComposer(this._renderer, rt);
        }

        setComposerPasses() {
            var renderPass = new THREE.RenderPass(this._scene, this._camera);

           
            this._bloomStrength = 7;
            this._effectBloom = new THREE.BloomPass(this._bloomStrength, 20, 8.0, 512, true);
            this._blurh = 2;

            var composerFolder = this._gui.addFolder('Composer');

            var vbGUI = composerFolder.add(this, "_blurh", 0.00, 30.00);
            vbGUI.onChange(function(value) {
                THREE.BloomPass.blurX = new THREE.Vector2( value / (Scene3D.WIDTH * 2), 0.0 );
                THREE.BloomPass.blurY = new THREE.Vector2( 0.0, value / (Scene3D.HEIGHT * 2) );
            }.bind(this));

            var opGUI = composerFolder.add(this._effectBloom.copyUniforms.opacity, "value", 0.00, 100.00);

            THREE.BloomPass.blurX = new THREE.Vector2( this._blurh / (Scene3D.WIDTH * 2), 0.0 );
            THREE.BloomPass.blurY = new THREE.Vector2( 0.0, this._blurh / (Scene3D.HEIGHT * 2) );

            this._composerBloom.addPass(renderPass);
            this._composerBloom.addPass(this._effectBloom);
            
            var renderPass2 = new THREE.RenderPass(this._scene, this._camera);
            
            this._composer.addPass(renderPass2);


            this._blendPass = new THREE.ShaderPass( <any>THREE.BlendShader );
            this._blendPass.uniforms["tDiffuse1"].value = this._composerBloom.getComposer().renderTarget2;
            this._blendPass.uniforms["tDiffuse2"].value = this._composerBloom.getComposer().renderTarget2;
            this._blendPass.uniforms["tDiffuse3"].value = this._composer.getComposer().renderTarget2;
            this._blendPass.renderToScreen = true;

            this._blendComposer.addPass(this._blendPass);
        }


		render() {

            for (var i = 0; i < this._swarmList.length; ++i) {
                this._swarmList[i].render();
            }

            this.mouseControl.render();

            this._composerBloom.getComposer().render();
            this._composer.getComposer().render();
            this._blendComposer.render();

			super.render();
		}

        resize() {
            super.resize();
        }
	}
}

var siteReady = function(scene3d:webglExp.Scene3D) {
	var anim = new webglExp.ParticleSwarm(scene3d.getScene(), scene3d.getCamera(), scene3d.getRenderer());
	scene3d.setAnim(anim);
}

document.addEventListener("DOMContentLoaded", function(event) { 
  var s = new webglExp.Site(siteReady);
});