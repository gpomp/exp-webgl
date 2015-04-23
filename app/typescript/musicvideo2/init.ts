/// <reference path="../../../typings/threejs/three.d.ts" />
/// <reference path="../definitions/core/GLAnimation.d.ts" />
/// <reference path="../definitions/helper/ThreeAddOns.d.ts" />
/// <reference path="../definitions/helper/Utils.d.ts" />
/// <reference path="../../../typings/greensock/greensock.d.ts" />
/// <reference path="../definitions/Site.d.ts" />
/// <reference path="addons.ts" />

declare var SHADERLIST;
declare var voronoi;
declare var randomColor;

module webglExp {

    export class bgLine {

        private _uniforms;
        private _attributes;

        private _line: THREE.Line;
        private _mat: THREE.ShaderMaterial;

        constructor(index:number) {
            var geom: THREE.BufferGeometry = new THREE.BufferGeometry();

            var nb: number = 128;
            var vertices = new Float32Array( nb * 3 );
            var indices = new Float32Array( nb * 1 );
            var addAngle = new Float32Array( nb * 2 );
            

            var offset3 = 0;
            var offset2 = 0;
            var angle: number = 0;
            var addA: number = Math.PI / 150 + Math.random() * Math.PI / 50;
            for (var i = 0; i < nb; ++i) {
                indices[i] = i;
                
                vertices[offset3 + 0] = 0;
                vertices[offset3 + 1] = 0;
                vertices[offset3 + 2] = 0;

                var anglerand: number = (i === 0 || i === nb - 1) ? 0 : Math.random();

                addAngle[offset2 + 0] = angle;
                addAngle[offset2 + 1] = anglerand;

                offset3 += 3;
                offset2 += 2;
                angle += addA;
            }

            geom.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
            geom.addAttribute( 'addAngle', new THREE.BufferAttribute( addAngle, 2 ) );
            geom.addAttribute( 'vIndex', new THREE.BufferAttribute( indices, 1 ) );

            var rColor = randomColor({
               luminosity: 'bright',
               format: 'rgbArray'
            });

            this._uniforms = {
                time: {
                    type: 'f',
                    value: 0.0
                },
                radius: {
                    type: 'f',
                    value: Math.random() * 80
                },
                modV: {
                    type: 'f',
                    value: Math.floor(6 + Math.random() * 10)
                },
                angle: {
                    type: 'f',
                    value: (Math.PI * 2) * Math.random()
                },
                color: {
                    type:'v3',
                    value: new THREE.Vector3(rColor[0] / 255, rColor[1] / 255, rColor[2] / 255)
                },

                brightSound: {
                    type: 'f',
                    value:0
                }
            }

            this._attributes = {
                vIndex: {
                    type: 'f',
                    value:null
                },

                addAngle: {
                    type: 'v2',
                    value:null
                }
            };

            this._mat = new THREE.ShaderMaterial({
                vertexShader: SHADERLIST.line.vertex,
                fragmentShader: SHADERLIST.line.fragment,
                uniforms: this._uniforms,
                attributes: this._attributes,
                transparent: true
            });

            this._line = new THREE.Line(geom, this._mat);
        }

        getLine():THREE.Line {
            return this._line;
        }

        setBSound(n:number) {
            this._uniforms.brightSound.value = n;
            this._mat.linewidth = 1 + n;
        }

        render() {
            this._uniforms.time.value += 0.1;
        }

        /*renderPoint(id:number, soundValue:number) {

        }*/
    }


    export class backgroundLines {

        private _lineList: webglExp.bgLine[];

        constructor() {
            this._lineList = [];

            for (var i = 0; i < 128; ++i) {
                var l: webglExp.bgLine = new webglExp.bgLine(i);
                this._lineList.push(l);
            }

            
        }

        getLines(): THREE.Line [] {
            var lList: THREE.Line[] = [];
            for (var i = 0; i < this._lineList.length; ++i) {
                lList.push(this._lineList[i].getLine());
            }
            return lList;
        }

        render() {
            for (var i = 0; i < this._lineList.length; ++i) {
                this._lineList[i].render();
            }
        }

        renderPoint(id:number, soundValue:number) {
            this._lineList[id].setBSound(soundValue);
        }
    }

    export class SplitPlane {

        private _w: number;
        private _h: number;
        private _ptNB: number;

        private _ptList: number[][];

        private _vorCells: number[][];
        private _vorPos: number[][];

        private _objectList: THREE.Mesh[];

        public ctn: THREE.Object3D;
        public lineCtn: THREE.Object3D;

        private _dummy: number;

        private _material: THREE.ShaderMaterial;
        private _uniforms;
        private _attributes;

        private _v2c: utils.Video2Canvas;

        private lines: webglExp.backgroundLines;

        constructor(w: number, h: number, v2c:utils.Video2Canvas) {
            this._w = w;
            this._h = h;

            this._v2c = v2c;

            this._dummy = 0;

            this._ptNB = 128;

            this._ptList = [];
            var sw: number = w - 2;
            var sh: number = h - 2;
            var plusradiusx: number = (sw * 0.5) / this._ptNB;
            var plusradiusy: number = (sh * 0.5) / this._ptNB;
            for (var i = 0; i < this._ptNB; ++i) {
                var angle: number = Math.random() * (Math.PI * 2);
                this._ptList.push([    w * 0.5 + Math.cos(angle) * (Math.random() * sw * 0.5),
                                       h * 0.5 + Math.sin(angle) * (Math.random() * sh * 0.5)]);
            }

            var vorObj = voronoi(this._ptList);

            this._vorCells = vorObj.cells;
            this._vorPos = vorObj.positions;
            this._objectList = [];

            this._uniforms = THREE.UniformsUtils.merge([
                THREE.UniformsLib['lights'],
                {
                    text: {
                        type: 't',
                        value: null
                    }
                }

            ]);

            this._uniforms.text.value = new THREE.Texture(this._v2c.getCanvas());

            this._attributes = {};


            // var basicMat: THREE.MeshLambertMaterial = new THREE.MeshLambertMaterial({ map: t, color:0xFF0000, side: THREE.DoubleSide });

            this._material = new THREE.ShaderMaterial({
                vertexShader: SHADERLIST.pfragment.vertex,
                fragmentShader: SHADERLIST.pfragment.fragment,
                side: THREE.DoubleSide,
                uniforms: this._uniforms,
                attributes: this._attributes,
                lights: true
            });

            this.ctn = new THREE.Object3D();
 
            for (var i = 0; i < this._vorCells.length; ++i) {
                var geom: THREE.Geometry = this.createCellGeometry(this._vorCells[i]);
                if (geom === null) continue;
                var mesh: THREE.Mesh = new THREE.Mesh(geom, this._material);
                this._objectList.push(mesh);
                this.ctn.add(mesh);
            }

            this.lineCtn = new THREE.Object3D();
            this.lineCtn.position.z = -100;
            this.lines = new webglExp.backgroundLines();
            var lMesh: THREE.Line[] = this.lines.getLines();
            for (var i = 0; i < lMesh.length; ++i) {
                this.lineCtn.add(lMesh[i]);
            }

        }

        getObjects(): THREE.Mesh[] {
            return this._objectList;
        }

        normalizeCellPT(n:number, isHori:boolean = false) {
            var hw: number = this._w * .5;
            var hh: number = this._h * .5;
            if (isHori) return Math.max(-hw, Math.min(hw, -hw + n));
            return Math.max(-hh, Math.min(hh, -hh + n));
        }


        createCellGeometry(c: number[]): THREE.Geometry {

            if (c.indexOf(-1) >= 0 || c.length < 3) return null;

            var vNb = c.length;

            var path: THREE.Shape = new THREE.Shape();
            var hw: number = this._w * 0.5;
            var hh: number = this._h * 0.5;

            var vi: number = c[vNb - 1];
            var vpos: number[] = this._vorPos[vi];

            path.moveTo(this.normalizeCellPT(vpos[0], true), this.normalizeCellPT(vpos[1]));

            for (var i = vNb - 2; i > -1; --i) {
                vi = c[i];
                vpos = this._vorPos[vi];
                var x: number = this.normalizeCellPT(vpos[0], true);
                var y: number = this.normalizeCellPT(vpos[1]);
                if (x === -hw || x === hw ||
                    y === -hh || y === hh) return null;
                path.lineTo(x, y);
                
            }

            path.closePath();
            // console.log(path.getSpacedPoints());

            var extrudeSettings = { 
                amount: 20,
                bevelEnabled: false,
                steps: 1
            };


            var geom: THREE.Geometry = path.extrude(extrudeSettings);  
            geom.mergeVertices();
            geom.verticesNeedUpdate = true;
            geom.faceVertexUvs[0] = [];
            for (var i = 0; i < geom.faces.length; ++i) {
                var f = geom.faces[i];
                var v1 = geom.vertices[f.a], 
                    v2 = geom.vertices[f.b], 
                    v3 = geom.vertices[f.c];

                geom.faceVertexUvs[0].push(
                    [
                        new THREE.Vector2((v1.x + hw) / this._w, (v1.y + hh) / this._h),
                        new THREE.Vector2((v2.x + hw) / this._w, (v2.y + hh) / this._h),
                        new THREE.Vector2((v3.x + hw) / this._w, (v3.y + hh) / this._h)
                    ]);
            }

            geom.uvsNeedUpdate = true;
            geom.computeFaceNormals();



            return geom;

        }

        move = () => {
            for (var i = 0; i < this._objectList.length; ++i) {
                TweenLite.to(this._objectList[i].position, 3, { 
                    x: -500 + Math.random() * 1000, 
                    y: -500 + Math.random() * 1000, 
                    z: -200 + Math.random() * 400 });

                TweenLite.to(this._objectList[i].rotation, 3, {
                    x: Math.random() * (Math.PI * 2)});
            }

            TweenLite.to(this, 3, { dummy: 1, onComplete: this.move });
        }

        render() {
            if(this._v2c.isDrawing) {
                this._v2c.render(true);
                this._uniforms.text.value.needsUpdate = true;
                var div: number = 1;
                for (var i = 0; i < this._objectList.length; i ++) {
                    var soundLoc = i * div;
                    this._objectList[i].position.z = -50 + this._v2c.dArray[soundLoc] * 100;
                    this.lines.renderPoint(soundLoc, this._v2c.dArray[soundLoc]);
                    // this._objectList[i].rotation.y = -Math.PI / 4 + -1 * this._v2c.dArray[soundLoc] * Math.PI / 8;
                }

                this.lines.render();
            }
        }
    }

	export class MusicVideo2 extends webglExp.GLAnimation {
        private _scene: THREE.Scene;
        private _camera: THREE.PerspectiveCamera;
        private _renderer: THREE.WebGLRenderer;
        private _gui;

        private _objectList: webglExp.SplitPlane[];

        private _ambiantLight: THREE.AmbientLight;
        private _dirLight: THREE.DirectionalLight;

        private _circleScene: THREE.Scene;

        private _composeCircles: webglExp.EffectComposer;
        private _composeVor: webglExp.EffectComposer;
        private _blendComposer;

        private _blendPass;

        private _pointLight: THREE.PointLight;

        private _v2c: utils.Video2Canvas;

        private mouseControl: THREE.Mouse2DControls;


		constructor(scene:THREE.Scene, camera:THREE.PerspectiveCamera, renderer:THREE.WebGLRenderer, href?:string) {
			super(scene, camera, renderer);
            super.setInternalRender(true);
            this._scene = scene;
            this._camera = camera;
            this._renderer = renderer;
            this._renderer.autoClear = true;

            this._gui = super.getGui().get_gui();

            this._pointLight = new THREE.PointLight(0xffffff, 1.0, 800);
            this._pointLight.position.set(0.0,0.0, 600.0);
            this._scene.add(this._pointLight);   

            this._circleScene = new THREE.Scene();

            this._v2c = new utils.Video2Canvas(this.audioLoaded, true);

            this._objectList = [];
            this._objectList.push(new webglExp.SplitPlane(512, 512, this._v2c));

            var l: THREE.Mesh[] = this._objectList[0].getObjects();

            this._scene.add(this._objectList[0].ctn);
            this._circleScene.add(this._objectList[0].lineCtn);

            this.mouseControl = new THREE.Mouse2DControls([this._objectList[0].ctn, this._objectList[0].lineCtn]);
            this.mouseControl.toggleEnable(true);

            // this._objectList[0].move();
            this._camera.position.set(0, 0, 600);
            this._camera.lookAt(new THREE.Vector3(0));

            this.setComposers();
            this.setComposerPasses();
		}

        setComposers() {
            this._composeCircles = new webglExp.EffectComposer(this._renderer, this._circleScene, this._camera, Scene3D.WIDTH, Scene3D.HEIGHT);
            this._composeVor = new webglExp.EffectComposer(this._renderer, this._scene, this._camera, Scene3D.WIDTH, Scene3D.HEIGHT);
            
            var renderTargetParams = {    minFilter: THREE.LinearFilter,
                                        magFilter: THREE.LinearFilter, 
                                        format: THREE.RGBAFormat,
                                        stencilBuffer: true };

            var rt:THREE.WebGLRenderTarget = new THREE.WebGLRenderTarget(Scene3D.WIDTH, Scene3D.HEIGHT, renderTargetParams);

            this._blendComposer = new THREE.EffectComposer(this._renderer, rt);
        }
 
        setComposerPasses() { 
            var renderPassC = new THREE.RenderPass(this._circleScene, this._camera);
            var renderPassV = new THREE.RenderPass(this._scene, this._camera);

            var glowPass = new THREE.ShaderPass( <any>THREE.GlowShader );
            glowPass.uniforms['quality'].value = 1.65;
            glowPass.uniforms['glowPower'].value = 3.8;
            glowPass.uniforms['size'].value = new THREE.Vector2(Scene3D.WIDTH, Scene3D.HEIGHT);

            var compFolder = this._gui.addFolder('composer');
            compFolder.add(glowPass.uniforms['quality'], 'value', 0, 6).name('glow quality').step(0.05);
            compFolder.add(glowPass.uniforms['glowPower'], 'value', 1, 10).name('glow power');

            var copyPass = new THREE.ShaderPass( <any>THREE.CopyShader );
            
            this._composeCircles.addPass(renderPassC);
            this._composeCircles.addPass(glowPass);
            this._composeCircles.addPass(copyPass);

            this._composeVor.addPass(renderPassV);

            this._blendPass = new THREE.ShaderPass( <any>THREE.Blend2Shader );
            this._blendPass.uniforms["tDiffuse1"].value = this._composeCircles.getComposer().renderTarget2;
            this._blendPass.uniforms["tDiffuse2"].value = this._composeVor.getComposer().renderTarget2;
            this._blendPass.renderToScreen = true;

            this._blendComposer.addPass(this._blendPass);
        }

        audioLoaded = () => {

        }


		render() {
			super.render();

            for (var i = 0; i < this._objectList.length; ++i) {
                this._objectList[i].render();
            }

            this.mouseControl.render();

            this._composeCircles.getComposer().render();
            this._composeVor.getComposer().render();
            this._blendComposer.render();
		}

        resize() {

            this._composeCircles.getComposer().setSize(Scene3D.WIDTH, Scene3D.HEIGHT);
            this._composeVor.getComposer().setSize(Scene3D.WIDTH, Scene3D.HEIGHT);
            this._blendComposer.setSize(Scene3D.WIDTH, Scene3D.HEIGHT);
            this._blendPass.uniforms["tDiffuse1"].value = this._composeCircles.getComposer().renderTarget2;
            this._blendPass.uniforms["tDiffuse2"].value = this._composeVor.getComposer().renderTarget2;

            super.resize();
        }
	}
}

var siteReady = function(scene3d:webglExp.Scene3D) {
	var anim = new webglExp.MusicVideo2(scene3d.getScene(), scene3d.getCamera(), scene3d.getRenderer());
	scene3d.setAnim(anim);
}

document.addEventListener("DOMContentLoaded", function(event) { 
  var s = new webglExp.Site(siteReady);
});