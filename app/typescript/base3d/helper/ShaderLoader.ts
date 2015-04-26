module THREE {
	export class ShaderLoader {

		public static SHADERS;

		private request:any;
		private callback:Function;

		constructor(url:string, callback:Function) {
			this.callback = callback;
			this.request = new XMLHttpRequest();
			this.request.open('GET', url, true);

			var self:THREE.ShaderLoader = this;

			this.request.onreadystatechange = function() {
				if(this.readyState === 4) {
					if (this.status === 200) {
			    		// Success!
			    		self.onComplete(this.request);
			  		}
				}
			  
			};

			this.request.onerror = function() {
			  // There was a connection error of some sort
			};

			this.request.send();
		}

		onComplete = (jqXHR:any) => {
			var xml:XMLDocument = this.request.responseXML;
			var list:NodeList = xml.getElementsByTagName("shader");

			ShaderLoader.SHADERS = {};

			for (var i = 0; i < list.length; ++i) {
				var node:Node = list.item(i);
				var name:string = (<HTMLElement>node).getAttribute("type");
				var vertex = (<HTMLElement>node).getElementsByTagName("vertex").item(0);
				var fragment = (<HTMLElement>node).getElementsByTagName("fragment").item(0);
				ShaderLoader.SHADERS[name] = {
					"vertex" : (<HTMLElement>vertex).textContent,
					"fragment" : (<HTMLElement>fragment).textContent
				}
			}

			this.callback(ShaderLoader.SHADERS);
		}


	}
}

