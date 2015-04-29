/// <reference path="../../../typings/threejs/three.d.ts" />
/// <reference path="../../../typings/greensock/greensock.d.ts" />
/// <reference path="../definitions/core/GLAnimation.d.ts" />
/// <reference path="../definitions/Site.d.ts" />
/// <reference path="addons.ts" />

declare var SHADERLIST;

module webglExp {

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

        private _composerBloom:webglExp.EffectComposer;

        private _bloomStrength: number;
        private _blurh: number;
        private _effectBloom: THREE.BloomPass;

        private _baseColor: number[];
        private _middleColor: number[];
        private _topColor: number[];

        private _mousePos: THREE.Vector2;


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

                mousePos: {
                    type: 'v2',
                    value: new THREE.Vector2(0, 0)
                },

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
                uniforms: this._uniforms,
                transparent: true
            })
            this._BloomScene = new THREE.Scene();
            var sphereGeom: THREE.SphereGeometry = new THREE.SphereGeometry(FireBall.RADIUS, 20, 20);
            this._sphere = new THREE.Mesh(sphereGeom, planeMat);
            this._scene.add(this._sphere);
            camera.lookAt(this._sphere.position);

            this.setComposers();
            this.setComposerPasses();

            this._mousePos = new THREE.Vector2(0, 0);

            document.addEventListener('mousemove', this.onMouseMove);
		}

        onMouseMove = (event:MouseEvent) => {
            var w: number = window.innerWidth;
            var h: number = window.innerHeight;
            var x: number = (event.clientX - w * .5);
            var y: number = (event.clientY - h * .5);
            this._mousePos.set(x, y);
        }

        setComposers() {
            this._composerBloom = new webglExp.EffectComposer(this._renderer, this._scene, this._camera, Scene3D.WIDTH, Scene3D.HEIGHT);
        }

        private _glowPass;
        private _gRayPass;
        private _glowColor: number[];

        setComposerPasses() {
            var composerFolder = this._gui.addFolder('Composer');

            var renderPass = new THREE.RenderPass(this._scene, this._camera);
            
            this._glowPass = new THREE.ShaderPass( <any>THREE.GlowShader );
            this._glowPass.uniforms['quality'].value = 2.9;
            this._glowPass.uniforms['glowPower'].value = 0.9;
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

            this._gRayPass = new THREE.ShaderPass( <any>THREE.GodRayShader );
            composerFolder.add(this._gRayPass.uniforms['radiusLight'], 'value', 0.00, 0.500).name('light radius').step(0.005);
            composerFolder.add(this._gRayPass.uniforms['lightDirDOTviewDir'], 'value', 0.00, 10.00).name('god ray v');
            composerFolder.add(this._gRayPass.uniforms['exposureNB'], 'value', 0.00, 2.00).name('god ray exposure').step(0.05);
            composerFolder.add(this._gRayPass.uniforms['decay'], 'value', 0.7500, 1.0500).name('god ray decay').step(0.005);
            composerFolder.add(this._gRayPass.uniforms['density'], 'value', 0.00, 2.00).name('god ray density');
            composerFolder.add(this._gRayPass.uniforms['weight'], 'value', 0.00, 20.00).name('god ray weight');
            composerFolder.add(this._gRayPass.uniforms['illuminationDecay'], 'value', 0.00, 2.00).name('god ray ill decay');


            var copyPass = new THREE.ShaderPass(<any>THREE.CopyShader);
            copyPass.renderToScreen = true;
   
            this._composerBloom.addPass(renderPass);
            this._composerBloom.addPass(this._glowPass);
            this._composerBloom.addPass(this._gRayPass);
            this._composerBloom.addPass(copyPass);
        }


		render() {
            this._uniforms.time.value += 0.01;

            this._uniforms.mousePos.value.x += (this._mousePos.x - this._uniforms.mousePos.value.x) * 0.1;
            this._uniforms.mousePos.value.y += (this._mousePos.y - this._uniforms.mousePos.value.y) * 0.1;

            this._composerBloom.getComposer().render();

			super.render();
		}

        resize() {
            this._composerBloom.getComposer().setSize(Scene3D.WIDTH, Scene3D.HEIGHT);
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