export type WebhookPlatform = "discord" | "slack" | "telegram" | "line" | "feishu" | "teams" | "googlechat" | "generic";
export interface WebhookVerification {
    platform: WebhookPlatform;
    verify: (body: string, headers: Record<string, string>, secret: string) => boolean;
}
export declare function verifyWebhook(platform: WebhookPlatform, body: string, headers: Record<string, string>, secret: string): boolean;
export declare function getWebhookVerifier(platform: WebhookPlatform): {
    platform: WebhookPlatform;
    verify: (body: string, headers: Record<string, string>, secret: string) => boolean;
};
//# sourceMappingURL=webhook-verify.d.ts.map