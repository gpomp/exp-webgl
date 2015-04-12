/// <reference path="../../../typings/threejs/three.d.ts" />
/// <reference path="../../../typings/greensock/greensock.d.ts" />
/// <reference path="../definitions/core/GLAnimation.d.ts" />
/// <reference path="../definitions/Site.d.ts" />
/// <reference path="addons.ts" />

declare var SHADERLIST;

module webglExp {

    export class SunRing {

        private _plane: THREE.Mesh;

        private _uniforms;
        private _attributes;

        constructor() {

            this._uniforms = {
                time: {
                    type: 'f',
                    value: 0
                }
            }

            this._attributes = {
                
            }

            var pGeom: THREE.PlaneBufferGeometry = new THREE.PlaneBufferGeometry(1000, 1000);
            var ringMat: THREE.ShaderMaterial = new THREE.ShaderMaterial({
                vertexShader: SHADERLIST.ring.vertex,
                fragmentShader: SHADERLIST.ring.fragment,
                side: THREE.DoubleSide,
                uniforms: this._uniforms,
                attributes: this._attributes,
                transparent: true,
                blending: THREE.AdditiveBlending 
            });

            this._plane = new THREE.Mesh(pGeom, ringMat);
        }

        getPlane():THREE.Mesh {
            return this._plane;
        }

        render() {
            this._uniforms.time.value += 0.01;
        }
    }

    export class ParticleBurst {

        static NB_PARTICLES: number = 600;

        private _radius: number;

        private _vertexPos: number[][];

        private _uniforms;
        private _attributes;

        private _pCloud: THREE.PointCloud;

        constructor(radius:number) {
            this._radius = radius;

            this._uniforms = {
                time: {
                    type: 'f',
                    value: 0
                },
                radius: {
                    type: 'f',
                    value: radius
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
                }
            };

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

            this._pCloud = new THREE.PointCloud(geometry, burstMat);

        }

        getPointCloud():THREE.PointCloud {
            return this._pCloud;
        }

        launch = () => {
            this._uniforms.time.value = 0;
            var a:number = Math.random() * (Math.PI * 2);
            this._uniforms.aPos.value = a;
            
            var d: number = Math.random() * 10;
            var t: number = 10 + Math.random() * 5;

            TweenLite.to(this._uniforms.time, t, { value: 1.0, onComplete: this.launch, delay: d });

            TweenLite.to(this._uniforms.alpha, 1, { value: 1.0, delay: d });
            var endAlpha: number = d + t - 3;
            TweenLite.to(this._uniforms.alpha, 1, { value: 0.0, delay: endAlpha });
        }

        render() {

        }
    }

	export class Sun extends webglExp.GLAnimation {
        static RADIUS: number = 250;

        private _scene: THREE.Scene;
        private _BloomScene: THREE.Scene;
        private _camera: THREE.PerspectiveCamera;
        private _renderer: THREE.WebGLRenderer;
        private _gui;

        private _sphere: THREE.Mesh;

        private _uniforms;

        private _burstList: webglExp.ParticleBurst[];
        private _sunRing: webglExp.SunRing;

        private _composerBloom:webglExp.EffectComposer;
        private _composer:webglExp.EffectComposer;
        private _blendComposer;

        private _bloomStrength: number;
        private _blurh: number;
        private _effectBloom: THREE.BloomPass;
        private _blendPass: THREE.ShaderPass;

        private _baseColor: number[];
        private _topColor: number[];


		constructor(scene:THREE.Scene, camera:THREE.PerspectiveCamera, renderer:THREE.WebGLRenderer, href?:string) {
			super(scene, camera, renderer);
            super.setInternalRender(true);
            this._scene = scene;
            this._camera = camera;
            this._renderer = renderer;
            this._renderer.autoClear = true;

            this._gui = super.getGui().get_gui();

            this._baseColor = [255, 59, 13];
            this._topColor = [255, 255, 255];

            var bumpTexture: THREE.Texture = THREE.ImageUtils.loadTexture('../img/sun/bump.jpg');
            bumpTexture.wrapS = THREE.RepeatWrapping;
            bumpTexture.wrapT = THREE.RepeatWrapping;

            var crackTexture: THREE.Texture = THREE.ImageUtils.loadTexture('../img/sun/crack.jpg');
            crackTexture.wrapS = THREE.RepeatWrapping;
            crackTexture.wrapT = THREE.RepeatWrapping;

            var perimeter = 2 * Math.PI * Sun.RADIUS;

            this._uniforms = {
                time: {
                    type: 'f',
                    value: 0
                },
                baseColor: {
                    type: 'v3',
                    value: new THREE.Vector3(this._baseColor[0] / 255, this._baseColor[1] / 255, this._baseColor[2] / 255)
                },
                topColor: {
                    type: 'v3',
                    value: new THREE.Vector3(this._topColor[0] / 255, this._topColor[1] / 255, this._topColor[2] / 255)
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
                    value: Sun.RADIUS
                }
            }

            var colFolder = this._gui.addFolder("sphere color");
            var bCol = colFolder.addColor(this, '_baseColor');
            var tCol = colFolder.addColor(this, '_topColor');
            bCol.onChange(function(value) {
                this._uniforms.baseColor.value.x = value[0] / 255;
                this._uniforms.baseColor.value.y = value[1] / 255;
                this._uniforms.baseColor.value.z = value[2] / 255;
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
            var sphereGeom: THREE.SphereGeometry = new THREE.SphereGeometry(Sun.RADIUS, 20, 20);
            this._sphere = new THREE.Mesh(sphereGeom, planeMat);
            scene.add(this._sphere);
            camera.lookAt(this._sphere.position);

            this._BloomScene = new THREE.Scene();

            this._burstList = [];

            /*for (var i = 0; i < 10; ++i) {
                var pb: webglExp.ParticleBurst = new webglExp.ParticleBurst(Sun.RADIUS);
                this._BloomScene.add(pb.getPointCloud());
                this._burstList.push(pb);
                pb.launch();
            }*/

            this._sunRing = new webglExp.SunRing();
            this._scene.add(this._sunRing.getPlane());

            this.setComposers();
            this.setComposerPasses();
		}

        setComposers() {
            // this._composerBloom = new webglExp.EffectComposer(this._renderer, this._scene, this._camera, Scene3D.WIDTH, Scene3D.HEIGHT);
            this._composer = new webglExp.EffectComposer(this._renderer, this._scene, this._camera, Scene3D.WIDTH, Scene3D.HEIGHT);
            
            /*var renderTargetParams = {    minFilter: THREE.LinearFilter,
                                        magFilter: THREE.LinearFilter, 
                                        format: THREE.RGBAFormat,
                                        stencilBuffer: true };

            var rt:THREE.WebGLRenderTarget = new THREE.WebGLRenderTarget(Scene3D.WIDTH, Scene3D.HEIGHT, renderTargetParams);

            this._blendComposer = new THREE.EffectComposer(this._renderer, rt);*/
        }

        setComposerPasses() {
            /*var renderPass = new THREE.RenderPass(this._BloomScene, this._camera, null, new THREE.Color(0, 0, 0), 0);
           
            this._bloomStrength = 7;
            this._effectBloom = new THREE.BloomPass(this._bloomStrength, 20, 8.0, 1024, true);
            this._blurh = 1.3;
 
            var composerFolder = this._gui.addFolder('Composer');

            var vbGUI = composerFolder.add(this, "_blurh", 0.00, 30.00);
            vbGUI.onChange(function(value) {
                THREE.BloomPass.blurX = new THREE.Vector2( value / (Scene3D.WIDTH * 2), 0.0 );
                THREE.BloomPass.blurY = new THREE.Vector2( 0.0, value / (Scene3D.HEIGHT * 2) );
            }.bind(this));

            var soGUI = composerFolder.add(this, "_bloomStrength", 0.00, 30.00);
            soGUI.onChange(function(value) {
                this._effectBloom.copyUniforms['opacity'].value = this._bloomStrength;
            }.bind(this));

            THREE.BloomPass.blurX = new THREE.Vector2( this._blurh / (Scene3D.WIDTH * 2), 0.0 );
            THREE.BloomPass.blurY = new THREE.Vector2( 0.0, this._blurh / (Scene3D.HEIGHT * 2) );

            this._composerBloom.addPass(renderPass);
            this._composerBloom.addPass(this._effectBloom);*/
            
            var renderPass = new THREE.RenderPass(this._scene, this._camera);
            var godPass = new THREE.ShaderPass(<any>THREE.GodRayShader);
            godPass.renderToScreen = true;

            var copyPass = new THREE.ShaderPass(<any>THREE.CopyShader);
            copyPass.renderToScreen = true;
            
            this._composer.addPass(renderPass);
            this._composer.addPass(copyPass); 


            /*this._blendPass = new THREE.ShaderPass( <any>THREE.BlendShader );
            this._blendPass.uniforms["tDiffuse2"].value = this._composerBloom.getComposer().renderTarget2;
            this._blendPass.uniforms["tDiffuse3"].value = this._composer.getComposer().renderTarget2;
            this._blendPass.renderToScreen = true;

            this._blendComposer.addPass(this._blendPass);*/
        }


		render() {
            this._uniforms.time.value += 0.01;

            this._sunRing.render();
            this._composer.getComposer().render();

            /*this._composerBloom.getComposer().render();
            this._composer.getComposer().render();
            this._blendComposer.render();*/

			super.render();
		}

        resize() {
            this._composer.getComposer().setSize(Scene3D.WIDTH, Scene3D.HEIGHT);
          /*  this._composerBloom.getComposer().setSize(Scene3D.WIDTH, Scene3D.HEIGHT);
            this._composer.getComposer().setSize(Scene3D.WIDTH, Scene3D.HEIGHT);
            this._blendComposer.setSize(Scene3D.WIDTH, Scene3D.HEIGHT);


            this._blendPass.uniforms["tDiffuse2"].value = this._composerBloom.getComposer().renderTarget2;
            this._blendPass.uniforms["tDiffuse3"].value = this._composer.getComposer().renderTarget2;*/
            super.resize();
        }
	}
}

var siteReady = function(scene3d:webglExp.Scene3D) {
	var anim = new webglExp.Sun(scene3d.getScene(), scene3d.getCamera(), scene3d.getRenderer());
	scene3d.setAnim(anim);
}

document.addEventListener("DOMContentLoaded", function(event) { 
  var s = new webglExp.Site(siteReady);
});