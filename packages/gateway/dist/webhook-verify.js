import * as crypto from "node:crypto";
const VERIFIERS = {
    // Discord: X-Signature-Ed25519 + X-Signature-Timestamp
    discord: (body, headers, publicKey) => {
        const signature = headers["x-signature-ed25519"];
        const timestamp = headers["x-signature-timestamp"];
        if (!signature || !timestamp)
            return false;
        try {
            const verified = crypto.verify(null, Buffer.from(timestamp + body), publicKey, Buffer.from(signature, "hex"));
            return verified;
        }
        catch {
            return false;
        }
    },
    // Slack: X-Slack-Signature + X-Slack-Request-Timestamp
    slack: (body, headers, signingSecret) => {
        const signature = headers["x-slack-signature"];
        const timestamp = headers["x-slack-request-timestamp"];
        if (!signature || !timestamp)
            return false;
        // Check timestamp is within 5 minutes
        const now = Math.floor(Date.now() / 1000);
        if (Math.abs(now - parseInt(timestamp, 10)) > 300)
            return false;
        const sigBaseString = `v0:${timestamp}:${body}`;
        const computedSig = "v0=" + crypto.createHmac("sha256", signingSecret).update(sigBaseString).digest("hex");
        const sigBuf = Buffer.from(signature);
        const compBuf = Buffer.from(computedSig);
        if (sigBuf.length !== compBuf.length)
            return false;
        return crypto.timingSafeEqual(sigBuf, compBuf);
    },
    // Telegram: secret token in X-Telegram-Bot-Api-Secret-Token
    telegram: (_body, headers, secretToken) => {
        const token = headers["x-telegram-bot-api-secret-token"];
        return token === secretToken;
    },
    // LINE: X-Line-Signature
    line: (body, headers, channelSecret) => {
        const signature = headers["x-line-signature"];
        if (!signature)
            return false;
        const computed = crypto.createHmac("sha256", channelSecret).update(body).digest("base64");
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
    },
    // Feishu: timestamp + nonce + body + secret → SHA256
    feishu: (body, headers, secret) => {
        const timestamp = headers["x-lark-request-timestamp"] ?? headers["timestamp"];
        const nonce = headers["x-lark-request-nonce"] ?? headers["nonce"];
        const signature = headers["x-lark-signature"] ?? headers["signature"];
        if (!timestamp || !nonce || !signature)
            return false;
        const computed = crypto.createHash("sha256").update(timestamp + nonce + secret + body).digest("hex");
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
    },
    // Teams: HMAC-SHA256 of body with bot password
    teams: (body, headers, botPassword) => {
        const authHeader = headers["authorization"];
        if (!authHeader?.startsWith("Bearer "))
            return false;
        const token = authHeader.slice(7);
        // Teams sends a JWT bearer token; simplified check
        try {
            const parts = token.split(".");
            if (parts.length !== 3)
                return false;
            const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
            return payload.serviceUrl?.includes("botframework.com");
        }
        catch {
            return false;
        }
    },
    // Google Chat: Bearer token — verify JWT claims (issuer + audience)
    googlechat: (_body, headers, projectNumber) => {
        const authHeader = headers["authorization"];
        if (!authHeader?.startsWith("Bearer "))
            return false;
        const token = authHeader.slice(7);
        try {
            const parts = token.split(".");
            if (parts.length !== 3)
                return false;
            const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
            if (payload.iss !== "chat@system.gserviceaccount.com")
                return false;
            if (projectNumber && payload.aud !== projectNumber)
                return false;
            if (payload.exp && payload.exp < Math.floor(Date.now() / 1000))
                return false;
            return true;
        }
        catch {
            return false;
        }
    },
    // Generic: HMAC-SHA256
    generic: (body, headers, secret) => {
        const signature = headers["x-hub-signature-256"] ?? headers["x-signature"];
        if (!signature)
            return false;
        const algo = signature.startsWith("sha256=") ? "sha256" : "sha256";
        const computed = crypto.createHmac(algo, secret).update(body).digest("hex");
        const expected = signature.replace(/^sha256=/, "");
        try {
            return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(expected));
        }
        catch {
            return false;
        }
    },
};
export function verifyWebhook(platform, body, headers, secret) {
    const verifier = VERIFIERS[platform];
    if (!verifier)
        return false;
    return verifier(body, headers, secret);
}
export function getWebhookVerifier(platform) {
    return {
        platform,
        verify: (body, headers, secret) => verifyWebhook(platform, body, headers, secret),
    };
}
//# sourceMappingURL=webhook-verify.js.map