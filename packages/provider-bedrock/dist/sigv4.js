import * as crypto from "node:crypto";
// AWS Signature Version 4 implementation for Bedrock API calls
function sha256(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
}
function hmacSha256(key, data) {
    return crypto.createHmac("sha256", key).update(data).digest();
}
function getSignatureKey(secretAccessKey, dateStamp, region, service) {
    const kDate = hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
    const kRegion = hmacSha256(kDate, region);
    const kService = hmacSha256(kRegion, service);
    return hmacSha256(kService, "aws4_request");
}
export function signRequest(method, url, body, headers, options) {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const parsedUrl = new URL(url);
    const host = parsedUrl.host;
    const canonicalUri = parsedUrl.pathname || "/";
    const canonicalQueryString = parsedUrl.searchParams.toString();
    // Sort headers
    const sortedHeaders = {
        host,
        "x-amz-date": amzDate,
        ...headers,
    };
    if (options.sessionToken) {
        sortedHeaders["x-amz-security-token"] = options.sessionToken;
    }
    const sortedHeaderKeys = Object.keys(sortedHeaders).sort();
    const canonicalHeaders = sortedHeaderKeys
        .map((k) => `${k.toLowerCase()}:${sortedHeaders[k].trim()}`)
        .join("\n");
    const signedHeaders = sortedHeaderKeys.map((k) => k.toLowerCase()).join(";");
    const payloadHash = sha256(body);
    const canonicalRequest = [
        method,
        canonicalUri,
        canonicalQueryString,
        canonicalHeaders + "\n",
        signedHeaders,
        payloadHash,
    ].join("\n");
    const algorithm = "AWS4-HMAC-SHA256";
    const credentialScope = `${dateStamp}/${options.region}/${options.service}/aws4_request`;
    const stringToSign = [
        algorithm,
        amzDate,
        credentialScope,
        sha256(canonicalRequest),
    ].join("\n");
    const signingKey = getSignatureKey(options.secretAccessKey, dateStamp, options.region, options.service);
    const signature = hmacSha256(signingKey, stringToSign).toString("hex");
    const authorizationHeader = `${algorithm} Credential=${options.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    return {
        ...sortedHeaders,
        Authorization: authorizationHeader,
    };
}
export async function invokeBedrockModel(modelId, body, options) {
    const url = `https://bedrock-runtime.${options.region}.amazonaws.com/model/${modelId}/invoke`;
    const bodyStr = JSON.stringify(body);
    const headers = signRequest("POST", url, bodyStr, {
        "Content-Type": "application/json",
        Accept: "application/json",
    }, options);
    return fetch(url, {
        method: "POST",
        headers,
        body: bodyStr,
    });
}
export async function invokeBedrockStream(modelId, body, options) {
    const url = `https://bedrock-runtime.${options.region}.amazonaws.com/model/${modelId}/invoke-with-response-stream`;
    const bodyStr = JSON.stringify(body);
    const headers = signRequest("POST", url, bodyStr, {
        "Content-Type": "application/json",
        Accept: "application/vnd.amazon.eventstream",
    }, options);
    return fetch(url, {
        method: "POST",
        headers,
        body: bodyStr,
    });
}
//# sourceMappingURL=sigv4.js.map