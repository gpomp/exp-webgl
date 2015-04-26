/// <reference path="../../../../typings/threejs/three.d.ts" />
/// <reference path="Gui.ts" />
/// <reference path="../helper/ThreeAddOns.ts" />

module webglExp {
	export class GLAnimation {
		public static SHADERLIST;

		public static ON_LEAVE_ANIMATION:string = "on_leave_animation";

		private id:string;

		private scene:THREE.Scene;
		private camera:THREE.PerspectiveCamera;
		private renderer:THREE.WebGLRenderer;

		private gui:webglExp.Gui;

		private isCameraAround:boolean;
		private camCenter:THREE.Vector3;
		private diff:number;

		private isTurning:boolean;

		public ctn:THREE.Object3D;

		private mouseSpeed:number;
		private mousePos:THREE.Vector2;

		private internalRender:boolean;

		private controls:THREE.MouseControls;

		private leaveEvent:CustomEvent;



		constructor(scene:THREE.Scene, camera:THREE.PerspectiveCamera, renderer:THREE.WebGLRenderer, href?:string) {
			this.scene = scene;
			this.camera = camera;
			this.renderer = renderer;
			this.gui = webglExp.Gui.gui;
			this.ctn = new THREE.Object3D();
			this.scene.add(this.ctn);
			this.leaveEvent = webglExp.Tools.createCustomEvent(webglExp.GLAnimation.ON_LEAVE_ANIMATION);
		}

		render() {

			if(this.isCameraAround && this.controls.enabled) {
				this.controls.update();
			}
		}

		public getScene():THREE.Scene {
			return this.scene;
		}

		public getCamera():THREE.PerspectiveCamera {
			return this.camera;
		}

		public getRenderer():THREE.WebGLRenderer {
			return this.renderer;
		}

		public getGui():webglExp.Gui {
			return this.gui;
		}

		public getMouseSpeed():number {
			return this.mouseSpeed;
		}

		public setInternalRender(b:boolean) {
			this.internalRender = b;
		}

		public getInternalRender():boolean {
			return this.internalRender;
		}

		public getLeaveEvent():CustomEvent {
			return this.leaveEvent;
		}

		public getIsTurning():boolean {
			return this.isCameraAround;
		}

		public getID():string {
			return this.id;
		}

		public setID(s:string) {
			this.id = s;
		}

		public getControl():THREE.MouseControls {
			return this.controls;
		}

		public disableCameraAround(interactiveEl:HTMLElement) {
			this.isCameraAround = false;

			interactiveEl.removeEventListener('mousedown', this.turnAround);
			interactiveEl.removeEventListener('mouseup', this.stopTurning);
			interactiveEl.removeEventListener('touchstart', this.turnAround);
			interactiveEl.removeEventListener('touchend', this.stopTurning);

			this.controls.clear();
		}

		public enableCameraAround(object:THREE.Object3D, interactiveEl:HTMLElement) {
			this.isCameraAround = true;
			this.controls = new THREE.MouseControls(object);
			interactiveEl.addEventListener('mousedown', this.turnAround);
			interactiveEl.addEventListener('mouseup', this.stopTurning);

			interactiveEl.addEventListener('touchstart', this.turnAround);
			interactiveEl.addEventListener('touchend', this.stopTurning);

		}

		public setCamCenter(c:THREE.Vector3) {
			this.camCenter.set(c.x, c.y, c.z);
		}

		public resize() {
			
		}

		public clear() {
			for (var i = this.scene.children.length - 1; i >= 0; i--) {
				if(this.scene.children[i] === this.camera) {console.log("camera stay"); continue;}
			 	this.scene.remove(this.scene.children[i]);
			}
		}

		private turnAround  = (event) => {
			if(!this.isCameraAround) return;
			this.controls.enabled = true;
		}

		private stopTurning  = (event) => {
			this.controls.enabled = false;
			
		}
	}

}