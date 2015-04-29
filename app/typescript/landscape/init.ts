/// <reference path="../../../typings/threejs/three.d.ts" />
/// <reference path="../definitions/core/GLAnimation.d.ts" />
/// <reference path="../definitions/Site.d.ts" />
/// <reference path="../definitions/helper/Utils.d.ts" />
/// <reference path="../../../typings/greensock/greensock.d.ts" />
/// <reference path="addons.ts" />

declare var SHADERLIST;

module webglExp {

    export class SnowField {

        static NB_PARTICLES_X: number = 70;
        static NB_PARTICLES_Y: number = 70;

        private _uniforms;
        private _attributes;

        private _snowField: THREE.PointCloud;

        private _gui;

        constructor(w:number, h:number, gui) {

            this._gui = gui;

            var flakeTexture: THREE.Texture = THREE.ImageUtils.loadTexture('../img/landscape/flake.jpg');

            this._uniforms = {
                time: {
                    type: 'f',
                    value: Math.random() * 100
                }, 
                width: {
                    type: 'f',
                    value: w
                },   
                height: {
                    type: 'f',
                    value: h
                },   
                noiseDivide: {
                    type: 'f',
                    value: 600.0
                },   
                xWind: {
                    type: 'f',
                    value: 400.0
                },  
                zWind: {
                    type: 'f',
                    value: 350.0
                },
                flake: {
                    type: 't',
                    value: flakeTexture
                }, 
                scroll: {
                    type: 'v2',
                    value: new THREE.Vector2(0, 0)
                },

            };
            this._attributes = {
                modValue: {
                    type: 'v2',
                    value: null
                }
            };

            var folder = this._gui.addFolder("snow field");
            folder.add(this._uniforms.noiseDivide, 'value', 100.0, 3000.0).name('noiseDivide');
            folder.add(this._uniforms.xWind, 'value', 10.0, 400.0).name('xWind');
            folder.add(this._uniforms.zWind, 'value', 10.0, 400.0).name('yWind');

            var geometry: THREE.BufferGeometry = new THREE.BufferGeometry();
            var vPos: number[][] = [];

            var hw: number = w / 2;
            var hh: number = h / 2;

            var wSeg: number = w / SnowField.NB_PARTICLES_X;
            var hSeg: number = w / SnowField.NB_PARTICLES_Y;

            for (var y = 0; y < SnowField.NB_PARTICLES_Y; ++y) {
                var yp: number = -hh + y * hSeg - hSeg * 0.5 + hSeg * Math.random();
                for (var x = 0; x < SnowField.NB_PARTICLES_X; ++x) {
                     var xp: number = -hw + x * wSeg - wSeg * 0.5 + wSeg * Math.random();

                    vPos.push([xp, 0, yp]);
                }
            }

            var vertices = new Float32Array( vPos.length * 3 );
            var modValue = new Float32Array( vPos.length * 2 );

            for ( var i = 0; i < vPos.length; i++ ) {
                vertices[ i*3 + 0 ] = vPos[i][0];
                vertices[ i*3 + 1 ] = vPos[i][1];
                vertices[ i*3 + 2 ] = vPos[i][2];

                modValue[ i*2 + 0 ] = 0.3 + Math.floor(Math.random() * 10000) / 10000;
                modValue[ i*2 + 1 ] = 4000 + Math.random() * 400.0;
            }

            geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
            geometry.addAttribute( 'modValue', new THREE.BufferAttribute( modValue, 2 ) );

            var snowMat: THREE.ShaderMaterial = new THREE.ShaderMaterial({
                vertexShader: SHADERLIST.snowfield.vertex,
                fragmentShader: SHADERLIST.snowfield.fragment,
                side: THREE.DoubleSide,
                uniforms: this._uniforms,
                attributes: this._attributes,
                transparent: true,
                blending: THREE.AdditiveBlending
            });

            this._snowField = new THREE.PointCloud(geometry, snowMat);

            this._snowField.position.y = 500;
        }

        getField():THREE.PointCloud {
            return this._snowField;
        }

        setScroll(s:THREE.Vector2) {
            this._uniforms.scroll.value = s;
        }

        render() {
            this._uniforms.time.value += 0.001;
        }
    }

	export class Landscape extends webglExp.GLAnimation {
        private _scene: THREE.Scene;
        private _camera: THREE.PerspectiveCamera;
        private _renderer: THREE.WebGLRenderer;
        private _gui;

        private _ground: THREE.Mesh;

        private _uniforms;
        private _attributes;

        private _inEarthQuake: boolean;
        private _checkVal: number;
        private _checkDir: number;
        private _countFrames: number;

        private _bgCol: number[];

        private _keyControls: utils.GameKeyBoardControl;
        private _speedX: number;
        private _speedY: number;
        private _speedXToGo: number;
        private _speedYToGo: number;

        private _angleX: number;
        private _angleY: number;
        private _angleXToGo: number;
        private _angleYToGo: number;

        private _camBaseAngle: THREE.Vector2;

        private _snowField: webglExp.SnowField;

        private _composerLandscape:webglExp.EffectComposer;

        private _bumpComposer;
        private _bumpPass;

        private _lightScene: THREE.Scene;
        private _lightSphere: THREE.Mesh;
        private _planeBG: THREE.Mesh;


        private _scrollV:THREE.Vector2;
        private _scrollPond:THREE.Vector2;

        private _terrainSize: THREE.Vector2;


		constructor(scene:THREE.Scene, camera:THREE.PerspectiveCamera, renderer:THREE.WebGLRenderer, href?:string) {
			super(scene, camera, renderer);
            this._scene = scene;
            this._camera = camera;
            this._renderer = renderer;

            super.setInternalRender(true);

            this._scrollV = new THREE.Vector2(0);
            this._scrollPond = new THREE.Vector2(10, 10);

            // this._renderer.setClearColor(new THREE.Color(255, 255, 255));

            this._gui = super.getGui().get_gui();

            this._terrainSize = new THREE.Vector2(1920 * 3, 1920 * 3);


            var grassTexture: THREE.Texture = THREE.ImageUtils.loadTexture('../img/landscape/grass.jpg');
            grassTexture.wrapS = THREE.RepeatWrapping;
            grassTexture.wrapT = THREE.RepeatWrapping;

            var snowTexture: THREE.Texture = THREE.ImageUtils.loadTexture('../img/landscape/snow.jpg');
            snowTexture.wrapS = THREE.RepeatWrapping;
            snowTexture.wrapT = THREE.RepeatWrapping;

            var rockTexture: THREE.Texture = THREE.ImageUtils.loadTexture('../img/landscape/rock.jpg');
            rockTexture.wrapS = THREE.RepeatWrapping;
            rockTexture.wrapT = THREE.RepeatWrapping;

            var crackTexture: THREE.Texture = THREE.ImageUtils.loadTexture('../img/landscape/crack.jpg');
            crackTexture.wrapS = THREE.RepeatWrapping;
            crackTexture.wrapT = THREE.RepeatWrapping;

            this._bgCol = [0, 0, 0];

            var hFog = this._terrainSize.x * 0.4;

            this._uniforms = {

                bumpMat: {
                    type: 't',
                    value: null
                },
                time: {
                    type: 'f',
                    value: 0.0
                },
                width: {
                    type: 'f',
                    value: this._terrainSize.x
                },
                height: {
                    type: 'f',
                    value: this._terrainSize.y
                },
                avWSeg: {
                    type: 'f',
                    value: 0.0
                }, 
                uH: {
                    type: 'f',
                    value: 1.4
                }, 
                uLacunarity: {
                    type: 'f',
                    value: 2.0
                }, 
                avHSeg: {
                    type: 'f',
                    value: 0.0
                }, 
                noisePond: {
                    type: 'f',
                    value: 1141.0
                },
                noiseAspPond: {
                    type: 'f',
                    value: 153.0
                },
                heightVal: {
                    type: 'f',
                    value: 1412.0
                },
                heightAspVal: {
                    type: 'f',
                    value: 69.0
                },
                scroll: {
                    type: 'v2',
                    value: new THREE.Vector2(-300 + Math.random() * 600, -300 + Math.random() * 600)
                },
                fogRatio: {
                    type: 'f',
                    value: 0.8
                },
                maxDistSquare: {
                    type: 'f',
                    value: hFog * hFog + hFog * hFog
                },
                light: {
                    type: 'v3',
                    value: new THREE.Vector3(-1177, -295, 1029)
                },
                grass: {
                    type: 't',
                    value: grassTexture
                },
                snow: {
                    type: 't',
                    value: snowTexture
                },
                rock: {
                    type: 't',
                    value: rockTexture
                },
                crackPond: {
                    type: 'f',
                    value: 800.0
                },
                crack: {
                    type: 't',
                    value: crackTexture
                },
                repeatText: {
                    type: 'v2',
                    value: new THREE.Vector2(256, 256)
                },
                noiseFogPond: {
                    type: 'f',
                    value: 1000.0
                },
                noiseFogAlpha: {
                    type: 'f',
                    value: 0.6
                },
                bgCol: {
                    type: 'v3',
                    value: new THREE.Vector3(this._bgCol[0] / 255, this._bgCol[1] / 255, this._bgCol[2] / 255)
                }
            }

            var groundFolder = this._gui.addFolder('Ground');
            groundFolder.add(this._uniforms.heightVal, 'value', 1.0, 4000.0).name('heightVal');
            groundFolder.add(this._uniforms.crackPond, 'value', 400.0, 1000.0).name('crackPond');

            this._attributes = {
                
            }

            var planeGeom:THREE.BufferGeometry = this.createCustomPlaneGeometry(this._terrainSize.x, this._terrainSize.y);

            var planeMat: THREE.ShaderMaterial = new THREE.ShaderMaterial({
                vertexShader: SHADERLIST.ground.vertex,
                fragmentShader: SHADERLIST.ground.fragment,
                uniforms: this._uniforms,
                attributes: this._attributes,
                side: THREE.DoubleSide,
                transparent:true
            });


            this._ground = new THREE.Mesh(planeGeom, planeMat);
            this._ground.rotation.x = Math.PI / 2;
            this._ground.position.y = -1000;
            scene.add(this._ground);

            this._snowField = new webglExp.SnowField(this._terrainSize.x, this._terrainSize.y, this._gui);
            this._scene.add(this._snowField.getField());

            this._camera.position.z = 3000;
            camera.lookAt(this._ground.position);

            this._camBaseAngle = new THREE.Vector2(this._camera.rotation.x, this._camera.rotation.z);
            this._speedX = this._speedY = 0;
            this._speedXToGo = this._speedYToGo = 0;
            this._angleX = this._camBaseAngle.y;
            this._angleY = this._camBaseAngle.x;
            this._angleXToGo = this._camBaseAngle.y;
            this._angleYToGo = this._camBaseAngle.x;
            this._keyControls = new utils.GameKeyBoardControl(this.keydown, this.keyup);

            var lightFolder = this._gui.addFolder("Light Position");
            lightFolder.add(this._uniforms.light.value, 'x', -10000, 10000);
            lightFolder.add(this._uniforms.light.value, 'y', -10000, 10000);
            lightFolder.add(this._uniforms.light.value, 'z', -10000, 10000);

            this.setComposers();
            this.setComposerPasses();
		}

        setComposers() {
            var w: number = this._terrainSize.x / 4;
            var h: number = this._terrainSize.y / 4;

            var renderTargetParamsBumps = {    minFilter: THREE.LinearFilter,
                                                magFilter: THREE.LinearFilter, 
                                                format: THREE.RGBAFormat,
                                                stencilBuffer: false,
                                                depthBuffer: false };

            var rtbumps:THREE.WebGLRenderTarget = new THREE.WebGLRenderTarget(w, h, renderTargetParamsBumps);
            this._bumpComposer = new THREE.EffectComposer(this._renderer, rtbumps);
            this._uniforms.bumpMat.value = this._bumpComposer.renderTarget2;

            this._composerLandscape = new webglExp.EffectComposer(this._renderer, this._scene, this._camera, Scene3D.WIDTH, Scene3D.HEIGHT);

        } 

        setComposerPasses() {
            var bumpFolder = this._gui.addFolder('bumps');

            var copyPass = new THREE.ShaderPass(<any>THREE.CopyShader);

            // Bump map composer
            this._bumpPass = new THREE.ShaderPass( <any>THREE.BumpMapShader );
            
            bumpFolder.add(this._bumpPass.uniforms["noisePond"], 'value', 0.00001, 10000.0).name('noisePond');
            bumpFolder.add(this._bumpPass.uniforms["uH"], 'value', -4.0, 4.0).name('uH').step(0.05);
            bumpFolder.add(this._bumpPass.uniforms["uLacunarity"], 'value', 0.0, 5.0).name('uLacunarity').step(0.05);
            this._bumpComposer.addPass(this._bumpPass);
            this._bumpComposer.addPass(copyPass);



            // Render scenes
            var renderLandscape = new THREE.RenderPass(this._scene, this._camera);

            var copyPass2 = new THREE.ShaderPass(<any>THREE.CopyShader);
            copyPass2.renderToScreen = true;
            this._composerLandscape.addPass(renderLandscape);
            this._composerLandscape.addPass(copyPass2);
        }

        keydown = (key:string) => {
            switch (key) {
                case "up":
                     this._speedYToGo = 20;
                     this._angleYToGo = this._camBaseAngle.x - 0.05;
                    break;
                case "down":
                    this._speedYToGo = -20;
                     this._angleYToGo = this._camBaseAngle.x + 0.05;
                    break;
                case "left":
                    this._speedXToGo = -20;
                     this._angleXToGo = this._camBaseAngle.y + 0.1;
                    break;
                case "right":
                    this._speedXToGo = 20;
                     this._angleXToGo = this._camBaseAngle.y - 0.1;
                    break;
            }
        }

        keyup = (key:string) => {
            switch (key) {
                case "up":
                case "down":
                    this._speedYToGo = 0;
                    this._angleYToGo = this._camBaseAngle.x;
                    break;
                case "left":
                case "right":
                    this._speedXToGo = 0;
                    this._angleXToGo = this._camBaseAngle.y;
                    break;
            }
        }

        createCustomPlaneGeometry(w:number, h:number):THREE.BufferGeometry {
            var vW: number = 400;
            var vH: number = 400;
            var vW1: number = vW + 1;
            var vH1: number = vH + 1;

            var vPos: number[][] = [];

            var widthHalf: number = w / 2;
            var heightHalf: number = h / 2;

            var wGap: number = w / vW;
            var hGap: number = h / vH;

            this._uniforms.avWSeg.value = wGap * 1.1;
            this._uniforms.avHSeg.value = hGap * 1.1;

            var vertices = new Float32Array( vW1 * vH1 * 3 );
            var uvs = new Float32Array( vW1 * vH1 * 2 );

            var offset = 0;
            var offset2 = 0;
            var vy: number;
            for (var y = 0; y < vH1; ++y) {
                vy = -heightHalf + y * hGap - hGap * 0.5 + Math.random() * hGap;
                for (var x = 0; x < vW1; ++x) {
                    var vx = -widthHalf + x * wGap - wGap * 0.5 + Math.random() * wGap;
                    vertices[ offset   ] = vx;
                    vertices[offset + 1] = -vy;

                    uvs[ offset2     ] = (vx + widthHalf) / w;
                    uvs[ offset2 + 1 ] = 1 - ( (vy + heightHalf) / h );

                    offset += 3;
                    offset2 += 2;
                }
            }
            
            offset = 0;

            var indices = new ( ( vertices.length / 3 ) > 65535 ? Uint32Array : Uint16Array )( vW * vH * 6 );

            for ( var iy = 0; iy < vH; iy ++ ) {

                for ( var ix = 0; ix < vW; ix ++ ) {

                    var a = ix + vW1 * iy;
                    var b = ix + vW1 * ( iy + 1 );
                    var c = ( ix + 1 ) + vW1 * ( iy + 1 );
                    var d = ( ix + 1 ) + vW1 * iy;

                    indices[ offset     ] = a;
                    indices[ offset + 1 ] = b;
                    indices[ offset + 2 ] = d;

                    indices[ offset + 3 ] = b;
                    indices[ offset + 4 ] = c;
                    indices[ offset + 5 ] = d;

                    offset += 6;

                }

            }


 
            var planeGeom: THREE.BufferGeometry = new THREE.BufferGeometry();

            planeGeom.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) );
            planeGeom.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
            planeGeom.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

            return planeGeom;
        }

		render() {

            this._uniforms.time.value += 0.01;

            this._speedX += (this._speedXToGo - this._speedX) * 0.1;
            this._speedY += (this._speedYToGo - this._speedY) * 0.1;

            this._uniforms.scroll.value.y -= this._speedY;
            this._uniforms.scroll.value.x += this._speedX;

            var xscroll: number = this._uniforms.scroll.value.x / (this._terrainSize.x);
            var yscroll: number = this._uniforms.scroll.value.y / (this._terrainSize.y);

            this._bumpPass.uniforms['scroll'].value.set(xscroll, yscroll);

            this._snowField.setScroll(this._uniforms.scroll.value);
            this._snowField.render();
            this._camera.rotation.x = this._angleY;
            this._camera.rotation.z = this._angleX;
            this._angleX += (this._angleXToGo - this._angleX) * 0.1;
            this._angleY += (this._angleYToGo - this._angleY) * 0.1;

            if(this._inEarthQuake) {
                this._camera.position.x = this._checkVal * this._checkDir * 50;
                if(this._countFrames%3 === 0) this._checkDir *= -1;
                this._countFrames++;
            }

            this._bumpComposer.render();
            this._composerLandscape.getComposer().render();

			super.render();
		}

        resize() {
            super.resize();
            this._bumpComposer.setSize(this._terrainSize.x / 4, this._terrainSize.y / 4);
            this._uniforms.bumpMat.value = this._bumpComposer.renderTarget2;

            this._composerLandscape.getComposer().setSize(Scene3D.WIDTH, Scene3D.HEIGHT);
        }
	}
}

var siteReady = function(scene3d:webglExp.Scene3D) {
	var anim = new webglExp.Landscape(scene3d.getScene(), scene3d.getCamera(), scene3d.getRenderer());
	scene3d.setAnim(anim);
}

document.addEventListener("DOMContentLoaded", function(event) { 
  var s = new webglExp.Site(siteReady);
});