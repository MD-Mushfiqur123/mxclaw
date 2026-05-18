// @ts-nocheck
import { z } from "zod";
import type { ToolDefinition, ToolResult } from "@mxclaw/core";

// ── Web Search Tool ──────────────────────────────────────────────────

const WebSearchParamsSchema = z.object({
  query: z.string().min(1).describe("The search query"),
  maxResults: z.number().min(1).max(20).default(5).describe("Number of results to return"),
  backend: z
    .enum(["duckduckgo", "brave", "searxng"])
    .default("duckduckgo")
    .describe("Search backend to use"),
});

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * web_search — query the web via DuckDuckGo HTML scraping (zero API key needed),
 * with optional Brave Search or SearXNG backends.
 */
export const webSearchTool: ToolDefinition = {
  name: "web_search",
  description:
    "Search the web for information. Returns titles, URLs, and snippets. " +
    "Use this when you need current information, facts, or links.",
  parameters: WebSearchParamsSchema,
  execute: async (args, _context): Promise<ToolResult> => {
    const { query, maxResults, backend } = WebSearchParamsSchema.parse(args);

    try {
      let results: SearchResult[];

      switch (backend) {
        case "duckduckgo":
          results = await searchDuckDuckGo(query, maxResults);
          break;
        case "brave":
          results = await searchBrave(query, maxResults);
          break;
        case "searxng":
          results = await searchSearXNG(query, maxResults);
          break;
        default:
          results = await searchDuckDuckGo(query, maxResults);
      }

      if (results.length === 0) {
        return { success: true, output: `No results found for: "${query}"` };
      }

      const formatted = results
        .map(
          (r, i) =>
            `${i + 1}. **${r.title}**\n   ${r.url}\n   ${r.snippet}`,
        )
        .join("\n\n");

      return {
        success: true,
        output: `Search results for "${query}" (${results.length} results):\n\n${formatted}`,
      };
    } catch (err) {
      return {
        success: false,
        output: "",
        error: `Search failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  },
};

// ── DuckDuckGo HTML scraper (no API key) ─────────────────────────────

async function searchDuckDuckGo(query: string, maxResults: number): Promise<SearchResult[]> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MxClaw/1.0; +https://mxclaw.ai)",
    },
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo returned ${response.status}`);
  }

  const html = await response.text();
  const results: SearchResult[] = [];

  // Parse results from DDG HTML response
  const resultRegex =
    /<a[^>]+class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

  let match: RegExpExecArray | null;
  while ((match = resultRegex.exec(html)) !== null && results.length < maxResults) {
    const rawUrl = match[1];
    const title = stripHtml(match[2]).trim();
    const snippet = stripHtml(match[3]).trim();

    // DDG uses redirect URLs; extract the real URL
    const realUrl = extractDdgUrl(rawUrl);

    if (title && realUrl) {
      results.push({ title, url: realUrl, snippet });
    }
  }

  // Fallback: simpler regex if the above doesn't match
  if (results.length === 0) {
    const simpleRegex = /<a[^>]+class="result__url"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    while ((match = simpleRegex.exec(html)) !== null && results.length < maxResults) {
      const url = match[1];
      const title = stripHtml(match[2]).trim();
      if (url && title) {
        results.push({ title, url, snippet: "" });
      }
    }
  }

  return results;
}

// ── Brave Search (requires API key in env) ───────────────────────────

async function searchBrave(query: string, maxResults: number): Promise<SearchResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    throw new Error("BRAVE_SEARCH_API_KEY not set. Set it in your environment or use duckduckgo backend.");
  }

  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Brave Search returned ${response.status}`);
  }

  const data = (await response.json()) as {
    web?: { results?: Array<{ title: string; url: string; description: string }> };
  };

  return (
    data.web?.results?.map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.description,
    })) ?? []
  );
}

// ── SearXNG (self-hosted, no API key) ────────────────────────────────

async function searchSearXNG(query: string, maxResults: number): Promise<SearchResult[]> {
  const baseUrl = process.env.SEARXNG_URL ?? "http://localhost:8888";
  const url = `${baseUrl}/search?q=${encodeURIComponent(query)}&format=json&categories=general`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SearXNG returned ${response.status}`);
  }

  const data = (await response.json()) as {
    results?: Array<{ title: string; url: string; content: string }>;
  };

  return (
    data.results?.slice(0, maxResults).map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
    })) ?? []
  );
}

// ── Helpers ───────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/\s+/g, " ");
}

function extractDdgUrl(redirectUrl: string): string {
  try {
    const parsed = new URL(redirectUrl, "https://duckduckgo.com");
    const uddg = parsed.searchParams.get("uddg");
    return uddg ? decodeURIComponent(uddg) : redirectUrl;
  } catch {
    return redirectUrl;
  }
}
