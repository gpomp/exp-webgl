/// <reference path="../../../typings/threejs/three.d.ts" />
/// <reference path="../definitions/core/GLAnimation.d.ts" />
/// <reference path="../definitions/Site.d.ts" />

declare var SHADERLIST;

module webglExp {
	export class CubeExample extends webglExp.GLAnimation {
        private _scene: THREE.Scene;
        private _camera: THREE.PerspectiveCamera;
        private _renderer: THREE.WebGLRenderer;

        private _swarm: THREE.PointCloud;


		constructor(scene:THREE.Scene, camera:THREE.PerspectiveCamera, renderer:THREE.WebGLRenderer, href?:string) {
			super(scene, camera, renderer);
            this._scene = scene;
            this._camera = camera;
            this._renderer = renderer;

            var pcMat: THREE.ShaderMaterial = new THREE.ShaderMaterial({
                vertexShader: SHADERLIST.pointcloud.vertex,
                fragmentShader: SHADERLIST.pointcloud.fragment,
                side: THREE.DoubleSide
            });

            var geom: THREE.Geometry = new THREE.Geometry();

            for (var i = 0; i < 10000; ++i) {
                geom.vertices.push(new THREE.Vector3(0, 0, 0));
            }

            this._swarm = new THREE.PointCloud(geom, pcMat);

            this._scene.add(this._swarm);
            this._camera.lookAt(this._swarm.position);
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