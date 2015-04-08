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
}