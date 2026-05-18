export declare function installDaemon(): Promise<void>;
export declare function uninstallDaemon(): Promise<void>;
export declare function daemonStatus(): Promise<void>;
export declare function testProvider(baseUrl: string, apiKey: string, model: string): Promise<{
    ok: boolean;
    latency: number;
    error?: string;
}>;
export declare function runOnboard(): Promise<void>;
//# sourceMappingURL=onboard.d.ts.map