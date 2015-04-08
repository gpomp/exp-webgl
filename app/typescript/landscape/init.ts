/// <reference path="../../../typings/threejs/three.d.ts" />
/// <reference path="../definitions/core/GLAnimation.d.ts" />
/// <reference path="../definitions/Site.d.ts" />

declare var SHADERLIST;

module webglExp {
	export class CubeExample extends webglExp.GLAnimation {
        private _scene: THREE.Scene;
        private _camera: THREE.PerspectiveCamera;
        private _renderer: THREE.WebGLRenderer;


		constructor(scene:THREE.Scene, camera:THREE.PerspectiveCamera, renderer:THREE.WebGLRenderer, href?:string) {
			super(scene, camera, renderer);
            this._scene = scene;
            this._camera = camera;
            this._renderer = renderer;

            var planeMat: THREE.ShaderMaterial = new THREE.ShaderMaterial({
                vertexShader:   SHADERLIST.plane.vertex,
                fragmentShader: SHADERLIST.plane.fragment,
                side:THREE.DoubleSide
            })
            var planeGeom: THREE.PlaneBufferGeometry = new THREE.PlaneBufferGeometry(100, 100);
            var mesh: THREE.Mesh = new THREE.Mesh(planeGeom, planeMat);
            scene.add(mesh);
            camera.lookAt(mesh.position);
		}


		render() {
			super.render();
		}

        resize() {
            super.resize();
        }
	}
}

var siteReady = function(scene3d:webglExp.Scene3D) {
	var anim = new webglExp.CubeExample(scene3d.getScene(), scene3d.getCamera(), scene3d.getRenderer());
	scene3d.setAnim(anim);
}

document.addEventListener("DOMContentLoaded", function(event) { 
  var s = new webglExp.Site(siteReady);
});