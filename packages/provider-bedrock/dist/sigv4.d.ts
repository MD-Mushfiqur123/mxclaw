export interface SigV4Options {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
    region: string;
    service: string;
}
export declare function signRequest(method: string, url: string, body: string, headers: Record<string, string>, options: SigV4Options): Record<string, string>;
export declare function invokeBedrockModel(modelId: string, body: Record<string, unknown>, options: SigV4Options): Promise<Response>;
export declare function invokeBedrockStream(modelId: string, body: Record<string, unknown>, options: SigV4Options): Promise<Response>;
//# sourceMappingURL=sigv4.d.ts.map