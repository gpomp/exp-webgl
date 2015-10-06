/// <reference path="../../../typings/threejs/three.d.ts" />
/// <reference path="../definitions/core/GLAnimation.d.ts" />
/// <reference path="../definitions/Site.d.ts" />
/// <reference path="../definitions/helper/ThreeAddOns.d.ts" />

declare var SHADERLIST;

module webglExp {

    export class Hair {

        static HAIRLENGTH: number = 100;
        static POINT_NB: number = 20;

        private _radius: number;
        private _line: THREE.Line;

        constructor(lat: number, lng: number, rad: number) {
            this._radius = rad;
            var r: number = this._radius;

            

            var geom: THREE.BufferGeometry = new THREE.BufferGeometry();
            var vertices = new Float32Array( Hair.POINT_NB * 3 );

            var offset: number = 0;
            var hashRad: number = Hair.HAIRLENGTH / Hair.POINT_NB;

            for (var i = 0; i < Hair.POINT_NB; ++i) {
                vertices[offset + 0] = r * Math.cos(lat) * Math.cos(lng);
                vertices[offset + 1] = r * Math.cos(lat) * Math.sin(lng);
                vertices[offset + 2] = r * Math.sin(lat);

                r += hashRad;
                offset += 3;
            }

            geom.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

            var mat: THREE.LineBasicMaterial = new THREE.LineBasicMaterial({ color: 0xFF0000 });

            this._line = new THREE.Line(geom, mat);

        }

        getLine():THREE.Line {
            return this._line;
        }
    }

	export class HairyBall extends webglExp.GLAnimation {
        static RADIUS: number = 100;


        private _scene: THREE.Scene;
        private _camera: THREE.PerspectiveCamera;
        private _renderer: THREE.WebGLRenderer;

        private _container: THREE.Object3D;

        private _mouseControls: THREE.MouseControls;


		constructor(scene:THREE.Scene, camera:THREE.PerspectiveCamera, renderer:THREE.WebGLRenderer, href?:string) {
			super(scene, camera, renderer);
            this._scene = scene;
            this._camera = camera;
            this._renderer = renderer;

            this._container = new THREE.Object3D();
            this._scene.add(this._container);

            var planeMat: THREE.ShaderMaterial = new THREE.ShaderMaterial({
                vertexShader:   SHADERLIST.plane.vertex,
                fragmentShader: SHADERLIST.plane.fragment,
                side:THREE.DoubleSide
            })
            var planeGeom: THREE.SphereGeometry = new THREE.SphereGeometry(HairyBall.RADIUS, 10, 10);
            var mesh: THREE.Mesh = new THREE.Mesh(planeGeom, planeMat);
            this._container.add(mesh);
            camera.lookAt(mesh.position);

            var nbLines: number = 60;

            for (var i = 0; i < nbLines; ++i) {
                var phi = Math.acos(-1 + ( 2 * i ) / (nbLines));

                var theta = Math.sqrt((nbLines) * (Math.PI * 2)) * phi;

                var hair: webglExp.Hair = new webglExp.Hair(theta, phi, HairyBall.RADIUS);
                this._container.add(hair.getLine());
            }

            this._mouseControls = new THREE.MouseControls(this._container);
            this._mouseControls.enabled = true;
		}


		render() {
			super.render();

            this._mouseControls.update();
		}

        resize() {
            super.resize();
        }
	}
}

var siteReady = function(scene3d:webglExp.Scene3D) {
	var anim = new webglExp.HairyBall(scene3d.getScene(), scene3d.getCamera(), scene3d.getRenderer());
	scene3d.setAnim(anim);
}

document.addEventListener("DOMContentLoaded", function(event) { 
  var s = new webglExp.Site(siteReady);
});