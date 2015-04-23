/// <reference path="../../../typings/threejs/three.d.ts" />
/// <reference path="../definitions/core/GLAnimation.d.ts" />
/// <reference path="../definitions/helper/Utils.d.ts" />
/// <reference path="../../../typings/greensock/greensock.d.ts" />
/// <reference path="../definitions/Site.d.ts" />

declare var SHADERLIST;
declare var voronoi;

module webglExp {

    export class SplitPlane {

        private _w: number;
        private _h: number;
        private _ptNB: number;

        private _ptList: number[][];

        private _vorCells: number[][];
        private _vorPos: number[][];

        private _objectList: THREE.Mesh[];

        private _dummy: number;

        private _material: THREE.ShaderMaterial;
        private _uniforms;
        private _attributes;

        private _v2c: utils.Video2Canvas;

        constructor(w: number, h: number, v2c:utils.Video2Canvas) {
            this._w = w;
            this._h = h;

            this._v2c = v2c;

            this._dummy = 0;

            this._ptNB = 64;

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
            })
 
            for (var i = 0; i < this._vorCells.length; ++i) {
                var geom: THREE.Geometry = this.createCellGeometry(this._vorCells[i]);
                if (geom === null) continue;
                var mesh: THREE.Mesh = new THREE.Mesh(geom, this._material);
                this._objectList.push(mesh);
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
                    this._objectList[i].position.z = -50 + this._v2c.dArray[soundLoc] * 400;
                    // this._objectList[i].rotation.y = -Math.PI / 4 + -1 * this._v2c.dArray[soundLoc] * Math.PI / 8;
                }
            }
        }
    }

	export class MusicVideo2 extends webglExp.GLAnimation {
        private _scene: THREE.Scene;
        private _camera: THREE.PerspectiveCamera;
        private _renderer: THREE.WebGLRenderer;

        private _objectList: webglExp.SplitPlane[];

        private _ambiantLight: THREE.AmbientLight;
        private _dirLight: THREE.DirectionalLight;

        private _pointLight: THREE.PointLight;

        private _v2c: utils.Video2Canvas;


		constructor(scene:THREE.Scene, camera:THREE.PerspectiveCamera, renderer:THREE.WebGLRenderer, href?:string) {
			super(scene, camera, renderer);
            this._scene = scene;
            this._camera = camera;
            this._renderer = renderer;

            this._pointLight = new THREE.PointLight(0xffffff, 1.0, 800);
            this._pointLight.position.set(0.0,0.0, 600.0);
            this._scene.add(this._pointLight);   

            this._v2c = new utils.Video2Canvas(this.audioLoaded, true);

            this._objectList = [];
            this._objectList.push(new webglExp.SplitPlane(512, 512, this._v2c));

            var l: THREE.Mesh[] = this._objectList[0].getObjects();

            for (var i = 0; i < l.length; ++i) {
                this._scene.add(l[i]);
            }

            // this._objectList[0].move();
            this._camera.position.set(0, 0, 600);
            this._camera.lookAt(new THREE.Vector3(0));
		}

        audioLoaded = () => {

        }


		render() {
			super.render();

            for (var i = 0; i < this._objectList.length; ++i) {
                this._objectList[i].render();
            }
		}

        resize() {
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