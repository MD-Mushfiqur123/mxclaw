import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
const ImageGenParamsSchema = z.object({
    prompt: z.string().min(1),
    negativePrompt: z.string().optional(),
    width: z.number().positive().default(1024),
    height: z.number().positive().default(1024),
    steps: z.number().positive().default(30),
    seed: z.number().optional(),
    provider: z.enum(["openai", "stability", "replicate", "local"]).default("openai"),
    style: z.string().optional(),
});
const providers = {
    openai: {
        name: "OpenAI DALL-E",
        generate: async (args, apiKey) => {
            const resp = await fetch("https://api.openai.com/v1/images/generations", {
                method: "POST",
                headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "dall-e-3",
                    prompt: args.prompt,
                    n: 1,
                    size: mapSize(args.width, args.height),
                    quality: "standard",
                }),
            });
            if (!resp.ok) {
                const err = await resp.text().catch(() => "");
                return { error: `DALL-E error [${resp.status}]: ${err.slice(0, 300)}` };
            }
            const data = (await resp.json());
            return { url: data.data[0]?.url, base64: data.data[0]?.b64_json };
        },
    },
    stability: {
        name: "Stability AI",
        generate: async (args, apiKey) => {
            const resp = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
                method: "POST",
                headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
                body: (() => {
                    const fd = new FormData();
                    fd.append("prompt", args.prompt);
                    if (args.negativePrompt)
                        fd.append("negative_prompt", args.negativePrompt);
                    fd.append("output_format", "png");
                    return fd;
                })(),
            });
            if (!resp.ok) {
                const err = await resp.text().catch(() => "");
                return { error: `Stability error [${resp.status}]: ${err.slice(0, 300)}` };
            }
            const data = (await resp.json());
            return { base64: data.image };
        },
    },
    replicate: {
        name: "Replicate (Stable Diffusion)",
        generate: async (args, apiKey) => {
            const resp = await fetch("https://api.replicate.com/v1/models/stability-ai/sdxl/predictions", {
                method: "POST",
                headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    input: {
                        prompt: args.prompt,
                        negative_prompt: args.negativePrompt ?? "",
                        width: args.width,
                        height: args.height,
                        num_inference_steps: args.steps,
                        seed: args.seed,
                    },
                }),
            });
            if (!resp.ok) {
                const err = await resp.text().catch(() => "");
                return { error: `Replicate error [${resp.status}]: ${err.slice(0, 300)}` };
            }
            const prediction = (await resp.json());
            // Poll for completion
            let result = prediction;
            for (let i = 0; i < 30; i++) {
                if (result.status === "succeeded" || result.status === "failed")
                    break;
                await new Promise((r) => setTimeout(r, 2000));
                const pollResp = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                    headers: { Authorization: `Bearer ${apiKey}` },
                });
                result = (await pollResp.json());
            }
            if (result.status === "succeeded" && result.output?.[0]) {
                return { url: result.output[0] };
            }
            return { error: `Replicate generation ${result.status}` };
        },
    },
    local: {
        name: "Local (Stable Diffusion WebUI)",
        generate: async (args, _apiKey) => {
            const baseUrl = process.env.SD_WEBUI_URL ?? "http://localhost:7860";
            try {
                const resp = await fetch(`${baseUrl}/sdapi/v1/txt2img`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompt: args.prompt,
                        negative_prompt: args.negativePrompt ?? "",
                        width: args.width,
                        height: args.height,
                        steps: args.steps,
                        seed: args.seed ?? -1,
                    }),
                });
                if (!resp.ok)
                    return { error: `SD WebUI error [${resp.status}]` };
                const data = (await resp.json());
                return { base64: data.images[0] };
            }
            catch (err) {
                return { error: `SD WebUI not reachable at ${baseUrl}` };
            }
        },
    },
};
function mapSize(w, h) {
    if (w === 1792 && h === 1024)
        return "1792x1024";
    if (w === 1024 && h === 1792)
        return "1024x1792";
    if (w === 1024 && h === 1024)
        return "1024x1024";
    return "1024x1024";
}
export const imageGenTool = {
    name: "image_gen",
    description: "Generate images using AI (DALL-E 3, Stable Diffusion, Replicate, or local SD WebUI). Specify provider: openai, stability, replicate, or local.",
    parameters: ImageGenParamsSchema,
    execute: async (args, context) => {
        const parsed = ImageGenParamsSchema.parse(args);
        const provider = providers[parsed.provider];
        if (!provider) {
            return { success: false, output: "", error: `Unknown provider: ${parsed.provider}. Use: openai, stability, replicate, or local` };
        }
        const apiKey = parsed.provider === "openai" ? (process.env.OPENAI_API_KEY ?? "")
            : parsed.provider === "stability" ? (process.env.STABILITY_API_KEY ?? "")
                : parsed.provider === "replicate" ? (process.env.REPLICATE_API_TOKEN ?? "")
                    : "";
        if (parsed.provider !== "local" && !apiKey) {
            return { success: false, output: "", error: `API key required for ${provider.name}. Set ${parsed.provider === "openai" ? "OPENAI_API_KEY" : parsed.provider === "stability" ? "STABILITY_API_KEY" : "REPLICATE_API_TOKEN"} env var.` };
        }
        const result = await provider.generate(parsed, apiKey);
        if (result.error) {
            return { success: false, output: "", error: result.error };
        }
        const imageDir = path.join(context.workspacePath, "images");
        fs.mkdirSync(imageDir, { recursive: true });
        const imageId = crypto.randomUUID();
        const imagePath = path.join(imageDir, `${imageId}.png`);
        if (result.base64) {
            fs.writeFileSync(imagePath, Buffer.from(result.base64, "base64"));
        }
        else if (result.url) {
            // Download from URL
            const downloadResp = await fetch(result.url);
            const buffer = Buffer.from(await downloadResp.arrayBuffer());
            fs.writeFileSync(imagePath, buffer);
        }
        return {
            success: true,
            output: `Image generated by ${provider.name}: "${parsed.prompt}" (${parsed.width}x${parsed.height})`,
            artifacts: [{ type: "image", url: `file://${imagePath}`, name: `${imageId}.png` }],
        };
    },
};
//# sourceMappingURL=image-gen.js.map