/// <reference path="../../../../typings/threejs/three.d.ts" />
/// <reference path="Gui.ts" />


module webglExp {
	export class EffectComposer {

		private renderer:THREE.WebGLRenderer;
		private camera:THREE.PerspectiveCamera;
		private scene:THREE.Scene;
		private width:number;
		private height:number;

		private composer;
		private rt:THREE.WebGLRenderTarget;

		public effectBloom;
		public bloomStrength;

		public folder;

		constructor(renderer:THREE.WebGLRenderer, scene:THREE.Scene, camera:THREE.PerspectiveCamera, width:number, height:number) {
			
			this.renderer = renderer;
			this.scene = scene;
			this.camera = camera;
			this.width = width;
			this.height = height;

			var renderTargetParams = {	minFilter: THREE.LinearFilter,
        								magFilter: THREE.LinearFilter, 
        								format: THREE.RGBAFormat,
        								stencilBuffer: false  };

			this.rt = new THREE.WebGLRenderTarget(this.width, this.height, renderTargetParams);
			
			this.composer = new THREE.EffectComposer(this.renderer, this.rt);

		}

		addPass(p) {
			this.composer.addPass(p);
		}

		reset() {
			this.composer.reset(this.rt);
			this.composer.passes = [];
		}

		getComposer() {
			return this.composer;
		}

		getRenderTarget():THREE.WebGLRenderTarget {
			return this.rt;
		}

	}

}