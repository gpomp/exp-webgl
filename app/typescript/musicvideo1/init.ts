/// <reference path="../../../typings/threejs/three.d.ts" />
/// <reference path="../definitions/core/GLAnimation.d.ts" />
/// <reference path="../../../typings/greensock/greensock.d.ts" />
/// <reference path="../definitions/Site.d.ts" />
/// <reference path="../definitions/helper/ThreeAddOns.d.ts" />
/// <reference path="../definitions/helper/Utils.d.ts" />
/// <reference path="../definitions/core/EffectComposer.d.ts" />
/// <reference path="../definitions/core/Scene3D.d.ts" />
/// <reference path="addons.ts" />

declare var SHADERLIST;

  
 
  
module webglExp {
 
    

    export class Swarm extends THREE.Line {

        private _time: number;
        private _dir: number;
        private _speed: number;

        private _uniforms;
        private _attributes;

        private _isPaused: boolean;

        private v2c: utils.Video2Canvas;

        public shaderMat: THREE.ShaderMaterial;


        constructor(geom:THREE.BufferGeometry, mat:THREE.ShaderMaterial, radius:number, dir:number) {
            super(geom, mat);
            this._dir = dir;
            this._time = 0;
            this._speed = 0.0005 + Math.random() * 0.0005;

            this._isPaused = false;

            this.v2c = new utils.Video2Canvas(this.audioLoaded);

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
                enableRing: {
                    type: 'f',
                    value: 1
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
                lineAlpha: {
                    type: 'f',
                    value: 1
                },
                audioData: {
                    type: 'iv1',
                    value: this.v2c.dArray
                }
            };

            

            this.shaderMat = <THREE.ShaderMaterial>mat;
            this.shaderMat.uniforms = this._uniforms;
            this.shaderMat.attributes = this._attributes;
        }

        restartVideo() {
            var video:HTMLVideoElement = this.v2c.getVideo();
            video.pause();
            video.currentTime = 0;
            video.load();
        }

        pausePlayVideo() {
            var video:HTMLVideoElement = this.v2c.getVideo();
            if(!this._isPaused) {
                video.pause();
            } else {
                video.play(); 
            }
            
            this._isPaused = !this._isPaused;    
        }

        audioLoaded = () => {

        }

        changePos() {

        }

        render() {
            this._uniforms.time.value++;
            this._uniforms.maxAV.value = this.v2c.maxAudioV;

            if(this.v2c.isDrawing) {
                this.v2c.render();
                this._uniforms.text.value.needsUpdate = true;
            }
            
        }
    }

	export class MusicVideo1 extends webglExp.GLAnimation {
        private _scene: THREE.Scene;
        private _camera: THREE.PerspectiveCamera;
        private _renderer: THREE.WebGLRenderer;
        private _gui;
        private _fpc;

        private _lookAtCenter:boolean;

        private _camPosList;
        private _inTransition: boolean;
        private _transCamPos: THREE.Vector3;
        private _transCamRot: THREE.Euler;
        private _transCamUp: THREE.Vector3;

        private _tipHide: number;
        private _animTime: number;
        private _animEase;
        private _animEaseLabel:string;

        private _lineAlpha;

        private _verticesX: number;
        private _verticesY: number;

        private _enableRing: boolean;


        private _swarm: webglExp.Swarm;

        private _swarmList: webglExp.Swarm[];

        private _composerBloom:webglExp.EffectComposer;
        private _composer:webglExp.EffectComposer;
        private _blendComposer;

        private _blendPass: THREE.ShaderPass;


		constructor(scene:THREE.Scene, camera:THREE.PerspectiveCamera, renderer:THREE.WebGLRenderer, href?:string) {
			super(scene, camera, renderer);
            this._scene = scene;
            this._camera = camera;
            this._renderer = renderer;
            this._renderer.autoClear = true;

            this._tipHide = -1;

            this._lineAlpha = 1;

            this._enableRing = true;

            this._gui = super.getGui().get_gui();

            this._verticesX = 320;
            this._verticesY = 520;

            var geom: THREE.BufferGeometry = this.createLineGeometry(this._verticesX, this._verticesY);

            this._swarmList = [];
            var startRad: number = 400;
            var dir = 1; 
            for (var i = 0; i < 1; ++i) {
                
                var pcMat: THREE.ShaderMaterial = new THREE.ShaderMaterial({
                    vertexShader: SHADERLIST.pointcloud.vertex,
                    fragmentShader: SHADERLIST.pointcloud.fragment,
                    transparent:true,
                    blending: THREE.AdditiveBlending,
                    depthWrite : false,
                    depthTest : false,
                    linewidth: 1

                }); 
 
                var swarm:webglExp.Swarm = new webglExp.Swarm(geom, pcMat, startRad, dir);
                this._scene.add(swarm);
                this._swarmList.push(swarm);
                startRad -= 50;
                dir *= -1;
            }

            this._fpc = new THREE["FlyControls"](this._camera, document.getElementById("three-canvas"));

            this._camPosList = [];

            this._lookAtCenter = false;

            this._animTime = 3;
            this._animEase = Expo.easeInOut;
            this._animEaseLabel = "expoInOut";

            this._gui.add(this, "restartVideo");
            this._gui.add(this, "pausePlayVideo");

            var cameraFolder = this._gui.addFolder('Camera settings');
            cameraFolder.add(this, "_lookAtCenter").name('look At Center');
            cameraFolder.add(this, "_animTime", 0.0, 20.0).name("anim time");
            cameraFolder.add(this, "_animEaseLabel").options( 'noEase', 'sineIn', 'sineOut', 'sineInOut', 'expoIn', 'expoOut', 'expoInOut', 'power2In', 'power2Out', 'power2InOut' ).onChange(() => {
                switch (this._animEaseLabel) {
                    case "noEase":
                        this._animEase = Linear.easeNone;
                        break;
                    case "sineIn":
                        this._animEase = Sine.easeIn;
                        break;
                    case "sineOut":
                        this._animEase = Sine.easeOut;
                        break;
                    case "sineInOut":
                        this._animEase = Sine.easeInOut;
                        break;
                    case "expoIn":
                        this._animEase = Expo.easeIn;
                        break;
                    case "expoOut":
                        this._animEase = Expo.easeOut;
                        break;
                    case "expoInOut":
                        this._animEase = Expo.easeInOut;
                        break;
                    case "power2In":
                        this._animEase = Power2.easeIn;
                        break;
                    case "power2Out":
                        this._animEase = Power2.easeOut;
                        break;
                    case "power2InOut":
                        this._animEase = Power2.easeInOut;
                        break;
                }
             });

            cameraFolder.add(this, "saveCamPos").name('Save Position');

            cameraFolder.open();

            var lineFolder = this._gui.addFolder('Line');
            lineFolder.add(this, "_lineAlpha", 0, 1).name('alpha').step(0.01).onChange(() => {
                for (var i = 0; i < this._swarmList.length; ++i) {
                    this._swarmList[i].shaderMat.uniforms.lineAlpha.value = this._lineAlpha;
                }
            });

            lineFolder.add(this, "_verticesX", 10, 900).name("Horizontal points").onChange(this.changeGeomNumber);
            lineFolder.add(this, "_verticesY", 10, 900).name("Vertical points").onChange(this.changeGeomNumber);
            lineFolder.add(this, "_enableRing").name("show ring").onChange(() => {
                console.log(this._enableRing);
                for (var i = 0; i < this._swarmList.length; ++i) {
                    this._swarmList[i].shaderMat.uniforms.enableRing.value = this._enableRing ? 1 : 0;
                }
            });

            lineFolder.open();

            this.setComposers();
            this.setComposerPasses();

            this._camera.position.z = 500;
            this._camera.lookAt(new THREE.Vector3(0));


            document.addEventListener("keyup", this.keyup);
            
		}

        changeGeomNumber = () => {
            var geom = this.createLineGeometry(this._verticesX, this._verticesY);
            for (var i = 0; i < this._swarmList.length; ++i) {
                this._swarmList[i].geometry = geom;
            }
        }

        createLineGeometry(vw: number, vh: number):THREE.BufferGeometry {
            var geom: THREE.BufferGeometry = new THREE.BufferGeometry();
            var w: number = 512;
            var h: number = 512; 
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
                for (var x = 0; x < vW1; ++x) {
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

            return geom;
        }

        keyup = (event:KeyboardEvent) => {
            var key = parseInt(String.fromCharCode(event.which));
            if(!isNaN(key) && key < this._camPosList.length) {

                this._transCamPos = this._camera.position.clone();
                this._transCamRot = this._camera.rotation.clone();
                this._transCamUp = this._camera.up.clone();

                var np = this._camPosList[key];
                TweenMax.killAll();
                TweenMax.to(this._transCamPos, this._animTime, { x: np.pos.x, y: np.pos.y, z: np.pos.z, overwrite: "all", ease: this._animEase, onComplete: () => {
                    this._inTransition = false;
                } });
                
                TweenMax.to(this._transCamRot, this._animTime, { x: np.rot.x, y: np.rot.y, z: np.rot.z, overwrite: "all", ease: this._animEase});
                TweenMax.to(this._transCamUp, this._animTime, { x: np.up.x, y: np.up.y, z: np.up.z, overwrite: "all", ease: this._animEase});
                
                this._inTransition = true;
            } else {
                switch (event.which) {
                    case 80:
                        this.saveCamPos();
                    break;
                    case 86:
                        this.pausePlayVideo();
                    break;
                }
            }
        }

        saveCamPos() {
            var count = 0;

            if(this._camPosList.length < 10) {
                this._camPosList.push({
                    pos: this._camera.position.clone(),
                    rot: this._camera.rotation.clone(),
                    up: this._camera.up.clone()
                });
                count = this._camPosList.length - 1;
                } else {

                }
            
            (<HTMLElement>document.querySelector('body .tips')).innerHTML = "Camera Position saved, can be retrieve with \'" + count + "\' key";
            (<HTMLElement>document.querySelector('body .tips')).classList.add("show");
            clearTimeout(this._tipHide);
            this._tipHide = window.setTimeout(function() { (<HTMLElement>document.querySelector('body .tips')).classList.remove("show"); }, 2000);
        }

        pausePlayVideo() {
            for (var i = 0; i < this._swarmList.length; ++i) {
                this._swarmList[i].pausePlayVideo();
            }
        }

        restartVideo() {
            for (var i = 0; i < this._swarmList.length; ++i) {
                this._swarmList[i].restartVideo();
            }
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

            var glowPass = new THREE.ShaderPass( <any>THREE.GlowShader );
            glowPass.uniforms['quality'].value = 2.5;
            glowPass.uniforms['glowPower'].value = 1.5;
            glowPass.uniforms['size'].value = new THREE.Vector2(Scene3D.WIDTH, Scene3D.HEIGHT);

            /*var compFolder = this._gui.addFolder('composer');
            compFolder.add(glowPass.uniforms['quality'], 'value', 0, 6).name('glow quality').step(0.05);
            compFolder.add(glowPass.uniforms['glowPower'], 'value', 0, 10).name('glow power');*/

            var copyPass = new THREE.ShaderPass( <any>THREE.CopyShader );

            this._composerBloom.addPass(renderPass);
            this._composerBloom.addPass(glowPass);
            this._composerBloom.addPass(copyPass);
            
            var renderPass2 = new THREE.RenderPass(this._scene, this._camera);
            
            this._composer.addPass(renderPass2);

            this._blendPass = new THREE.ShaderPass( <any>THREE.Blend2Shader );
            this._blendPass.uniforms["tDiffuse1"].value = this._composerBloom.getComposer().renderTarget2;
            this._blendPass.uniforms["tDiffuse2"].value = this._composer.getComposer().renderTarget2;
            this._blendPass.renderToScreen = true;

            this._blendComposer.addPass(this._blendPass);
        }


		render() {

            for (var i = 0; i < this._swarmList.length; ++i) {
                this._swarmList[i].render();
            }

            // this.mouseControl.render();

            // this._composerBloom.getComposer().render();
            // this._composer.getComposer().render();
            // this._blendComposer.render();

            

            if(this._lookAtCenter) this._camera.lookAt(new THREE.Vector3(0));

            if(this._inTransition) {
                this._camera.position.set( this._transCamPos.x, this._transCamPos.y, this._transCamPos.z );
                this._camera.rotation.set( this._transCamRot.x, this._transCamRot.y, this._transCamRot.z );
                this._camera.up.set( this._transCamUp.x, this._transCamUp.y, this._transCamUp.z );
                this._camera.updateProjectionMatrix();
            } else {
                this._fpc.update(1.0);
            }

			super.render();
		}

        resize() {
            this._composerBloom.getComposer().setSize(Scene3D.WIDTH, Scene3D.HEIGHT);
            this._composer.getComposer().setSize(Scene3D.WIDTH, Scene3D.HEIGHT);
            this._blendComposer.setSize(Scene3D.WIDTH, Scene3D.HEIGHT);

            this._blendPass.uniforms["tDiffuse1"].value = this._composerBloom.getComposer().renderTarget2;
            this._blendPass.uniforms["tDiffuse2"].value = this._composer.getComposer().renderTarget2;
            super.resize();
        }
	}
}

var siteReady = function(scene3d:webglExp.Scene3D) {
	var anim = new webglExp.MusicVideo1(scene3d.getScene(), scene3d.getCamera(), scene3d.getRenderer());
	scene3d.setAnim(anim);
}

document.addEventListener("DOMContentLoaded", function(event) { 
  var s = new webglExp.Site(siteReady);
});
