/// <reference path="../../../../typings/threejs/three.d.ts" />
/// <reference path="GLAnimation.ts" />
/// <reference path="EffectComposer.ts" />
/// <reference path="../helper/ShaderLoader.ts" />

module webglExp {
	export class Scene3D {

		public static ASPECT:number;
		public static FAR:number;
		public static NEAR:number;
		public static VIEW_ANGLE:number;

		public static WIDTH:number;
		public static HEIGHT:number;

		private renderer:THREE.WebGLRenderer;
		private camera:THREE.PerspectiveCamera;
		private scene:THREE.Scene;

		private gui:webglExp.Gui;
		private stats:webglExp.PerfStats;

		private currentAnim:webglExp.GLAnimation;

		private shaderLoadedCB:Function;
		private scroll:THREE.Vector2;
		private frame:number;

		private body:HTMLElement;

        private _resolution: number;

		constructor(shaderLoadedCB:Function) {
			this.shaderLoadedCB = shaderLoadedCB;
			this.shaderLoaded('');
		}

		shaderLoaded = (data) => {
            this._resolution = 1;
			console.log("SCENE3D:shaderLoaded");
			webglExp.GLAnimation.SHADERLIST = data;
			Scene3D.WIDTH = window.innerWidth / this._resolution;
	      	Scene3D.HEIGHT = window.innerHeight / this._resolution; 

	      	Scene3D.VIEW_ANGLE = 45;
	      	Scene3D.ASPECT = Scene3D.WIDTH / Scene3D.HEIGHT;
	      	Scene3D.NEAR = 0.1;
	      	Scene3D.FAR = 10000;

	      	this.gui = webglExp.Gui.gui;
	      	this.stats = new webglExp.PerfStats();
	      	
			this.renderer = new THREE.WebGLRenderer({devicePixelRatio: 1, autoClear:true, alpha: true});
			this.camera = new THREE.PerspectiveCamera(Scene3D.VIEW_ANGLE, Scene3D.ASPECT, Scene3D.NEAR, Scene3D.FAR);
			this.scene = new THREE.Scene();
			this.scene.add(this.camera);
			this.camera.name = "mainCamera";

			this.camera.position.z = 1000;

			this.scroll = new THREE.Vector2();
			this.frame = 0;

			this.renderer.setSize(Scene3D.WIDTH,Scene3D.HEIGHT);

			document.getElementById("three-canvas").appendChild(this.renderer.domElement);
            this.renderer.domElement.setAttribute('id', 'canvas3D');
            this.renderer.domElement.style.width = window.innerWidth + "px";
			this.renderer.domElement.style.height = window.innerHeight + "px";
			document.addEventListener(webglExp.GLAnimation.ON_LEAVE_ANIMATION,this.leaveAnimation);

			this.currentAnim = null;
			
			this.render();

			this.shaderLoadedCB(this);

            // document.getElementById('switch-resolution').addEventListener('click', this.swithResolution);

            window.setTimeout(this.checkPerf, 5000);
		}

        /*swithResolution = (event:MouseEvent) => {
            event.preventDefault();
            this._resolution = (this._resolution === 1) ? 1.5 : 1;
            if(this._resolution === 1) {
                document.getElementById('switch-resolution').classList.add('high');
            } else {
                document.getElementById('switch-resolution').classList.remove('high');
            }

            this.resize();
        } */

		getScene():THREE.Scene {
			return this.scene;
		}

		getCamera():THREE.PerspectiveCamera {
			return this.camera;
		}

		getRenderer():THREE.WebGLRenderer {
			return this.renderer;
		}

		setAnim(a:webglExp.GLAnimation) {
			this.currentAnim = a;
		}

		render = () => {
			requestAnimationFrame(this.render);
			this.stats.begin();
			if(this.currentAnim !== null) {
				if(!this.currentAnim.getInternalRender()) {
					this.renderer.render(this.scene, this.camera);
				}

				this.currentAnim.render();
			}
			
			this.stats.end();
		}

		checkPerf = () => {
            var t: string = (<HTMLElement>document.getElementById('stats').querySelector('#fpsText')).textContent;
            var fps = parseInt(t.split(' FPS')[0]);

            if(this._resolution < 1.6 && fps < 30) {
                this._resolution += 0.1;
                this.resize();
                window.setTimeout(this.checkPerf, 2000);
            }

            console.log('fps', fps, this._resolution);


            
		}

		leaveAnimation = (event:CustomEvent) => {
			this.currentAnim.clear();
			this.currentAnim = null;
			this.gui.clear();
			
		}
		

		resize() {
			Scene3D.WIDTH = window.innerWidth / this._resolution;
	      	Scene3D.HEIGHT = window.innerHeight / this._resolution;

			this.camera.aspect = Scene3D.WIDTH / Scene3D.HEIGHT;
		    this.camera.updateProjectionMatrix();

		    this.renderer.setSize( Scene3D.WIDTH, Scene3D.HEIGHT );
            this.renderer.domElement.style.width = window.innerWidth + "px";
            this.renderer.domElement.style.height = window.innerHeight + "px";

		    this.currentAnim.resize();
		}
	}
}