declare module utils {
    class Prefix {
        constructor();
        static transformPrefix(): string;
        static GetVendorPrefix(arrayOfPrefixes: any): string;
    }
}
