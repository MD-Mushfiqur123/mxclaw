import * as crypto from "node:crypto";

// AWS Signature Version 4 implementation for Bedrock API calls

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data).digest();
}

function getSignatureKey(
  secretAccessKey: string,
  dateStamp: string,
  region: string,
  service: string,
): Buffer {
  const kDate = hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  return hmacSha256(kService, "aws4_request");
}

export interface SigV4Options {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  region: string;
  service: string;
}

export function signRequest(
  method: string,
  url: string,
  body: string,
  headers: Record<string, string>,
  options: SigV4Options,
): Record<string, string> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const parsedUrl = new URL(url);
  const host = parsedUrl.host;
  const canonicalUri = parsedUrl.pathname || "/";
  const canonicalQueryString = parsedUrl.searchParams.toString();

  // Sort headers
  const sortedHeaders: Record<string, string> = {
    host,
    "x-amz-date": amzDate,
    ...headers,
  };
  if (options.sessionToken) {
    sortedHeaders["x-amz-security-token"] = options.sessionToken;
  }

  const sortedHeaderKeys = Object.keys(sortedHeaders).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map((k) => `${k.toLowerCase()}:${sortedHeaders[k]!.trim()}`)
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

  const signingKey = getSignatureKey(
    options.secretAccessKey,
    dateStamp,
    options.region,
    options.service,
  );

  const signature = hmacSha256(signingKey, stringToSign).toString("hex");

  const authorizationHeader =
    `${algorithm} Credential=${options.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    ...sortedHeaders,
    Authorization: authorizationHeader,
  };
}

export async function invokeBedrockModel(
  modelId: string,
  body: Record<string, unknown>,
  options: SigV4Options,
): Promise<Response> {
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

export async function invokeBedrockStream(
  modelId: string,
  body: Record<string, unknown>,
  options: SigV4Options,
): Promise<Response> {
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