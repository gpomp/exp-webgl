declare module utils {
    class Prefix {
        constructor();
        static transformPrefix(): string;
        static GetVendorPrefix(arrayOfPrefixes: any): string;
    }
    class GameKeyBoardControl {
        private _callbackKeyPressed;
        private _callbackKeyUp;
        private _keyHTML;
        constructor(callbackKeyPressed: Function, callbackKeyUp: Function);
        keydown: (event: KeyboardEvent) => void;
        keyup: (event: KeyboardEvent) => void;
    }
}
