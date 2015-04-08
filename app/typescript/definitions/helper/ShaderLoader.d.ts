declare module THREE {
    class ShaderLoader {
        static SHADERS: any;
        private request;
        private callback;
        constructor(url: string, callback: Function);
        onComplete: (jqXHR: any) => void;
    }
}
