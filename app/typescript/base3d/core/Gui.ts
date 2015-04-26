/// <reference path="../../../../typings/dat-gui/dat-gui.d.ts" />
/// <reference path="../../../../typings/stats/stats.d.ts" />

module webglExp {
	export class Gui {

		public static gui:webglExp.Gui;

		private _gui:dat.GUI;

		constructor() {
			this._gui = new dat.GUI();
			webglExp.Gui.gui = this;
			document.addEventListener("keyup", this.keyup);
		}

		private keyup(event) {
			if(event.which === 68) {
				(<HTMLElement>document.querySelectorAll("div.dg.main").item(0)).classList.toggle("show");
				(<HTMLElement>document.querySelectorAll("#stats").item(0)).classList.toggle("show");

			}
		}

		public clear() {
			var n:NodeList = document.querySelectorAll("div.dg.main > ul li");
			for (var i = 0; i < n.length; ++i) {
				var f:HTMLElement = <HTMLElement>n.item(i);
				f.parentNode.removeChild(f);
			}


			for (var folder in this._gui.__folders){
			    folder = undefined;
			}

			this._gui.__folders = [];
			// this._gui.onResize();
		}

		private removeFolder(folder) {
			/*folder.close();
			console.log(folder.domElement, folder.domElement.parentNode);
		    folder.domElement.parentNode.removeChild(folder.domElement);
		    folder = undefined;
		    this._gui.onResize();*/
		}

		public get_gui():dat.GUI {
			return this._gui;
		}
	}

	export class PerfStats {

		private stats:Stats;
		private currMode:number;

		constructor() {
			this.currMode = 0;
			this.stats = new Stats();
			this.stats.setMode(this.currMode);

			document.body.appendChild( this.stats.domElement );

			// align top-left
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.left = '0px';
			this.stats.domElement.style.top = '0px';

			document.addEventListener('keyup', this.changeMode);
		}

		public begin() {
			this.stats.begin();
		}

		public end() {
			this.stats.end();
		}

		changeMode = (event) => {
			switch(event.keyCode) {
				case 77 :
					this.currMode = this.currMode === 1 ? 0 : 1;
					this.stats.setMode(this.currMode);
				break;
			}
		}


	}
}