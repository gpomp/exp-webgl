/// <reference path="core/Scene3D.ts" />
/// <reference path="core/Gui.ts" />
/// <reference path="helper/Detector.ts" />

module webglExp {
	export class Site {

		public static activeDevice:string;
		public static activeDeviceType:string;
	 
		private mainScene;

		private siteReady:boolean;

		private callback:Function;

		constructor(callback:Function) {
			this.callback = callback;
			this.siteReady = false;
			if (webglExp.Detector.isWebGL()) {
				this.configWebgl();
			}
		}

		configWebgl() {

			new webglExp.Gui(); 
			this.mainScene = new webglExp.Scene3D(this.shaderLoaded);	

			this.deviceType();
			window.addEventListener("resize",this.resize);
		}


		scroll = (event) => {
			this.checkScroll();
		}

		checkScrollAnim = () => {
			this.checkScroll();
		}

		checkScroll() {
			
		}

		shaderLoaded = (scene3d:webglExp.Scene3D) => {
			this.siteReady = true;
			this.callback(scene3d);
		}

		resize = (event) => {
			this.deviceType();
			if(this.siteReady) {
				this.mainScene.resize();
			}
			
		}

		deviceType() {
			var istouch:boolean = (<HTMLElement>document.querySelectorAll("html").item(0)).classList.contains("touch");
			var browserWidth:number = window.innerWidth,
			browserHeight:number = window.innerHeight;
			var mobileWidth:number = 767,
				tabletWidth:number = 1024,
				desktopWidth:number = 1500;

			if(browserWidth > desktopWidth) {
				Site.activeDevice = 'desktopXl';
				Site.activeDeviceType = 'desktop';
			}
			else if(browserWidth > tabletWidth) {
				Site.activeDevice = 'desktop';
				Site.activeDeviceType = 'desktop';
			}
			else if(browserWidth > mobileWidth && istouch) {
				Site.activeDevice = 'tablet';
				Site.activeDeviceType = 'touch';
			}
			else if(istouch) {
				Site.activeDevice = 'mobile';
				Site.activeDeviceType = 'touch';
			} else {
				Site.activeDevice = 'desktop';
				Site.activeDeviceType = 'desktop';
			}
		}
	}
}