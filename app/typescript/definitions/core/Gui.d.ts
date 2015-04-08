/// <reference path="../../../../typings/dat-gui/dat-gui.d.ts" />
/// <reference path="../../../../typings/stats/stats.d.ts" />
declare module webglExp {
    class Gui {
        static gui: webglExp.Gui;
        private _gui;
        constructor();
        private keyup(event);
        clear(): void;
        private removeFolder(folder);
        get_gui(): dat.GUI;
    }
    class PerfStats {
        private stats;
        private currMode;
        constructor();
        begin(): void;
        end(): void;
        changeMode: (event: any) => void;
    }
}
