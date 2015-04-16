module utils {
    export class Prefix {

        constructor() {
            
        }

        static transformPrefix():string {
            return utils.Prefix.GetVendorPrefix(["transform", "msTransform", "MozTransform", "WebkitTransform", "OTransform"]);
        }

        static GetVendorPrefix(arrayOfPrefixes):string {

           var tmp = document.createElement("div");
           var result:string = "";

            for (var i = 0; i < arrayOfPrefixes.length; ++i) {
                if (typeof tmp.style[arrayOfPrefixes[i]] !== 'undefined') {
                    result = arrayOfPrefixes[i];
                    break;
                } else {
                    result = null;
                }
            }

           return result;
        }
    }

    export class GameKeyBoardControl {

        private _callbackKeyPressed:Function;
        private _callbackKeyUp:Function;

        private _keyHTML: HTMLElement;

        constructor(callbackKeyPressed:Function, callbackKeyUp:Function) {
            this._callbackKeyPressed = callbackKeyPressed;
            this._callbackKeyUp = callbackKeyUp;

            this._keyHTML = <HTMLElement>document.getElementById('keyboard-control');

            document.addEventListener('keydown', this.keydown);
            document.addEventListener('keyup', this.keyup);
        }

        keydown = (event:KeyboardEvent) => {
            var key: string = '';

            switch(event.keyCode) {
                case 87:
                case 38:
                    key = 'up';
                break;
                case 83:
                case 40:
                    key = 'down';
                break;
                case 65:
                case 37:
                    key = 'left';
                break;
                case 68:
                case 39:
                    key = 'right';
                break;
                case 13:
                    key = 'enter';
                break;
            }

            if(key !== '' && key !== 'enter') {
                (<HTMLElement>this._keyHTML.querySelector('.' + key)).classList.add('pushed');
            }
            
            this._callbackKeyPressed(key);
        }

        keyup = (event:KeyboardEvent) => {
            var key: string = '';

            switch(event.keyCode) {
                case 87:
                case 38:
                    key = 'up';
                break;
                case 83:
                case 40:
                    key = 'down';
                break;
                case 65:
                case 37:
                    key = 'left';
                break;
                case 68:
                case 39:
                    key = 'right';
                break;
                case 13:
                    key = 'enter';
                break;
            }

            if(key !== '' && key !== 'enter') {
                (<HTMLElement>this._keyHTML.querySelector('.' + key)).classList.remove('pushed');
            }

            this._callbackKeyUp(key);
        }
    }
}