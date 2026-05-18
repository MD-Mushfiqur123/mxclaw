import { z } from "zod";
// ── Web Fetch Tool ───────────────────────────────────────────────────
const WebFetchParamsSchema = z.object({
    url: z.string().url().describe("The URL to fetch"),
    selector: z.string().optional().describe("Optional CSS selector to extract specific content"),
    maxLength: z
        .number()
        .min(100)
        .max(100_000)
        .default(10_000)
        .describe("Maximum characters of content to return"),
    timeout: z
        .number()
        .min(1000)
        .max(30_000)
        .default(10_000)
        .describe("Request timeout in milliseconds"),
});
/**
 * web_fetch — fetch a URL and convert its content to readable markdown.
 * Strips scripts, styles, navigation, and other non-content elements.
 */
export const webFetchTool = {
    name: "web_fetch",
    description: "Fetch and read the content of a web page. Converts HTML to clean, readable text. " +
        "Use this to read articles, documentation, or any web page content.",
    parameters: WebFetchParamsSchema,
    execute: async (args, _context) => {
        const { url, selector, maxLength, timeout } = WebFetchParamsSchema.parse(args);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            const response = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; MxClaw/1.0; +https://mxclaw.ai)",
                    Accept: "text/html, application/json, text/plain, */*",
                },
                signal: controller.signal,
                redirect: "follow",
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                return {
                    success: false,
                    output: "",
                    error: `HTTP ${response.status}: ${response.statusText}`,
                };
            }
            const contentType = response.headers.get("content-type") ?? "";
            const rawBody = await response.text();
            let content;
            if (contentType.includes("application/json")) {
                // JSON — pretty-print
                try {
                    const parsed = JSON.parse(rawBody);
                    content = JSON.stringify(parsed, null, 2);
                }
                catch {
                    content = rawBody;
                }
            }
            else if (contentType.includes("text/plain")) {
                content = rawBody;
            }
            else {
                // HTML → readable text
                content = htmlToReadableText(rawBody, selector);
            }
            // Truncate if needed
            if (content.length > maxLength) {
                content = content.slice(0, maxLength) + "\n\n[...content truncated]";
            }
            return {
                success: true,
                output: `# Content from ${url}\n\n${content}`,
            };
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes("abort")) {
                return { success: false, output: "", error: `Request timed out after ${timeout}ms` };
            }
            return { success: false, output: "", error: `Fetch failed: ${msg}` };
        }
    },
};
// ── HTML → Readable Text Converter ───────────────────────────────────
/**
 * Convert HTML to readable markdown-ish text.
 * Strips scripts, styles, nav, footer, sidebar, ads.
 */
function htmlToReadableText(html, _selector) {
    let text = html;
    // Remove script and style blocks entirely
    text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
    text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
    text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
    // Remove common non-content elements
    text = text.replace(/<nav[\s\S]*?<\/nav>/gi, "");
    text = text.replace(/<footer[\s\S]*?<\/footer>/gi, "");
    text = text.replace(/<header[\s\S]*?<\/header>/gi, "");
    text = text.replace(/<aside[\s\S]*?<\/aside>/gi, "");
    // Remove hidden elements
    text = text.replace(/<[^>]+(?:hidden|display:\s*none|aria-hidden="true")[^>]*>[\s\S]*?<\/[^>]+>/gi, "");
    // Convert headings
    text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n");
    text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n");
    text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n");
    text = text.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n\n#### $1\n\n");
    text = text.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n\n##### $1\n\n");
    text = text.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n\n###### $1\n\n");
    // Convert links
    text = text.replace(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
    // Convert emphasis
    text = text.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, "**$1**");
    text = text.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, "*$1*");
    text = text.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
    // Convert pre/code blocks
    text = text.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "\n```\n$1\n```\n");
    text = text.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "\n```\n$1\n```\n");
    // Convert lists
    text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
    text = text.replace(/<\/?(?:ul|ol)[^>]*>/gi, "\n");
    // Convert paragraphs and breaks
    text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n");
    text = text.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<hr\s*\/?>/gi, "\n---\n");
    // Convert tables (basic)
    text = text.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, "$1\n");
    text = text.replace(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi, " | $1");
    // Remove remaining HTML tags
    text = text.replace(/<[^>]+>/g, "");
    // Decode HTML entities
    text = text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
    // Clean up whitespace
    text = text.replace(/\n{3,}/g, "\n\n");
    text = text.replace(/[ \t]+/g, " ");
    text = text.trim();
    return text;
}
//# sourceMappingURL=web-fetch.js.map