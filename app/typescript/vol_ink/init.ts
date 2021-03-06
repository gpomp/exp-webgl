/// <reference path="../../../typings/threejs/three.d.ts" />
/// <reference path="../definitions/core/GLAnimation.d.ts" />
/// <reference path="../definitions/Site.d.ts" />
/// <reference path="addons.ts" />
/// <reference path="../../../typings/greensock/greensock.d.ts" />

declare var SHADERLIST;

module webglExp {
    export class VolInk extends webglExp.GLAnimation {

        static NBSOURCE: number = 4;

        private _scene: THREE.Scene;
        private _camera: THREE.PerspectiveCamera;
        private _renderer: THREE.WebGLRenderer;

        private _uniforms;
        private _attributes;

        private _countSource: number;

        private _img: HTMLImageElement;
        private _imgloaded: boolean;

        private _mesh: THREE.Mesh;

        private _gui;
        private _currSRC:string;

        private _textComposer;
        private _inkComposer;
        private _addComposer;
        private _inkPass;
        private _addPass;


        constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, href?: string) {
            super(scene, camera, renderer);
            this._scene = scene;
            this._camera = camera;
            this._renderer = renderer;

            this._currSRC = '../img/vol_ink/drawing.jpg';

            this._imgloaded = false;

            this._img = document.createElement('img');
            this._img.addEventListener('load', this.imgLoaded);
            this._img.src = this._currSRC;


            this._gui = super.getGui().get_gui();
            var srcChange = this._gui.add(this, '_currSRC', 
                { 
                    skull: '../img/vol_ink/skull.jpg', 
                    bear: '../img/vol_ink/bear.jpg', 
                    storm: '../img/vol_ink/storm.jpg', 
                    drawing: '../img/vol_ink/drawing.jpg', 
                    panther: '../img/vol_ink/panther.jpg' 
                }).name('image');
            srcChange.onChange(function(value) {
                this._scene.remove(this._mesh);
                this._img.src = value;
                console.log('change image', value);
            }.bind(this));

            document.getElementById('canvas3D').addEventListener('click', this.addSource);

        }

        imgLoaded = (event) => {
            console.log('img loaded', this._img.src);

            var renderTargetParamsText = {    minFilter: THREE.LinearFilter,
                                                magFilter: THREE.LinearFilter, 
                                                format: THREE.RGBAFormat,
                                                stencilBuffer: false,
                                                depthBuffer: false };

            var rttext:THREE.WebGLRenderTarget = new THREE.WebGLRenderTarget(1024, 1024, renderTargetParamsText);

            this._textComposer = new THREE.EffectComposer(this._renderer, rttext);

            var rtink:THREE.WebGLRenderTarget = new THREE.WebGLRenderTarget(1024, 1024, renderTargetParamsText);

            this._inkComposer = new THREE.EffectComposer(this._renderer, rtink);

            var rtadd:THREE.WebGLRenderTarget = new THREE.WebGLRenderTarget(1024, 1024, renderTargetParamsText);

            this._addComposer = new THREE.EffectComposer(this._renderer, rtadd);

            this._renderer.clear();

            this._imgloaded = true;
            var text: THREE.Texture = THREE.ImageUtils.loadTexture(this._img.src);

            var paperT: THREE.Texture = THREE.ImageUtils.loadTexture('../img/vol_ink/paper.jpg');
            paperT.wrapS = THREE.RepeatWrapping;
            paperT.wrapT = THREE.RepeatWrapping;

            this._uniforms = {
                time: {
                    type: 'f',
                    value: 0.0
                },
                inkspillText: {
                    type: 't',
                    value:null
                },
                inkText: {
                    type: 't',
                    value:text
                },
                paperText: {
                    type: 't',
                    value:paperT
                }
            }

            var copyPass = new THREE.ShaderPass(<any>THREE.CopyShader);

            this._inkPass = new THREE.ShaderPass(<any>THREE.InkShader);
            this._inkPass.uniforms["inkText"].value = text;
            this._inkComposer.addPass(this._inkPass);

            this._addPass = new THREE.ShaderPass(<any>THREE.AddShader);
            this._addPass.uniforms['tDiffuse2'].value = this._inkComposer.renderTarget1;
            this._addPass.uniforms['tDiffuse1'].value = this._addComposer.renderTarget2;
            this._addComposer.addPass(this._addPass);
            this._addComposer.addPass(copyPass);

            var addPass1 = new THREE.ShaderPass(<any>THREE.AddShader);
            addPass1.uniforms['tDiffuse2'].value = this._addComposer.renderTarget2;
            this._textComposer.addPass(addPass1);

            this._uniforms.inkspillText.value = this._textComposer.renderTarget1;

            this._attributes = {
                rands: {
                    type: 'v3',
                    value: null
                }
            };

            this._countSource = 0;

            for (var i = 0; i < VolInk.NBSOURCE; ++i) {
                // this._uniforms.source.value.push(new THREE.Vector3(0, 0, 0));

                this._inkPass.uniforms['source'].value.push(new THREE.Vector3(0, 0, 0));
            }

            var planeMat: THREE.ShaderMaterial = new THREE.ShaderMaterial({
                vertexShader:   SHADERLIST.plane.vertex,
                fragmentShader: SHADERLIST.plane.fragment,
                side:THREE.DoubleSide,
                uniforms: this._uniforms,
                attributes: this._attributes
            })

            var planeSize: number = 1024;
            var planeSize1: number = planeSize - 1;

            var planeGeom: THREE.PlaneBufferGeometry = new THREE.PlaneBufferGeometry(planeSize, planeSize, 500, 500);
            
            var geomLength: number = Math.floor(planeGeom.getAttribute('position').length / 3);
            var offset: number = 0;
            var offset2: number = 0;

            var canImage = document.createElement('canvas');
            var ctx:CanvasRenderingContext2D = canImage.getContext('2d');
            canImage.width = planeSize;
            canImage.height = planeSize;
            ctx.drawImage(this._img, 0, 0, planeSize, planeSize);
            var imgD = ctx.getImageData(0, 0, planeSize, planeSize).data;

            var ar = planeGeom.getAttribute('position').array;
            var aruv = planeGeom.getAttribute('uv').array;

            var rands = new Float32Array( geomLength * 3 );

            for (var i = 0; i < geomLength; ++i) {
                var x: number = Math.floor( aruv[offset2 + 0] * planeSize1);
                var y: number = Math.floor( (1 - aruv[offset2 + 1]) * planeSize1);
                var dataLoc = Math.floor(y * planeSize + x) * 4;

                ar[offset + 2] = imgD[dataLoc] / 255 * -10.0;
                rands[offset + 0] = Math.random();
                rands[offset + 1] = Math.random();
                rands[offset + 2] = Math.random();

                offset += 3;
                offset2 += 2;
            }

            planeGeom.addAttribute( 'rands', new THREE.BufferAttribute( rands, 3 ) );

            planeGeom.computeVertexNormals();

            this._mesh = new THREE.Mesh(planeGeom, planeMat);
            this._scene.add(this._mesh);
            this._camera.lookAt(this._mesh.position);
            this._camera.lookAt(new THREE.Vector3(0, 0, 0));


        }

        addSource = (event:MouseEvent) => {
            event.preventDefault();
            document.getElementById('instructions').classList.add('hide');
            var w: number = window.innerWidth;
            var h: number = window.innerHeight;

            this._countSource = (this._countSource === VolInk.NBSOURCE - 1) ? 0 : this._countSource + 1;
            var xcap: number = Math.max(-512, Math.min(512, (event.clientX - w * .5)));
            var ycap: number = Math.max(-512, Math.min(512, (event.clientY - h * .5)));
            var x: number = ((xcap) / 512 + 1) * 0.5;
            var y: number = (-(ycap) / 512 + 1) * 0.5;
            this._inkPass.uniforms['source'].value[this._countSource].set(x, y, 0);

            TweenLite.to(this._inkPass.uniforms['source'].value[this._countSource], 15, { z: 1, ease: Expo.easeOut,
                onComplete: this.onSourceDone, overwrite:"all" });

        }

        onSourceDone = () => {

        }


		render() {
			super.render();
            if(this._imgloaded) {
                this._uniforms.time.value += 0.01;

                this._inkComposer.render();
                this._addComposer.render();
                this._textComposer.render();

            }
		}

        resize() {
            super.resize();
        }
	}
}

var siteReady = function(scene3d:webglExp.Scene3D) {
	var anim = new webglExp.VolInk(scene3d.getScene(), scene3d.getCamera(), scene3d.getRenderer());
	scene3d.setAnim(anim);
}

document.addEventListener("DOMContentLoaded", function(event) { 
  var s = new webglExp.Site(siteReady);
});