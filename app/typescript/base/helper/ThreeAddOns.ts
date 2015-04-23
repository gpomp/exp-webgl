/// <reference path="../../../../typings/threejs/three.d.ts" />
/// <reference path="../Site.ts" />
/// <reference path="../core/Scene3D.ts" />

module webglExp {

	export class MouseSpeed {

		public distSquared:number;

		private mousePosX:number;
		private mousePosY:number;
		private ratio:number;

		constructor(ratio:number = 1) {
			this.mousePosX = -1;
			this.mousePosY = -1;
			this.distSquared = 0;
			this.ratio = ratio;
		    document.addEventListener("mousemove",this.mousemove);
		}

		mousemove = (event:MouseEvent) => {
			if(this.mousePosX < 0) {
				this.mousePosX = event.clientX;
				this.mousePosY = event.clientY;
			} else {
				var mx:number = event.clientX;
				var my:number = event.clientY;
				var diffX:number = this.mousePosX - mx;
				var diffY:number = this.mousePosY - my;
				this.distSquared = Math.abs(diffX * diffX + diffY * diffY) * this.ratio;

				this.mousePosX = mx;
				this.mousePosY = my;
			}
		}
	}

	export class Tools {
		constructor() {

		}

		public static createCustomEvent(name:string):CustomEvent {
			var event;
			if (typeof CustomEvent === 'function') {
				var customEvent = <any>CustomEvent;
  				event = new customEvent(<any>name);
			} else {
				event = document.createEvent('CustomEvent');
			}
  			
  			event.initCustomEvent(name, true, true, {detail : {}});

			return <CustomEvent>event;
		}

		public static getVertexNB(nb:number):number {
			if(Site.activeDeviceType === 'touch') return Math.max(1, Math.floor(nb / 3));
			return nb;
		}
	}
}

module THREE {
	export class BlendShader {
        static uniforms = {

            "tBackground":     { type: "t", value: null },
            "tDiffuse1":     { type: "t", value: null },
            "tDiffuse2":     { type: "t", value: null },
            "tDiffuse3":     { type: "t", value: null },
            "mixRatio":      { type: "f", value: 0.5 },
            "opacity":       { type: "f", value: 1.0 }

        };

        static vertexShader = [

            "varying vec2 vUv;",

            "void main() {",

                "vUv = uv;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

            "}"

        ].join("\n");

        static fragmentShader = [

            "uniform float opacity;",
            "uniform float mixRatio;",

            "uniform sampler2D tBackground;",
            "uniform sampler2D tDiffuse1;",
            "uniform sampler2D tDiffuse2;",
            "uniform sampler2D tDiffuse3;",

            "varying vec2 vUv;",

            "vec4 textOnTop(vec4 sceneColor, vec4 addColor) {",
                "return mix(sceneColor, addColor, addColor.a);",
            "}",

            "void main() {",

                "vec4 texel0 = texture2D( tBackground, vUv );",
                "vec4 texel1 = texture2D( tDiffuse1, vUv );",
                "vec4 texel2 = texture2D( tDiffuse2, vUv );",
                "vec4 texel3 = texture2D( tDiffuse3, vUv );",
                "vec4 cbg = textOnTop(texel0, texel1);",
                "vec4 cbg1 = cbg + texel2;",
                "vec4 cbg2 = textOnTop(cbg1, texel3);",
                "gl_FragColor = vec4(cbg2);",
            "}"

        ].join("\n");
    }

	export class CopyOneShader {
		static uniforms = {

			"tBackground": 	{ type: "t", value: null }

		};

		static vertexShader = [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n");

		static fragmentShader = [

			"uniform sampler2D tBackground;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 texel0 = texture2D( tBackground, vUv );",
				"gl_FragColor = vec4(vec3(texel0.rgb), 0.0);",
			"}"

		].join("\n");
	}
}

declare module THREE {
	export class HorizontalBlurShader{}
	export class VerticalBlurShader{}
	export class FXAAShader{}
    export class ShaderPass {
        public uniforms;
        public renderToScreen;
        constructor(...args: any[])
    }
    export class RenderPass {

        constructor(...args: any[])
    }
    export class BloomPass {
        public static blurX;
        public static blurY;
        public copyUniforms;
        constructor(strength, kernelSize, sigma, resolution, maskActive)
    }
	export class EffectComposer {

		constructor(...args: any[])
	}
}


var TheMath = Math;
module THREE {

    export class Mouse2DControls {

        private _object: THREE.Object3D[];
        private lastPos:THREE.Vector2;

        private _pos: THREE.Vector2;
        private _currPos: THREE.Vector2;

        private _enabled: boolean;

        constructor(object:THREE.Object3D[]) {
            this._object = object;

            this._enabled = false;

            this.lastPos = new THREE.Vector2(0);
            this._pos = new THREE.Vector2(0);
            this._currPos = new THREE.Vector2(0);

            document.addEventListener( 'mousedown', this.onMouseDown, false );
            document.addEventListener( 'mouseup', this.onMouseUp, false );
            document.addEventListener( 'mousemove', this.onMouseMove, false );

            document.addEventListener( 'touchstart', this.onMouseDown );
            document.addEventListener( 'touchend', this.onMouseUp );
            document.addEventListener( 'touchmove', this.onMouseMove );
        }

        onMouseDown = (event) => {
            if ( this._enabled === false ) return;
            var t = (event.touches && event.touches.length > 0) ? event.touches[0] : event;
            this.lastPos = new THREE.Vector2(t.clientX, t.clientY);
            (<HTMLElement>document.querySelectorAll("body").item(0)).classList.add("drag");
        }

        onMouseUp = (event) => {
            if ( this._enabled === false ) return;
            (<HTMLElement>document.querySelectorAll("body").item(0)).classList.remove("drag");
        }

        onMouseMove = (event) => {            

            if ( this._enabled === false ) return;

            var t = (event.touches && event.touches.length > 0) ? event.touches[0] : event;

            
            this.lastPos.set(t.clientX, t.clientY);
        }

        transformCoordinates(v:THREE.Vector2):THREE.Vector2 {
            var hw: number = webglExp.Scene3D.WIDTH * .5;
            var hh: number = webglExp.Scene3D.HEIGHT * .5; 

            return new THREE.Vector2((v.x - hw) / hw, (v.y - hh) / hh);
        }

        toggleEnable(b:boolean) {
            this._enabled = b;
        }

        render() {
            if ( this._enabled === false ) return;
            var coord: THREE.Vector2 = this.transformCoordinates(this.lastPos);
            this._pos.x += (coord.x - this._pos.x) * 0.1;
            this._pos.y += (coord.y - this._pos.y) * 0.1;


            for (var i = 0; i < this._object.length; ++i) {
                this._object[i].rotation.y = this._pos.x;
                this._object[i].rotation.x = this._pos.y;
            }
            // this._object.rotation.x = this._pos.y * (TheMath.PI / 0.0005);
        }
    }

	export class MouseControls {

		public enabled;

	  	public orientation;

	  	private PI_2:number;
	  	private mouseQuat;
	  	private object; 
	  	private xVector;
	  	private yVector;
	  	public oldOr:THREE.Vector2;

	  	private lastPos:THREE.Vector2;

		constructor(object:THREE.Object3D) {
			this.enabled = false;
			this.orientation = {
			    x: 0,
			    y: 0,
		  	};

		  	this.PI_2 = TheMath.PI / 2;
		  	this.mouseQuat = {
			    x: new THREE.Quaternion(),
			    y: new THREE.Quaternion()
		  	};
		  	this.object = object;
		  	this.xVector = new THREE.Vector3( 1, 0, 0 );
		  	this.yVector = new THREE.Vector3( 0, 1, 0 );

		  	this.oldOr = new THREE.Vector2();


		  	document.addEventListener( 'mousedown', this.onMouseDown, false );
		  	document.addEventListener( 'mouseup', this.onMouseUp, false );
		  	document.addEventListener( 'mousemove', this.onMouseMove, false );

		  	document.addEventListener( 'touchstart', this.onMouseDown );
		  	document.addEventListener( 'touchend', this.onMouseUp );
		  	document.addEventListener( 'touchmove', this.onMouseMove );
		}

		clear() {
			document.removeEventListener( 'mousedown', this.onMouseDown, false );
		  	document.removeEventListener( 'mouseup', this.onMouseUp, false );
		  	document.removeEventListener( 'mousemove', this.onMouseMove, false );

		  	document.removeEventListener( 'touchstart', this.onMouseDown );
		  	document.removeEventListener( 'touchend', this.onMouseUp );
		  	document.removeEventListener( 'touchmove', this.onMouseMove );
		  	(<HTMLElement>document.querySelectorAll("body").item(0)).classList.remove("drag");
		}

		onMouseDown = (event) => {
			var t = (event.touches && event.touches.length > 0) ? event.touches[0] : event;
			this.lastPos = new THREE.Vector2(t.clientX, t.clientY);
			(<HTMLElement>document.querySelectorAll(".drag-instruction").item(0)).classList.remove("show");
			(<HTMLElement>document.querySelectorAll("body").item(0)).classList.add("drag");
		}

		onMouseUp = (event) => {
			(<HTMLElement>document.querySelectorAll("body").item(0)).classList.remove("drag");
		}

		onMouseMove = (event) => {			if ( this.enabled === false ) return;

			var t = (event.touches && event.touches.length > 0) ? event.touches[0] : event;

		    var orientation = this.orientation;

		    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || t.clientX - this.lastPos.x || 0;
		    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || t.clientY - this.lastPos.y || 0;

		    orientation.y += movementX * 0.0025;
		    orientation.x += movementY * 0.0025;

		    orientation.x = TheMath.max( - this.PI_2, TheMath.min( this.PI_2, orientation.x ) );
			this.lastPos.set(t.clientX, t.clientY);
		}

		update() {

	    	this.oldOr.x += (this.orientation.x - this.oldOr.x) * 0.4;
	    	this.oldOr.y += (this.orientation.y - this.oldOr.y) * 0.4;

	    	this.mouseQuat.x.setFromAxisAngle( this.xVector, this.oldOr.x );
	    	this.mouseQuat.y.setFromAxisAngle( this.yVector, this.oldOr.y );
	    	

	    	this.object.quaternion.copy(this.mouseQuat.y).multiply(this.mouseQuat.x);
	  	}
	}

	export class MoveOnSphere {

		private radius:number;
		private distance:number;

		private p1:THREE.Vector2;
		private p2:THREE.Vector2;

		private pointVec:THREE.Vector3;

		constructor(radius:number) {
			this.pointVec = new THREE.Vector3();
		    this.radius = radius;
		}

		setRadius(radius:number) {
			this.radius = radius;
		}

		setPoints(p1:THREE.Vector2, p2:THREE.Vector2) {
			this.p1 = p1;
			this.p2 = p2;
			this.distance = TheMath.acos(TheMath.sin(p1.x) * TheMath.sin(p2.x) + 
							TheMath.cos(p1.x) * TheMath.cos(p2.x) * TheMath.cos(p1.y - p2.y));
			
		}

		getPointAt(n:number):THREE.Vector3 {
			var a:number = TheMath.sin((1.0 - n) * this.distance) / TheMath.sin(this.distance);
		   	var b:number = TheMath.sin(n * this.distance) / TheMath.sin(this.distance);

		    var x:number = a * TheMath.cos(this.p1.x) * TheMath.cos(this.p1.y) 	+ b * TheMath.cos(this.p2.x) * TheMath.cos(this.p2.y);
		    var y:number = a * TheMath.cos(this.p1.x) * TheMath.sin(this.p1.y) 	+ b * TheMath.cos(this.p2.x) * TheMath.sin(this.p2.y);
		    var z:number = a * TheMath.sin(this.p1.x) + b * TheMath.sin(this.p2.x);

		    this.pointVec.set(TheMath.round(this.radius * x), TheMath.round(this.radius * y), TheMath.round(this.radius * z));
		    return this.pointVec.clone();
		}
	}

}