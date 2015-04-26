/// <reference path="../../../../typings/threejs/three.d.ts" />

module webglExp {

	export class ThreeToDom {

		public middlePos:THREE.Vector2;

		private camera:THREE.PerspectiveCamera;

		private obj:THREE.Mesh;
		private el:HTMLElement;
		private enabled:boolean;

		private projScreenMat:THREE.Matrix4;
		private scale:THREE.Vector2;
		private box:THREE.Box3;

		constructor(camera:THREE.PerspectiveCamera, obj:THREE.Mesh, el:HTMLElement) {
			this.camera = camera;
			this.obj = obj;
			this.el = el;
			this.enabled = true;
			this.scale = new THREE.Vector2(1, 1);
			this.box = new THREE.Box3();
			this.middlePos = new THREE.Vector2();

            this.projScreenMat = new THREE.Matrix4();

		}

		enable() {
			this.enabled = true;
			this.el.style.display = "block";
		}

		disable() {
			this.enabled = false;
			this.el.style.display = 'none';
		}

		checkFaceCamera():boolean {
			var q:THREE.Quaternion = new THREE.Quaternion();

			var planeVector:THREE.Vector3 = (new THREE.Vector3( 0, 0, 1 )).applyQuaternion(this.obj.getWorldQuaternion());
			var cameraVector:THREE.Vector3 = (new THREE.Vector3( 0, 0, -1 )).applyQuaternion(this.camera.quaternion);

			if(planeVector.angleTo(cameraVector) <= Math.PI/2) return true;
			return false;
		}

		updatePosition(disableFaceTest?:boolean) {
			if(!this.enabled) return;
			this.box.setFromObject(this.obj);
			
			var minPoint:THREE.Vector3 = this.box.min;
			var maxPoint:THREE.Vector3 = this.box.max;
			minPoint = minPoint.project(this.camera);
			maxPoint = maxPoint.project(this.camera);
			var stageWidth:number = document.getElementById("canvas3D").offsetWidth;
			var stageHeight:number = document.getElementById("canvas3D").offsetHeight;

			minPoint.x = ( minPoint.x + 1 ) / 2 * stageWidth;
			minPoint.y = ( -minPoint.y + 1 ) / 2 * stageHeight;
			maxPoint.x = ( maxPoint.x + 1 ) / 2 * stageWidth;
			maxPoint.y = ( -maxPoint.y + 1 ) / 2 * stageHeight;

			var w:number = (maxPoint.x - minPoint.x)
			var h:number = (minPoint.y - maxPoint.y);
			var middle:THREE.Vector2 = new THREE.Vector2(minPoint.x, maxPoint.y);

			if(disableFaceTest || this.checkFaceCamera()) {
				this.el.style.display = "block";
			} else {
				this.el.style.display = "none";
			}

			this.el.style.width = 	w + "px";
			this.el.style.height = 	h + "px";

            this.el.style.left = 	middle.x + "px";
            this.el.style.top = 	middle.y + "px";

            this.middlePos.set(middle.x + w, middle.y + h / 2);

        }
	}

}