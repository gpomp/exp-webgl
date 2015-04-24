/// <reference path="../../../typings/threejs/three.d.ts" />
/// <reference path="../../../typings/greensock/greensock.d.ts" />
/// <reference path="../definitions/core/GLAnimation.d.ts" />
/// <reference path="../definitions/Site.d.ts" />
/// <reference path="addons.ts" />

declare var SHADERLIST;

module webglExp {

    export class BallRing {

        private _plane: THREE.Mesh;

        private _uniforms;
        private _attributes;

        private rayCanvas: HTMLCanvasElement;
        private rayCtx: CanvasRenderingContext2D;

        private rayList: THREE.Vector4[];
        private _angleChange: number;

        private _radius: number;



        constructor(radius:number) {
            this._radius = radius;
            this.setCanvas();

            this.setRays();

            this._uniforms = {
                time: {
                    type: 'f',
                    value: 0
                },
                sunRays: {
                    type: "t",
                    value: new THREE.Texture(this.rayCanvas)
                },
            }

            this._attributes = {
                
            }

            var pGeom: THREE.PlaneBufferGeometry = new THREE.PlaneBufferGeometry(1024, 1024);
            var ringMat: THREE.ShaderMaterial = new THREE.ShaderMaterial({
                vertexShader: SHADERLIST.ring.vertex,
                fragmentShader: SHADERLIST.ring.fragment,
                side: THREE.DoubleSide,
                uniforms: this._uniforms,
                attributes: this._attributes
            });

            this._plane = new THREE.Mesh(pGeom, ringMat);
        }

        setCanvas() {
            this.rayCanvas = document.createElement('canvas');
            this.rayCanvas.setAttribute("width", "1024px");
            this.rayCanvas.setAttribute("height", "1024px");
            this.rayCtx = this.rayCanvas.getContext('2d');
            /*this.rayCanvas.classList.add("canvas");
            (<HTMLElement>document.querySelector("body")).appendChild(this.rayCanvas);*/
        }

        setRays() {
            this.rayList = [];

            for (var i = 0; i < 200; ++i) {
                this.rayList.push(new THREE.Vector4(
                    1 + Math.random() * 12,
                    this._radius + 50 + Math.random() * 200,
                    -1 + Math.random() * 2,
                    Math.random() * 50
                ));
            }

            this._angleChange = (Math.PI * 2) / this.rayList.length;
        }

        getPlane():THREE.Mesh {
            return this._plane;
        }

        render() {
            this._uniforms.time.value += 0.05;

            this.rayCtx.clearRect(0, 0, this.rayCanvas.width, this.rayCanvas.height);
            

            var hw: number = this.rayCanvas.width * 0.5;
            var hh: number = this.rayCanvas.height * 0.5;

            var p1: THREE.Vector2 = new THREE.Vector2();
            var p2: THREE.Vector2 = new THREE.Vector2();
            var p3: THREE.Vector2 = new THREE.Vector2();


            for (var i = 0; i < this.rayList.length; ++i) {
                var r: THREE.Vector4 = this.rayList[i];
                this.rayCtx.beginPath();

                var cTime = (Math.cos(this._uniforms.time.value * 0.1 + r.w) + 1) * 0.5;

                var rayWidth: number = cTime * r.x;

                var xa: number = i * this._angleChange + r.z * this._uniforms.time.value * 0.03;
                var aperp: number = xa + Math.PI / 4;

                var x: number = Math.cos(xa);
                var y: number = Math.sin(xa);

                p1.set(    hw + x * this._radius - rayWidth * Math.cos(aperp), 
                           hh + y * this._radius - rayWidth * Math.sin(aperp) );

                p2.set(    hw + x * this._radius + rayWidth * Math.cos(aperp), 
                           hh + y * this._radius + rayWidth * Math.sin(aperp) );

                p3.set(    hw + x * r.y, 
                           hh + y * r.y );

                this.rayCtx.moveTo(p1.x, p1.y);
                this.rayCtx.lineTo(p2.x, p2.y);
                this.rayCtx.lineTo(p3.x, p3.y);
                this.rayCtx.lineTo(p1.x, p1.y);
                this.rayCtx.closePath();

                this.rayCtx.lineWidth = r.x;
                this.rayCtx.fillStyle = "rgba(255, 255, 255, " + (cTime * 0.1) + ")";
                this.rayCtx.fill();
            }

            var rad: number = this._radius;
            var alpha: number = 1;

            var lineWidth = 10;

            for (var i = 0; i < 6; ++i) {
                var invI: number = 1 - i / 6;
                this.rayCtx.lineWidth = lineWidth * invI;
                this.rayCtx.beginPath();

                this.rayCtx.arc(hw, hh, rad + invI * lineWidth, 0, 2 * Math.PI, false);
                this.rayCtx.closePath();
                this.rayCtx.strokeStyle = "rgba(255, 255, 255, " + (alpha * invI) + ")";
                this.rayCtx.stroke();
            }

            this._uniforms.sunRays.value.needsUpdate = true;
        }
    }

    export class ParticleBurst {

        static NB_PARTICLES: number = 1000;

        private _radius: number;

        private _vertexPos: number[][];

        private _uniforms;
        private _attributes;

        private _pCloud: THREE.Line;

        private _gui;

        private _baseColor: number[];

        constructor(radius:number, gui) {
            this._radius = radius;
            this._gui = gui;

            this.getColors();

            this._uniforms = {
                time: {
                    type: 'f',
                    value: 0
                },
                radius: {
                    type: 'f',
                    value: radius
                },
                addRadius: {
                    type: 'f',
                    value: 0.0
                },
                total: {
                    type: 'f',
                    value: ParticleBurst.NB_PARTICLES
                },
                scroll: {
                    type: 'v2',
                    value: new THREE.Vector2(0)
                },
                aPos: {
                    type: 'f',
                    value: 0.0
                },
                cAngle: {
                    type: 'f',
                    value: 0.0
                },
                alpha: {
                    type: 'f',
                    value: 0.0
                },
                startPos: {
                    type: 'v2',
                    value: new THREE.Vector2(0)
                },
                baseColor: {
                    type: 'v3',
                    value: new THREE.Vector3(this._baseColor[0] / 255, this._baseColor[1] / 255, this._baseColor[2] / 255)
                }
            };
            /*var burstFolder = this._gui.addFolder('Bursts');
            var bCol = burstFolder.addColor(this, '_baseColor');
            bCol.onChange(function(value) {
                this._uniforms.baseColor.value.x = value[0] / 255;
                this._uniforms.baseColor.value.y = value[1] / 255;
                this._uniforms.baseColor.value.z = value[2] / 255;
            }.bind(this));*/

            this._attributes = {
                a: {
                    type: 'v2',
                    value: null
                },
                id: {
                    type: 'f',
                    value: null
                },
                departed: {
                    type: 'f',
                    value: null
                }
            };

            var geometry: THREE.BufferGeometry = new THREE.BufferGeometry();
            this._vertexPos = [];

            for (var i = 0; i < ParticleBurst.NB_PARTICLES; ++i) {
                this._vertexPos.push([0, 0, 0]);
            }

            var vertices = new Float32Array( this._vertexPos.length * 3 );
            var angles = new Float32Array( this._vertexPos.length * 2 );
            var ids = new Float32Array( this._vertexPos.length );
            var departed = new Float32Array( this._vertexPos.length );

            var aplus: number = (Math.PI * 2) / this._vertexPos.length;
            var a: number = Math.random() * (Math.PI * 2);

            for ( var i = 0; i < this._vertexPos.length; i++ )
            {
                vertices[ i*3 + 0 ] = this._vertexPos[i][0];
                vertices[ i*3 + 1 ] = this._vertexPos[i][1];
                vertices[ i*3 + 2 ] = this._vertexPos[i][2];

                angles[i * 2 + 0] = 0.0;
                angles[i * 2 + 1] = a;

                a += aplus;

                ids[i] = i;
                departed[i] = Math.random() * 50.0;
            }

            geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
            geometry.addAttribute( 'a', new THREE.BufferAttribute( angles, 2 ) );
            geometry.addAttribute( 'id', new THREE.BufferAttribute( ids, 1 ) );
            geometry.addAttribute( 'departed', new THREE.BufferAttribute( departed, 1 ) );

            var burstMat: THREE.ShaderMaterial = new THREE.ShaderMaterial({
                vertexShader: SHADERLIST.burst.vertex,
                fragmentShader: SHADERLIST.burst.fragment,
                side: THREE.DoubleSide,
                uniforms: this._uniforms,
                attributes: this._attributes,
                transparent: true,
                blending: THREE.AdditiveBlending
            });

            this._pCloud = new THREE.Line(geometry, burstMat);
        }

        start(delay:number) {
            window.setTimeout(function() { this.launch(); }.bind(this), delay);
        }

        setColor() {
            this.getColors();

            this._uniforms.baseColor.value.set(this._baseColor[0] / 255, this._baseColor[1] / 255, this._baseColor[2] / 255);
        }

        getColors() {
            var r = 230 + Math.random() * 10;
            var g = 115 + Math.random() * 10;
            var b = 26  + Math.random() * 10;
            this._baseColor = [r, g, b];
        }

        getPointCloud():THREE.PointCloud {
            return this._pCloud;
        }

        launch = () => {
            this._uniforms.time.value = 0;
            var a:number = Math.random() * (Math.PI * 2);
            this._uniforms.aPos.value = a;

            var lat: number = -1 + 2 * Math.random();
            var lng: number = (Math.PI * 2) * Math.random();

            this.setColor();

            this._uniforms.startPos.value.set(lat, lng);    
            this._uniforms.addRadius.value = Math.random() * 0.1;    
            
            var d: number = Math.random() * 20;
            var t: number = 20 + Math.random() * 10;

            TweenLite.to(this._uniforms.time, t, { value: 1.0, delay: d });

            TweenLite.to(this._uniforms.alpha, 6, { value: 1.0, delay: d });
            var endAlpha: number = d + t - 6;
            TweenLite.to(this._uniforms.alpha, 6, { value: 0.0, delay: endAlpha, onComplete: this.launch });
        }

        render(time:number) {
            this._uniforms.scroll.value.y = time;
        }

        calcPos(lat:number, lng:number) {
            this._uniforms.startPos.value.set(
                this._radius * Math.cos(lat) * Math.sin(lng),
                this._radius * Math.sin(lat) * Math.sin(lng),
                this._radius * Math.cos(lng)
            );
        }
    }

	export class FireBall extends webglExp.GLAnimation {
        static RADIUS: number = 250;

        private _scene: THREE.Scene;
        private _BloomScene: THREE.Scene;
        private _camera: THREE.PerspectiveCamera;
        private _renderer: THREE.WebGLRenderer;
        private _gui;

        private _sphere: THREE.Mesh;

        private _uniforms;

        private _quality: number;

        private _burstList: webglExp.ParticleBurst[];
        private _sunRing: webglExp.BallRing;

        private _composerBloom:webglExp.EffectComposer;
        private _composer:webglExp.EffectComposer;
        private _blendComposer;

        private _bloomStrength: number;
        private _blurh: number;
        private _effectBloom: THREE.BloomPass;
        private _blendPass: THREE.ShaderPass;

        private _baseColor: number[];
        private _middleColor: number[];
        private _topColor: number[];


		constructor(scene:THREE.Scene, camera:THREE.PerspectiveCamera, renderer:THREE.WebGLRenderer, href?:string) {
			super(scene, camera, renderer);
            super.setInternalRender(true);
            this._scene = scene;
            this._camera = camera;
            this._renderer = renderer;
            this._renderer.autoClear = true;

            this._gui = super.getGui().get_gui();

            this._baseColor = [162, 31, 17];
            this._middleColor = [255, 255, 255];
            this._topColor = [40, 25, 13];

            var bumpTexture: THREE.Texture = THREE.ImageUtils.loadTexture('../img/sun/bump.jpg');
            bumpTexture.wrapS = THREE.RepeatWrapping;
            bumpTexture.wrapT = THREE.RepeatWrapping;

            var crackTexture: THREE.Texture = THREE.ImageUtils.loadTexture('../img/sun/crack.jpg');
            crackTexture.wrapS = THREE.RepeatWrapping;
            crackTexture.wrapT = THREE.RepeatWrapping;

            var perimeter = 2 * Math.PI * FireBall.RADIUS;

            this._uniforms = {
                time: {
                    type: 'f',
                    value: Math.random() * 10000
                },
                speedNoise: {
                    type: 'f',
                    value: 0.3
                },
                baseColor: {
                    type: 'v3',
                    value: new THREE.Vector3(this._baseColor[0] / 255, this._baseColor[1] / 255, this._baseColor[2] / 255)
                },
                topColor: {
                    type: 'v3',
                    value: new THREE.Vector3(this._topColor[0] / 255, this._topColor[1] / 255, this._topColor[2] / 255)
                },
                middleColor: {
                    type: 'v3',
                    value: new THREE.Vector3(this._middleColor[0] / 255, this._middleColor[1] / 255, this._middleColor[2] / 255)
                },
                bump: {
                    type: 't',
                    value: bumpTexture
                },
                crack: {
                    type: 't',
                    value: crackTexture
                },
                textSize: {
                    type: 'v2',
                    value: new THREE.Vector2(perimeter / 256, (perimeter * 0.5) / 256)
                },
                radius: {
                    type: 'f',
                    value: FireBall.RADIUS
                }
            }

            var sphereFolder = this._gui.addFolder("sphere");
            sphereFolder.add(this._uniforms.speedNoise, 'value', 0.1, 3.0).name('speedNoise').step(0.05);

            var colFolder = this._gui.addFolder("sphere color");
            var bCol = colFolder.addColor(this, '_baseColor');
            var mCol = colFolder.addColor(this, '_middleColor');
            var tCol = colFolder.addColor(this, '_topColor');
            bCol.onChange(function(value) {
                this._uniforms.baseColor.value.x = value[0] / 255;
                this._uniforms.baseColor.value.y = value[1] / 255;
                this._uniforms.baseColor.value.z = value[2] / 255;
            }.bind(this));
            mCol.onChange(function(value) {
                this._uniforms.middleColor.value.x = value[0] / 255;
                this._uniforms.middleColor.value.y = value[1] / 255;
                this._uniforms.middleColor.value.z = value[2] / 255;
            }.bind(this));
            tCol.onChange(function(value) {
                this._uniforms.topColor.value.x = value[0] / 255;
                this._uniforms.topColor.value.y = value[1] / 255;
                this._uniforms.topColor.value.z = value[2] / 255;
            }.bind(this));


            var planeMat: THREE.ShaderMaterial = new THREE.ShaderMaterial({
                vertexShader:   SHADERLIST.sphere.vertex,
                fragmentShader: SHADERLIST.sphere.fragment,
                side:THREE.DoubleSide,
                uniforms: this._uniforms
            })
            this._BloomScene = new THREE.Scene();
            var sphereGeom: THREE.SphereGeometry = new THREE.SphereGeometry(FireBall.RADIUS, 20, 20);
            this._sphere = new THREE.Mesh(sphereGeom, planeMat);
            this._BloomScene.add(this._sphere);
            camera.lookAt(this._sphere.position);


            this._burstList = [];

           /* for (var i = 0; i < 10; ++i) {
                var pb: webglExp.ParticleBurst = new webglExp.ParticleBurst(Sun.RADIUS, this._gui);
                this._scene.add(pb.getPointCloud());
                this._burstList.push(pb);
                pb.start((Math.floor((i / 10) * 2) + Math.random() * 2) * 1000);
            }*/

            this._sunRing = new webglExp.BallRing(FireBall.RADIUS);
            this._scene.add(this._sunRing.getPlane());

            this.setComposers();
            this.setComposerPasses();
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

        private _glowPass;
        private _glowColor: number[];

        setComposerPasses() {
            var composerFolder = this._gui.addFolder('Composer');

            var renderPass = new THREE.RenderPass(this._BloomScene, this._camera, null, new THREE.Color(0, 0, 0), 0.0);
            
            this._glowPass = new THREE.ShaderPass( <any>THREE.GlowShader );
            this._glowPass.uniforms['quality'].value = 3.5;
            this._glowPass.uniforms['glowPower'].value = 1.1;
            this._glowPass.uniforms['size'].value = new THREE.Vector2(Scene3D.WIDTH, Scene3D.HEIGHT);
            this._glowColor = [255, 106, 24];
            this._glowPass.uniforms['glowColor'].value.set(this._glowColor[0] / 255, this._glowColor[1] / 255, this._glowColor[2] / 255, 1.0);

            var gCol = composerFolder.addColor(this, '_glowColor');
            gCol.onChange(function(value) {
                this._glowPass.uniforms['glowColor'].value.x = value[0] / 255;
                this._glowPass.uniforms['glowColor'].value.y = value[1] / 255;
                this._glowPass.uniforms['glowColor'].value.z = value[2] / 255;
            }.bind(this));

            
            composerFolder.add(this._glowPass.uniforms['quality'], 'value', 0, 6).name('glow quality').step(0.05);
            composerFolder.add(this._glowPass.uniforms['glowPower'], 'value', 0, 10).name('glow power');

            var copyPass = new THREE.ShaderPass(<any>THREE.CopyShader);
            copyPass.renderToScreen = true;
   
            this._composerBloom.addPass(renderPass);
            
            var renderPass2 = new THREE.RenderPass(this._scene, this._camera, null, new THREE.Color(0, 0, 0), 0.0);
            
            
            this._composer.addPass(renderPass2);

            this._blendPass = new THREE.ShaderPass( <any>THREE.CopyBloomShader );
            this._blendPass.uniforms["tDiffuse1"].value = this._composer.getComposer().renderTarget2;
            this._blendPass.uniforms["tDiffuse2"].value = this._composerBloom.getComposer().renderTarget2;
            

            this._blendComposer.addPass(this._blendPass);
            this._blendComposer.addPass(this._glowPass);
            this._blendComposer.addPass(copyPass);
        }


		render() {
            this._uniforms.time.value += 0.01;

            for (var i = 0; i < this._burstList.length; ++i) {
                this._burstList[i].render(this._uniforms.time.value);
            }

            

            this._sunRing.render();
            // this._composer.getComposer().render();

            this._blendPass.uniforms["time"].value += 0.02;

            this._composerBloom.getComposer().render();
            this._composer.getComposer().render();
            this._blendComposer.render();

			super.render();
		}

        resize() {
            this._composer.getComposer().setSize(Scene3D.WIDTH, Scene3D.HEIGHT);
            this._composerBloom.getComposer().setSize(Scene3D.WIDTH, Scene3D.HEIGHT);
            this._blendComposer.setSize(Scene3D.WIDTH, Scene3D.HEIGHT);


            this._blendPass.uniforms["tDiffuse1"].value = this._composer.getComposer().renderTarget2;
            this._blendPass.uniforms["tDiffuse2"].value = this._composerBloom.getComposer().renderTarget2;
            super.resize();
        }
	}
}

var siteReady = function(scene3d:webglExp.Scene3D) {
	var anim = new webglExp.FireBall(scene3d.getScene(), scene3d.getCamera(), scene3d.getRenderer());
	scene3d.setAnim(anim);
}

document.addEventListener("DOMContentLoaded", function(event) { 
  var s = new webglExp.Site(siteReady);
});