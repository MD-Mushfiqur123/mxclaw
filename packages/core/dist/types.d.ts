import { z } from "zod";
export declare const MessageContentSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "text";
    text: string;
}, {
    type: "text";
    text: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"image">;
    url: z.ZodString;
    alt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "image";
    url: string;
    alt?: string | undefined;
}, {
    type: "image";
    url: string;
    alt?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"audio">;
    url: z.ZodString;
    transcript: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "audio";
    url: string;
    transcript?: string | undefined;
}, {
    type: "audio";
    url: string;
    transcript?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"video">;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "video";
    url: string;
}, {
    type: "video";
    url: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"file">;
    url: z.ZodString;
    name: z.ZodString;
    mimeType: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "file";
    url: string;
    name: string;
    mimeType?: string | undefined;
}, {
    type: "file";
    url: string;
    name: string;
    mimeType?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"location">;
    lat: z.ZodNumber;
    lng: z.ZodNumber;
    label: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "location";
    lat: number;
    lng: number;
    label?: string | undefined;
}, {
    type: "location";
    lat: number;
    lng: number;
    label?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"sticker">;
    id: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "sticker";
    id: string;
    url?: string | undefined;
}, {
    type: "sticker";
    id: string;
    url?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"reaction">;
    emoji: z.ZodString;
    messageId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "reaction";
    emoji: string;
    messageId: string;
}, {
    type: "reaction";
    emoji: string;
    messageId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"canvas">;
    json: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    type: "canvas";
    json: Record<string, unknown>;
}, {
    type: "canvas";
    json: Record<string, unknown>;
}>]>;
export type MessageContent = z.infer<typeof MessageContentSchema>;
export declare const MessageEnvelopeSchema: z.ZodObject<{
    id: z.ZodString;
    channel: z.ZodString;
    channelType: z.ZodString;
    sender: z.ZodObject<{
        id: z.ZodString;
        displayName: z.ZodString;
        avatarUrl: z.ZodOptional<z.ZodString>;
        isBot: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        displayName: string;
        isBot: boolean;
        avatarUrl?: string | undefined;
    }, {
        id: string;
        displayName: string;
        avatarUrl?: string | undefined;
        isBot?: boolean | undefined;
    }>;
    conversationId: z.ZodString;
    threadId: z.ZodOptional<z.ZodString>;
    content: z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "text";
        text: string;
    }, {
        type: "text";
        text: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"image">;
        url: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "image";
        url: string;
        alt?: string | undefined;
    }, {
        type: "image";
        url: string;
        alt?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"audio">;
        url: z.ZodString;
        transcript: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "audio";
        url: string;
        transcript?: string | undefined;
    }, {
        type: "audio";
        url: string;
        transcript?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"video">;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "video";
        url: string;
    }, {
        type: "video";
        url: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"file">;
        url: z.ZodString;
        name: z.ZodString;
        mimeType: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "file";
        url: string;
        name: string;
        mimeType?: string | undefined;
    }, {
        type: "file";
        url: string;
        name: string;
        mimeType?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"location">;
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "location";
        lat: number;
        lng: number;
        label?: string | undefined;
    }, {
        type: "location";
        lat: number;
        lng: number;
        label?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"sticker">;
        id: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "sticker";
        id: string;
        url?: string | undefined;
    }, {
        type: "sticker";
        id: string;
        url?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"reaction">;
        emoji: z.ZodString;
        messageId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "reaction";
        emoji: string;
        messageId: string;
    }, {
        type: "reaction";
        emoji: string;
        messageId: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"canvas">;
        json: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        type: "canvas";
        json: Record<string, unknown>;
    }, {
        type: "canvas";
        json: Record<string, unknown>;
    }>]>, "many">;
    mentions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    isGroupMessage: z.ZodDefault<z.ZodBoolean>;
    isMentioned: z.ZodDefault<z.ZodBoolean>;
    timestamp: z.ZodNumber;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    channel: string;
    channelType: string;
    sender: {
        id: string;
        displayName: string;
        isBot: boolean;
        avatarUrl?: string | undefined;
    };
    conversationId: string;
    content: ({
        type: "text";
        text: string;
    } | {
        type: "image";
        url: string;
        alt?: string | undefined;
    } | {
        type: "audio";
        url: string;
        transcript?: string | undefined;
    } | {
        type: "video";
        url: string;
    } | {
        type: "file";
        url: string;
        name: string;
        mimeType?: string | undefined;
    } | {
        type: "location";
        lat: number;
        lng: number;
        label?: string | undefined;
    } | {
        type: "sticker";
        id: string;
        url?: string | undefined;
    } | {
        type: "reaction";
        emoji: string;
        messageId: string;
    } | {
        type: "canvas";
        json: Record<string, unknown>;
    })[];
    mentions: string[];
    isGroupMessage: boolean;
    isMentioned: boolean;
    timestamp: number;
    metadata: Record<string, unknown>;
    threadId?: string | undefined;
}, {
    id: string;
    channel: string;
    channelType: string;
    sender: {
        id: string;
        displayName: string;
        avatarUrl?: string | undefined;
        isBot?: boolean | undefined;
    };
    conversationId: string;
    content: ({
        type: "text";
        text: string;
    } | {
        type: "image";
        url: string;
        alt?: string | undefined;
    } | {
        type: "audio";
        url: string;
        transcript?: string | undefined;
    } | {
        type: "video";
        url: string;
    } | {
        type: "file";
        url: string;
        name: string;
        mimeType?: string | undefined;
    } | {
        type: "location";
        lat: number;
        lng: number;
        label?: string | undefined;
    } | {
        type: "sticker";
        id: string;
        url?: string | undefined;
    } | {
        type: "reaction";
        emoji: string;
        messageId: string;
    } | {
        type: "canvas";
        json: Record<string, unknown>;
    })[];
    timestamp: number;
    threadId?: string | undefined;
    mentions?: string[] | undefined;
    isGroupMessage?: boolean | undefined;
    isMentioned?: boolean | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export type MessageEnvelope = z.infer<typeof MessageEnvelopeSchema>;
export declare const ReplyEnvelopeSchema: z.ZodObject<{
    channelMessageId: z.ZodOptional<z.ZodString>;
    conversationId: z.ZodString;
    threadId: z.ZodOptional<z.ZodString>;
    content: z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "text";
        text: string;
    }, {
        type: "text";
        text: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"image">;
        url: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "image";
        url: string;
        alt?: string | undefined;
    }, {
        type: "image";
        url: string;
        alt?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"audio">;
        url: z.ZodString;
        transcript: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "audio";
        url: string;
        transcript?: string | undefined;
    }, {
        type: "audio";
        url: string;
        transcript?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"video">;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "video";
        url: string;
    }, {
        type: "video";
        url: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"file">;
        url: z.ZodString;
        name: z.ZodString;
        mimeType: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "file";
        url: string;
        name: string;
        mimeType?: string | undefined;
    }, {
        type: "file";
        url: string;
        name: string;
        mimeType?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"location">;
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "location";
        lat: number;
        lng: number;
        label?: string | undefined;
    }, {
        type: "location";
        lat: number;
        lng: number;
        label?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"sticker">;
        id: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "sticker";
        id: string;
        url?: string | undefined;
    }, {
        type: "sticker";
        id: string;
        url?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"reaction">;
        emoji: z.ZodString;
        messageId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "reaction";
        emoji: string;
        messageId: string;
    }, {
        type: "reaction";
        emoji: string;
        messageId: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"canvas">;
        json: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        type: "canvas";
        json: Record<string, unknown>;
    }, {
        type: "canvas";
        json: Record<string, unknown>;
    }>]>, "many">;
    isStreaming: z.ZodDefault<z.ZodBoolean>;
    streamDone: z.ZodOptional<z.ZodBoolean>;
    streamToken: z.ZodOptional<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    conversationId: string;
    content: ({
        type: "text";
        text: string;
    } | {
        type: "image";
        url: string;
        alt?: string | undefined;
    } | {
        type: "audio";
        url: string;
        transcript?: string | undefined;
    } | {
        type: "video";
        url: string;
    } | {
        type: "file";
        url: string;
        name: string;
        mimeType?: string | undefined;
    } | {
        type: "location";
        lat: number;
        lng: number;
        label?: string | undefined;
    } | {
        type: "sticker";
        id: string;
        url?: string | undefined;
    } | {
        type: "reaction";
        emoji: string;
        messageId: string;
    } | {
        type: "canvas";
        json: Record<string, unknown>;
    })[];
    metadata: Record<string, unknown>;
    isStreaming: boolean;
    threadId?: string | undefined;
    channelMessageId?: string | undefined;
    streamDone?: boolean | undefined;
    streamToken?: string | undefined;
}, {
    conversationId: string;
    content: ({
        type: "text";
        text: string;
    } | {
        type: "image";
        url: string;
        alt?: string | undefined;
    } | {
        type: "audio";
        url: string;
        transcript?: string | undefined;
    } | {
        type: "video";
        url: string;
    } | {
        type: "file";
        url: string;
        name: string;
        mimeType?: string | undefined;
    } | {
        type: "location";
        lat: number;
        lng: number;
        label?: string | undefined;
    } | {
        type: "sticker";
        id: string;
        url?: string | undefined;
    } | {
        type: "reaction";
        emoji: string;
        messageId: string;
    } | {
        type: "canvas";
        json: Record<string, unknown>;
    })[];
    threadId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    channelMessageId?: string | undefined;
    isStreaming?: boolean | undefined;
    streamDone?: boolean | undefined;
    streamToken?: string | undefined;
}>;
export type ReplyEnvelope = z.infer<typeof ReplyEnvelopeSchema>;
export declare const ApprovalModeSchema: z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>;
export type ApprovalMode = z.infer<typeof ApprovalModeSchema>;
export declare const SandboxConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    type: z.ZodDefault<z.ZodEnum<["docker", "ssh"]>>;
    image: z.ZodOptional<z.ZodString>;
    host: z.ZodOptional<z.ZodString>;
    port: z.ZodOptional<z.ZodNumber>;
    username: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "docker" | "ssh";
    enabled: boolean;
    image?: string | undefined;
    host?: string | undefined;
    port?: number | undefined;
    username?: string | undefined;
}, {
    type?: "docker" | "ssh" | undefined;
    image?: string | undefined;
    enabled?: boolean | undefined;
    host?: string | undefined;
    port?: number | undefined;
    username?: string | undefined;
}>;
export declare const ToolConfigSchema: z.ZodObject<{
    bash: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        approval: "always-require-approval" | "owner-only" | "yolo";
    }, {
        enabled?: boolean | undefined;
        approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
    }>>;
    browser: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        approval: "always-require-approval" | "owner-only" | "yolo";
    }, {
        enabled?: boolean | undefined;
        approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
    }>>;
    canvas: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        approval: "always-require-approval" | "owner-only" | "yolo";
    }, {
        enabled?: boolean | undefined;
        approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
    }>>;
    cron: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        approval: "always-require-approval" | "owner-only" | "yolo";
    }, {
        enabled?: boolean | undefined;
        approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
    }>>;
    sessionSpawn: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        approval: "always-require-approval" | "owner-only" | "yolo";
    }, {
        enabled?: boolean | undefined;
        approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
    }>>;
    imageGen: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        approval: "always-require-approval" | "owner-only" | "yolo";
    }, {
        enabled?: boolean | undefined;
        approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
    }>>;
    fileRead: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
        allowedPaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        approval: "always-require-approval" | "owner-only" | "yolo";
        allowedPaths: string[];
    }, {
        enabled?: boolean | undefined;
        approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        allowedPaths?: string[] | undefined;
    }>>;
    fileWrite: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
        allowedPaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        approval: "always-require-approval" | "owner-only" | "yolo";
        allowedPaths: string[];
    }, {
        enabled?: boolean | undefined;
        approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        allowedPaths?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    canvas: {
        enabled: boolean;
        approval: "always-require-approval" | "owner-only" | "yolo";
    };
    bash: {
        enabled: boolean;
        approval: "always-require-approval" | "owner-only" | "yolo";
    };
    browser: {
        enabled: boolean;
        approval: "always-require-approval" | "owner-only" | "yolo";
    };
    cron: {
        enabled: boolean;
        approval: "always-require-approval" | "owner-only" | "yolo";
    };
    sessionSpawn: {
        enabled: boolean;
        approval: "always-require-approval" | "owner-only" | "yolo";
    };
    imageGen: {
        enabled: boolean;
        approval: "always-require-approval" | "owner-only" | "yolo";
    };
    fileRead: {
        enabled: boolean;
        approval: "always-require-approval" | "owner-only" | "yolo";
        allowedPaths: string[];
    };
    fileWrite: {
        enabled: boolean;
        approval: "always-require-approval" | "owner-only" | "yolo";
        allowedPaths: string[];
    };
}, {
    canvas?: {
        enabled?: boolean | undefined;
        approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
    } | undefined;
    bash?: {
        enabled?: boolean | undefined;
        approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
    } | undefined;
    browser?: {
        enabled?: boolean | undefined;
        approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
    } | undefined;
    cron?: {
        enabled?: boolean | undefined;
        approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
    } | undefined;
    sessionSpawn?: {
        enabled?: boolean | undefined;
        approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
    } | undefined;
    imageGen?: {
        enabled?: boolean | undefined;
        approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
    } | undefined;
    fileRead?: {
        enabled?: boolean | undefined;
        approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        allowedPaths?: string[] | undefined;
    } | undefined;
    fileWrite?: {
        enabled?: boolean | undefined;
        approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        allowedPaths?: string[] | undefined;
    } | undefined;
}>;
export type ToolConfig = z.infer<typeof ToolConfigSchema>;
export declare const ProviderRefSchema: z.ZodObject<{
    provider: z.ZodString;
    model: z.ZodString;
    apiKey: z.ZodOptional<z.ZodString>;
    baseUrl: z.ZodOptional<z.ZodString>;
    preset: z.ZodOptional<z.ZodString>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    modelAliases: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    temperature: z.ZodDefault<z.ZodNumber>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
    systemPrompt: z.ZodOptional<z.ZodString>;
    options: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    options: Record<string, unknown>;
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
    apiKey?: string | undefined;
    baseUrl?: string | undefined;
    preset?: string | undefined;
    headers?: Record<string, string> | undefined;
    modelAliases?: Record<string, string> | undefined;
    systemPrompt?: string | undefined;
}, {
    provider: string;
    model: string;
    options?: Record<string, unknown> | undefined;
    apiKey?: string | undefined;
    baseUrl?: string | undefined;
    preset?: string | undefined;
    headers?: Record<string, string> | undefined;
    modelAliases?: Record<string, string> | undefined;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    systemPrompt?: string | undefined;
}>;
export type ProviderRef = z.infer<typeof ProviderRefSchema>;
export declare const AgentConfigSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    model: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        apiKey: z.ZodOptional<z.ZodString>;
        baseUrl: z.ZodOptional<z.ZodString>;
        preset: z.ZodOptional<z.ZodString>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        modelAliases: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        temperature: z.ZodDefault<z.ZodNumber>;
        maxTokens: z.ZodDefault<z.ZodNumber>;
        systemPrompt: z.ZodOptional<z.ZodString>;
        options: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        options: Record<string, unknown>;
        provider: string;
        model: string;
        temperature: number;
        maxTokens: number;
        apiKey?: string | undefined;
        baseUrl?: string | undefined;
        preset?: string | undefined;
        headers?: Record<string, string> | undefined;
        modelAliases?: Record<string, string> | undefined;
        systemPrompt?: string | undefined;
    }, {
        provider: string;
        model: string;
        options?: Record<string, unknown> | undefined;
        apiKey?: string | undefined;
        baseUrl?: string | undefined;
        preset?: string | undefined;
        headers?: Record<string, string> | undefined;
        modelAliases?: Record<string, string> | undefined;
        temperature?: number | undefined;
        maxTokens?: number | undefined;
        systemPrompt?: string | undefined;
    }>;
    fallbackChain: z.ZodDefault<z.ZodArray<z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        apiKey: z.ZodOptional<z.ZodString>;
        baseUrl: z.ZodOptional<z.ZodString>;
        preset: z.ZodOptional<z.ZodString>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        modelAliases: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        temperature: z.ZodDefault<z.ZodNumber>;
        maxTokens: z.ZodDefault<z.ZodNumber>;
        systemPrompt: z.ZodOptional<z.ZodString>;
        options: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        options: Record<string, unknown>;
        provider: string;
        model: string;
        temperature: number;
        maxTokens: number;
        apiKey?: string | undefined;
        baseUrl?: string | undefined;
        preset?: string | undefined;
        headers?: Record<string, string> | undefined;
        modelAliases?: Record<string, string> | undefined;
        systemPrompt?: string | undefined;
    }, {
        provider: string;
        model: string;
        options?: Record<string, unknown> | undefined;
        apiKey?: string | undefined;
        baseUrl?: string | undefined;
        preset?: string | undefined;
        headers?: Record<string, string> | undefined;
        modelAliases?: Record<string, string> | undefined;
        temperature?: number | undefined;
        maxTokens?: number | undefined;
        systemPrompt?: string | undefined;
    }>, "many">>;
    tools: z.ZodDefault<z.ZodObject<{
        bash: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        }, {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        }>>;
        browser: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        }, {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        }>>;
        canvas: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        }, {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        }>>;
        cron: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        }, {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        }>>;
        sessionSpawn: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        }, {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        }>>;
        imageGen: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        }, {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        }>>;
        fileRead: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
            allowedPaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
            allowedPaths: string[];
        }, {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            allowedPaths?: string[] | undefined;
        }>>;
        fileWrite: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
            allowedPaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
            allowedPaths: string[];
        }, {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            allowedPaths?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        canvas: {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        };
        bash: {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        };
        browser: {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        };
        cron: {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        };
        sessionSpawn: {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        };
        imageGen: {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        };
        fileRead: {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
            allowedPaths: string[];
        };
        fileWrite: {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
            allowedPaths: string[];
        };
    }, {
        canvas?: {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        } | undefined;
        bash?: {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        } | undefined;
        browser?: {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        } | undefined;
        cron?: {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        } | undefined;
        sessionSpawn?: {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        } | undefined;
        imageGen?: {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        } | undefined;
        fileRead?: {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            allowedPaths?: string[] | undefined;
        } | undefined;
        fileWrite?: {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            allowedPaths?: string[] | undefined;
        } | undefined;
    }>>;
    sandbox: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        type: z.ZodDefault<z.ZodEnum<["docker", "ssh"]>>;
        image: z.ZodOptional<z.ZodString>;
        host: z.ZodOptional<z.ZodString>;
        port: z.ZodOptional<z.ZodNumber>;
        username: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "docker" | "ssh";
        enabled: boolean;
        image?: string | undefined;
        host?: string | undefined;
        port?: number | undefined;
        username?: string | undefined;
    }, {
        type?: "docker" | "ssh" | undefined;
        image?: string | undefined;
        enabled?: boolean | undefined;
        host?: string | undefined;
        port?: number | undefined;
        username?: string | undefined;
    }>>;
    systemPrompt: z.ZodOptional<z.ZodString>;
    mentionGating: z.ZodDefault<z.ZodBoolean>;
    maxSessionTurns: z.ZodDefault<z.ZodNumber>;
    compactionThreshold: z.ZodDefault<z.ZodNumber>;
    voice: z.ZodDefault<z.ZodObject<{
        provider: z.ZodDefault<z.ZodEnum<["openai-realtime", "gemini-live", "elevenlabs", "system-tts"]>>;
        voiceId: z.ZodOptional<z.ZodString>;
        wakeWord: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        provider: "openai-realtime" | "gemini-live" | "elevenlabs" | "system-tts";
        voiceId?: string | undefined;
        wakeWord?: string | undefined;
    }, {
        provider?: "openai-realtime" | "gemini-live" | "elevenlabs" | "system-tts" | undefined;
        voiceId?: string | undefined;
        wakeWord?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    model: {
        options: Record<string, unknown>;
        provider: string;
        model: string;
        temperature: number;
        maxTokens: number;
        apiKey?: string | undefined;
        baseUrl?: string | undefined;
        preset?: string | undefined;
        headers?: Record<string, string> | undefined;
        modelAliases?: Record<string, string> | undefined;
        systemPrompt?: string | undefined;
    };
    fallbackChain: {
        options: Record<string, unknown>;
        provider: string;
        model: string;
        temperature: number;
        maxTokens: number;
        apiKey?: string | undefined;
        baseUrl?: string | undefined;
        preset?: string | undefined;
        headers?: Record<string, string> | undefined;
        modelAliases?: Record<string, string> | undefined;
        systemPrompt?: string | undefined;
    }[];
    tools: {
        canvas: {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        };
        bash: {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        };
        browser: {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        };
        cron: {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        };
        sessionSpawn: {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        };
        imageGen: {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
        };
        fileRead: {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
            allowedPaths: string[];
        };
        fileWrite: {
            enabled: boolean;
            approval: "always-require-approval" | "owner-only" | "yolo";
            allowedPaths: string[];
        };
    };
    sandbox: {
        type: "docker" | "ssh";
        enabled: boolean;
        image?: string | undefined;
        host?: string | undefined;
        port?: number | undefined;
        username?: string | undefined;
    };
    mentionGating: boolean;
    maxSessionTurns: number;
    compactionThreshold: number;
    voice: {
        provider: "openai-realtime" | "gemini-live" | "elevenlabs" | "system-tts";
        voiceId?: string | undefined;
        wakeWord?: string | undefined;
    };
    systemPrompt?: string | undefined;
    description?: string | undefined;
}, {
    name: string;
    id: string;
    model: {
        provider: string;
        model: string;
        options?: Record<string, unknown> | undefined;
        apiKey?: string | undefined;
        baseUrl?: string | undefined;
        preset?: string | undefined;
        headers?: Record<string, string> | undefined;
        modelAliases?: Record<string, string> | undefined;
        temperature?: number | undefined;
        maxTokens?: number | undefined;
        systemPrompt?: string | undefined;
    };
    systemPrompt?: string | undefined;
    description?: string | undefined;
    fallbackChain?: {
        provider: string;
        model: string;
        options?: Record<string, unknown> | undefined;
        apiKey?: string | undefined;
        baseUrl?: string | undefined;
        preset?: string | undefined;
        headers?: Record<string, string> | undefined;
        modelAliases?: Record<string, string> | undefined;
        temperature?: number | undefined;
        maxTokens?: number | undefined;
        systemPrompt?: string | undefined;
    }[] | undefined;
    tools?: {
        canvas?: {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        } | undefined;
        bash?: {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        } | undefined;
        browser?: {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        } | undefined;
        cron?: {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        } | undefined;
        sessionSpawn?: {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        } | undefined;
        imageGen?: {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
        } | undefined;
        fileRead?: {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            allowedPaths?: string[] | undefined;
        } | undefined;
        fileWrite?: {
            enabled?: boolean | undefined;
            approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            allowedPaths?: string[] | undefined;
        } | undefined;
    } | undefined;
    sandbox?: {
        type?: "docker" | "ssh" | undefined;
        image?: string | undefined;
        enabled?: boolean | undefined;
        host?: string | undefined;
        port?: number | undefined;
        username?: string | undefined;
    } | undefined;
    mentionGating?: boolean | undefined;
    maxSessionTurns?: number | undefined;
    compactionThreshold?: number | undefined;
    voice?: {
        provider?: "openai-realtime" | "gemini-live" | "elevenlabs" | "system-tts" | undefined;
        voiceId?: string | undefined;
        wakeWord?: string | undefined;
    } | undefined;
}>;
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export declare const ChannelConfigSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    enabled: z.ZodDefault<z.ZodBoolean>;
    credentials: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    options: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    allowlist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    mentionGating: z.ZodDefault<z.ZodBoolean>;
    pairingEnabled: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: string;
    options: Record<string, unknown>;
    id: string;
    enabled: boolean;
    mentionGating: boolean;
    credentials: Record<string, unknown>;
    allowlist: string[];
    pairingEnabled: boolean;
}, {
    type: string;
    id: string;
    options?: Record<string, unknown> | undefined;
    enabled?: boolean | undefined;
    mentionGating?: boolean | undefined;
    credentials?: Record<string, unknown> | undefined;
    allowlist?: string[] | undefined;
    pairingEnabled?: boolean | undefined;
}>;
export type ChannelConfig = z.infer<typeof ChannelConfigSchema>;
export declare const BindingConfigSchema: z.ZodObject<{
    channelId: z.ZodString;
    senderId: z.ZodOptional<z.ZodString>;
    agentId: z.ZodString;
    conversationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    channelId: string;
    agentId: string;
    conversationId?: string | undefined;
    senderId?: string | undefined;
}, {
    channelId: string;
    agentId: string;
    conversationId?: string | undefined;
    senderId?: string | undefined;
}>;
export type BindingConfig = z.infer<typeof BindingConfigSchema>;
export declare const DeviceConfigSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["mobile", "desktop", "web"]>;
    token: z.ZodOptional<z.ZodString>;
    paired: z.ZodDefault<z.ZodBoolean>;
    lastSeen: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "mobile" | "desktop" | "web";
    name: string;
    id: string;
    paired: boolean;
    token?: string | undefined;
    lastSeen?: number | undefined;
}, {
    type: "mobile" | "desktop" | "web";
    name: string;
    id: string;
    token?: string | undefined;
    paired?: boolean | undefined;
    lastSeen?: number | undefined;
}>;
export type DeviceConfig = z.infer<typeof DeviceConfigSchema>;
export declare const VoiceConfigSchema: z.ZodObject<{
    defaultProvider: z.ZodDefault<z.ZodEnum<["openai-realtime", "gemini-live", "elevenlabs", "system-tts"]>>;
    openaiRealtime: z.ZodDefault<z.ZodObject<{
        apiKey: z.ZodOptional<z.ZodString>;
        model: z.ZodDefault<z.ZodString>;
        voice: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        model: string;
        voice: string;
        apiKey?: string | undefined;
    }, {
        model?: string | undefined;
        apiKey?: string | undefined;
        voice?: string | undefined;
    }>>;
    geminiLive: z.ZodDefault<z.ZodObject<{
        apiKey: z.ZodOptional<z.ZodString>;
        model: z.ZodDefault<z.ZodString>;
        voice: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        model: string;
        voice: string;
        apiKey?: string | undefined;
    }, {
        model?: string | undefined;
        apiKey?: string | undefined;
        voice?: string | undefined;
    }>>;
    elevenlabs: z.ZodDefault<z.ZodObject<{
        apiKey: z.ZodOptional<z.ZodString>;
        voiceId: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        voiceId: string;
        apiKey?: string | undefined;
    }, {
        apiKey?: string | undefined;
        voiceId?: string | undefined;
    }>>;
    systemTts: z.ZodDefault<z.ZodObject<{
        rate: z.ZodDefault<z.ZodNumber>;
        pitch: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        rate: number;
        pitch: number;
    }, {
        rate?: number | undefined;
        pitch?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    elevenlabs: {
        voiceId: string;
        apiKey?: string | undefined;
    };
    defaultProvider: "openai-realtime" | "gemini-live" | "elevenlabs" | "system-tts";
    openaiRealtime: {
        model: string;
        voice: string;
        apiKey?: string | undefined;
    };
    geminiLive: {
        model: string;
        voice: string;
        apiKey?: string | undefined;
    };
    systemTts: {
        rate: number;
        pitch: number;
    };
}, {
    elevenlabs?: {
        apiKey?: string | undefined;
        voiceId?: string | undefined;
    } | undefined;
    defaultProvider?: "openai-realtime" | "gemini-live" | "elevenlabs" | "system-tts" | undefined;
    openaiRealtime?: {
        model?: string | undefined;
        apiKey?: string | undefined;
        voice?: string | undefined;
    } | undefined;
    geminiLive?: {
        model?: string | undefined;
        apiKey?: string | undefined;
        voice?: string | undefined;
    } | undefined;
    systemTts?: {
        rate?: number | undefined;
        pitch?: number | undefined;
    } | undefined;
}>;
export type VoiceConfig = z.infer<typeof VoiceConfigSchema>;
export declare const LoggingConfigSchema: z.ZodObject<{
    level: z.ZodDefault<z.ZodEnum<["silent", "error", "warn", "info", "debug", "trace"]>>;
    subsystems: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodEnum<["silent", "error", "warn", "info", "debug", "trace"]>>>;
    file: z.ZodOptional<z.ZodString>;
    otel: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        endpoint: z.ZodOptional<z.ZodString>;
        headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        headers: Record<string, string>;
        endpoint?: string | undefined;
    }, {
        enabled?: boolean | undefined;
        headers?: Record<string, string> | undefined;
        endpoint?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    level: "silent" | "error" | "warn" | "info" | "debug" | "trace";
    subsystems: Record<string, "silent" | "error" | "warn" | "info" | "debug" | "trace">;
    otel: {
        enabled: boolean;
        headers: Record<string, string>;
        endpoint?: string | undefined;
    };
    file?: string | undefined;
}, {
    file?: string | undefined;
    level?: "silent" | "error" | "warn" | "info" | "debug" | "trace" | undefined;
    subsystems?: Record<string, "silent" | "error" | "warn" | "info" | "debug" | "trace"> | undefined;
    otel?: {
        enabled?: boolean | undefined;
        headers?: Record<string, string> | undefined;
        endpoint?: string | undefined;
    } | undefined;
}>;
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;
export declare const StorageConfigSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<["jsonl", "sqlite"]>>;
    workspacePath: z.ZodDefault<z.ZodString>;
    lanceDbPath: z.ZodDefault<z.ZodString>;
    sqlitePath: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "jsonl" | "sqlite";
    workspacePath: string;
    lanceDbPath: string;
    sqlitePath: string;
}, {
    type?: "jsonl" | "sqlite" | undefined;
    workspacePath?: string | undefined;
    lanceDbPath?: string | undefined;
    sqlitePath?: string | undefined;
}>;
export type StorageConfig = z.infer<typeof StorageConfigSchema>;
export declare const GatewayConfigSchema: z.ZodObject<{
    host: z.ZodDefault<z.ZodString>;
    port: z.ZodDefault<z.ZodNumber>;
    webhookPath: z.ZodDefault<z.ZodString>;
    corsOrigins: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    wsHeartbeatIntervalMs: z.ZodDefault<z.ZodNumber>;
    apiToken: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    host: string;
    port: number;
    webhookPath: string;
    corsOrigins: string[];
    wsHeartbeatIntervalMs: number;
    apiToken?: string | undefined;
}, {
    host?: string | undefined;
    port?: number | undefined;
    webhookPath?: string | undefined;
    corsOrigins?: string[] | undefined;
    wsHeartbeatIntervalMs?: number | undefined;
    apiToken?: string | undefined;
}>;
export type GatewayConfig = z.infer<typeof GatewayConfigSchema>;
export declare const MxClawConfigSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    gateway: z.ZodDefault<z.ZodObject<{
        host: z.ZodDefault<z.ZodString>;
        port: z.ZodDefault<z.ZodNumber>;
        webhookPath: z.ZodDefault<z.ZodString>;
        corsOrigins: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        wsHeartbeatIntervalMs: z.ZodDefault<z.ZodNumber>;
        apiToken: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        host: string;
        port: number;
        webhookPath: string;
        corsOrigins: string[];
        wsHeartbeatIntervalMs: number;
        apiToken?: string | undefined;
    }, {
        host?: string | undefined;
        port?: number | undefined;
        webhookPath?: string | undefined;
        corsOrigins?: string[] | undefined;
        wsHeartbeatIntervalMs?: number | undefined;
        apiToken?: string | undefined;
    }>>;
    agents: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        model: z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
            apiKey: z.ZodOptional<z.ZodString>;
            baseUrl: z.ZodOptional<z.ZodString>;
            preset: z.ZodOptional<z.ZodString>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            modelAliases: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            temperature: z.ZodDefault<z.ZodNumber>;
            maxTokens: z.ZodDefault<z.ZodNumber>;
            systemPrompt: z.ZodOptional<z.ZodString>;
            options: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            options: Record<string, unknown>;
            provider: string;
            model: string;
            temperature: number;
            maxTokens: number;
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            preset?: string | undefined;
            headers?: Record<string, string> | undefined;
            modelAliases?: Record<string, string> | undefined;
            systemPrompt?: string | undefined;
        }, {
            provider: string;
            model: string;
            options?: Record<string, unknown> | undefined;
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            preset?: string | undefined;
            headers?: Record<string, string> | undefined;
            modelAliases?: Record<string, string> | undefined;
            temperature?: number | undefined;
            maxTokens?: number | undefined;
            systemPrompt?: string | undefined;
        }>;
        fallbackChain: z.ZodDefault<z.ZodArray<z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
            apiKey: z.ZodOptional<z.ZodString>;
            baseUrl: z.ZodOptional<z.ZodString>;
            preset: z.ZodOptional<z.ZodString>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            modelAliases: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            temperature: z.ZodDefault<z.ZodNumber>;
            maxTokens: z.ZodDefault<z.ZodNumber>;
            systemPrompt: z.ZodOptional<z.ZodString>;
            options: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            options: Record<string, unknown>;
            provider: string;
            model: string;
            temperature: number;
            maxTokens: number;
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            preset?: string | undefined;
            headers?: Record<string, string> | undefined;
            modelAliases?: Record<string, string> | undefined;
            systemPrompt?: string | undefined;
        }, {
            provider: string;
            model: string;
            options?: Record<string, unknown> | undefined;
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            preset?: string | undefined;
            headers?: Record<string, string> | undefined;
            modelAliases?: Record<string, string> | undefined;
            temperature?: number | undefined;
            maxTokens?: number | undefined;
            systemPrompt?: string | undefined;
        }>, "many">>;
        tools: z.ZodDefault<z.ZodObject<{
            bash: z.ZodDefault<z.ZodObject<{
                enabled: z.ZodDefault<z.ZodBoolean>;
                approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
            }, "strip", z.ZodTypeAny, {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            }, {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            }>>;
            browser: z.ZodDefault<z.ZodObject<{
                enabled: z.ZodDefault<z.ZodBoolean>;
                approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
            }, "strip", z.ZodTypeAny, {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            }, {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            }>>;
            canvas: z.ZodDefault<z.ZodObject<{
                enabled: z.ZodDefault<z.ZodBoolean>;
                approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
            }, "strip", z.ZodTypeAny, {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            }, {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            }>>;
            cron: z.ZodDefault<z.ZodObject<{
                enabled: z.ZodDefault<z.ZodBoolean>;
                approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
            }, "strip", z.ZodTypeAny, {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            }, {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            }>>;
            sessionSpawn: z.ZodDefault<z.ZodObject<{
                enabled: z.ZodDefault<z.ZodBoolean>;
                approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
            }, "strip", z.ZodTypeAny, {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            }, {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            }>>;
            imageGen: z.ZodDefault<z.ZodObject<{
                enabled: z.ZodDefault<z.ZodBoolean>;
                approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
            }, "strip", z.ZodTypeAny, {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            }, {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            }>>;
            fileRead: z.ZodDefault<z.ZodObject<{
                enabled: z.ZodDefault<z.ZodBoolean>;
                approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
                allowedPaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
                allowedPaths: string[];
            }, {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
                allowedPaths?: string[] | undefined;
            }>>;
            fileWrite: z.ZodDefault<z.ZodObject<{
                enabled: z.ZodDefault<z.ZodBoolean>;
                approval: z.ZodDefault<z.ZodEnum<["always-require-approval", "owner-only", "yolo"]>>;
                allowedPaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
                allowedPaths: string[];
            }, {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
                allowedPaths?: string[] | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            canvas: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            bash: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            browser: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            cron: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            sessionSpawn: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            imageGen: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            fileRead: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
                allowedPaths: string[];
            };
            fileWrite: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
                allowedPaths: string[];
            };
        }, {
            canvas?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            bash?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            browser?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            cron?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            sessionSpawn?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            imageGen?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            fileRead?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
                allowedPaths?: string[] | undefined;
            } | undefined;
            fileWrite?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
                allowedPaths?: string[] | undefined;
            } | undefined;
        }>>;
        sandbox: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            type: z.ZodDefault<z.ZodEnum<["docker", "ssh"]>>;
            image: z.ZodOptional<z.ZodString>;
            host: z.ZodOptional<z.ZodString>;
            port: z.ZodOptional<z.ZodNumber>;
            username: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "docker" | "ssh";
            enabled: boolean;
            image?: string | undefined;
            host?: string | undefined;
            port?: number | undefined;
            username?: string | undefined;
        }, {
            type?: "docker" | "ssh" | undefined;
            image?: string | undefined;
            enabled?: boolean | undefined;
            host?: string | undefined;
            port?: number | undefined;
            username?: string | undefined;
        }>>;
        systemPrompt: z.ZodOptional<z.ZodString>;
        mentionGating: z.ZodDefault<z.ZodBoolean>;
        maxSessionTurns: z.ZodDefault<z.ZodNumber>;
        compactionThreshold: z.ZodDefault<z.ZodNumber>;
        voice: z.ZodDefault<z.ZodObject<{
            provider: z.ZodDefault<z.ZodEnum<["openai-realtime", "gemini-live", "elevenlabs", "system-tts"]>>;
            voiceId: z.ZodOptional<z.ZodString>;
            wakeWord: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            provider: "openai-realtime" | "gemini-live" | "elevenlabs" | "system-tts";
            voiceId?: string | undefined;
            wakeWord?: string | undefined;
        }, {
            provider?: "openai-realtime" | "gemini-live" | "elevenlabs" | "system-tts" | undefined;
            voiceId?: string | undefined;
            wakeWord?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        model: {
            options: Record<string, unknown>;
            provider: string;
            model: string;
            temperature: number;
            maxTokens: number;
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            preset?: string | undefined;
            headers?: Record<string, string> | undefined;
            modelAliases?: Record<string, string> | undefined;
            systemPrompt?: string | undefined;
        };
        fallbackChain: {
            options: Record<string, unknown>;
            provider: string;
            model: string;
            temperature: number;
            maxTokens: number;
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            preset?: string | undefined;
            headers?: Record<string, string> | undefined;
            modelAliases?: Record<string, string> | undefined;
            systemPrompt?: string | undefined;
        }[];
        tools: {
            canvas: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            bash: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            browser: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            cron: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            sessionSpawn: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            imageGen: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            fileRead: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
                allowedPaths: string[];
            };
            fileWrite: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
                allowedPaths: string[];
            };
        };
        sandbox: {
            type: "docker" | "ssh";
            enabled: boolean;
            image?: string | undefined;
            host?: string | undefined;
            port?: number | undefined;
            username?: string | undefined;
        };
        mentionGating: boolean;
        maxSessionTurns: number;
        compactionThreshold: number;
        voice: {
            provider: "openai-realtime" | "gemini-live" | "elevenlabs" | "system-tts";
            voiceId?: string | undefined;
            wakeWord?: string | undefined;
        };
        systemPrompt?: string | undefined;
        description?: string | undefined;
    }, {
        name: string;
        id: string;
        model: {
            provider: string;
            model: string;
            options?: Record<string, unknown> | undefined;
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            preset?: string | undefined;
            headers?: Record<string, string> | undefined;
            modelAliases?: Record<string, string> | undefined;
            temperature?: number | undefined;
            maxTokens?: number | undefined;
            systemPrompt?: string | undefined;
        };
        systemPrompt?: string | undefined;
        description?: string | undefined;
        fallbackChain?: {
            provider: string;
            model: string;
            options?: Record<string, unknown> | undefined;
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            preset?: string | undefined;
            headers?: Record<string, string> | undefined;
            modelAliases?: Record<string, string> | undefined;
            temperature?: number | undefined;
            maxTokens?: number | undefined;
            systemPrompt?: string | undefined;
        }[] | undefined;
        tools?: {
            canvas?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            bash?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            browser?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            cron?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            sessionSpawn?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            imageGen?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            fileRead?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
                allowedPaths?: string[] | undefined;
            } | undefined;
            fileWrite?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
                allowedPaths?: string[] | undefined;
            } | undefined;
        } | undefined;
        sandbox?: {
            type?: "docker" | "ssh" | undefined;
            image?: string | undefined;
            enabled?: boolean | undefined;
            host?: string | undefined;
            port?: number | undefined;
            username?: string | undefined;
        } | undefined;
        mentionGating?: boolean | undefined;
        maxSessionTurns?: number | undefined;
        compactionThreshold?: number | undefined;
        voice?: {
            provider?: "openai-realtime" | "gemini-live" | "elevenlabs" | "system-tts" | undefined;
            voiceId?: string | undefined;
            wakeWord?: string | undefined;
        } | undefined;
    }>>>;
    defaultAgentId: z.ZodOptional<z.ZodString>;
    ownerId: z.ZodOptional<z.ZodString>;
    channels: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        enabled: z.ZodDefault<z.ZodBoolean>;
        credentials: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        options: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        allowlist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        mentionGating: z.ZodDefault<z.ZodBoolean>;
        pairingEnabled: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        options: Record<string, unknown>;
        id: string;
        enabled: boolean;
        mentionGating: boolean;
        credentials: Record<string, unknown>;
        allowlist: string[];
        pairingEnabled: boolean;
    }, {
        type: string;
        id: string;
        options?: Record<string, unknown> | undefined;
        enabled?: boolean | undefined;
        mentionGating?: boolean | undefined;
        credentials?: Record<string, unknown> | undefined;
        allowlist?: string[] | undefined;
        pairingEnabled?: boolean | undefined;
    }>>>;
    bindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
        channelId: z.ZodString;
        senderId: z.ZodOptional<z.ZodString>;
        agentId: z.ZodString;
        conversationId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        channelId: string;
        agentId: string;
        conversationId?: string | undefined;
        senderId?: string | undefined;
    }, {
        channelId: string;
        agentId: string;
        conversationId?: string | undefined;
        senderId?: string | undefined;
    }>, "many">>;
    devices: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        type: z.ZodEnum<["mobile", "desktop", "web"]>;
        token: z.ZodOptional<z.ZodString>;
        paired: z.ZodDefault<z.ZodBoolean>;
        lastSeen: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "mobile" | "desktop" | "web";
        name: string;
        id: string;
        paired: boolean;
        token?: string | undefined;
        lastSeen?: number | undefined;
    }, {
        type: "mobile" | "desktop" | "web";
        name: string;
        id: string;
        token?: string | undefined;
        paired?: boolean | undefined;
        lastSeen?: number | undefined;
    }>, "many">>;
    voice: z.ZodDefault<z.ZodObject<{
        defaultProvider: z.ZodDefault<z.ZodEnum<["openai-realtime", "gemini-live", "elevenlabs", "system-tts"]>>;
        openaiRealtime: z.ZodDefault<z.ZodObject<{
            apiKey: z.ZodOptional<z.ZodString>;
            model: z.ZodDefault<z.ZodString>;
            voice: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            model: string;
            voice: string;
            apiKey?: string | undefined;
        }, {
            model?: string | undefined;
            apiKey?: string | undefined;
            voice?: string | undefined;
        }>>;
        geminiLive: z.ZodDefault<z.ZodObject<{
            apiKey: z.ZodOptional<z.ZodString>;
            model: z.ZodDefault<z.ZodString>;
            voice: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            model: string;
            voice: string;
            apiKey?: string | undefined;
        }, {
            model?: string | undefined;
            apiKey?: string | undefined;
            voice?: string | undefined;
        }>>;
        elevenlabs: z.ZodDefault<z.ZodObject<{
            apiKey: z.ZodOptional<z.ZodString>;
            voiceId: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            voiceId: string;
            apiKey?: string | undefined;
        }, {
            apiKey?: string | undefined;
            voiceId?: string | undefined;
        }>>;
        systemTts: z.ZodDefault<z.ZodObject<{
            rate: z.ZodDefault<z.ZodNumber>;
            pitch: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            rate: number;
            pitch: number;
        }, {
            rate?: number | undefined;
            pitch?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        elevenlabs: {
            voiceId: string;
            apiKey?: string | undefined;
        };
        defaultProvider: "openai-realtime" | "gemini-live" | "elevenlabs" | "system-tts";
        openaiRealtime: {
            model: string;
            voice: string;
            apiKey?: string | undefined;
        };
        geminiLive: {
            model: string;
            voice: string;
            apiKey?: string | undefined;
        };
        systemTts: {
            rate: number;
            pitch: number;
        };
    }, {
        elevenlabs?: {
            apiKey?: string | undefined;
            voiceId?: string | undefined;
        } | undefined;
        defaultProvider?: "openai-realtime" | "gemini-live" | "elevenlabs" | "system-tts" | undefined;
        openaiRealtime?: {
            model?: string | undefined;
            apiKey?: string | undefined;
            voice?: string | undefined;
        } | undefined;
        geminiLive?: {
            model?: string | undefined;
            apiKey?: string | undefined;
            voice?: string | undefined;
        } | undefined;
        systemTts?: {
            rate?: number | undefined;
            pitch?: number | undefined;
        } | undefined;
    }>>;
    logging: z.ZodDefault<z.ZodObject<{
        level: z.ZodDefault<z.ZodEnum<["silent", "error", "warn", "info", "debug", "trace"]>>;
        subsystems: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodEnum<["silent", "error", "warn", "info", "debug", "trace"]>>>;
        file: z.ZodOptional<z.ZodString>;
        otel: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            endpoint: z.ZodOptional<z.ZodString>;
            headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            headers: Record<string, string>;
            endpoint?: string | undefined;
        }, {
            enabled?: boolean | undefined;
            headers?: Record<string, string> | undefined;
            endpoint?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        level: "silent" | "error" | "warn" | "info" | "debug" | "trace";
        subsystems: Record<string, "silent" | "error" | "warn" | "info" | "debug" | "trace">;
        otel: {
            enabled: boolean;
            headers: Record<string, string>;
            endpoint?: string | undefined;
        };
        file?: string | undefined;
    }, {
        file?: string | undefined;
        level?: "silent" | "error" | "warn" | "info" | "debug" | "trace" | undefined;
        subsystems?: Record<string, "silent" | "error" | "warn" | "info" | "debug" | "trace"> | undefined;
        otel?: {
            enabled?: boolean | undefined;
            headers?: Record<string, string> | undefined;
            endpoint?: string | undefined;
        } | undefined;
    }>>;
    storage: z.ZodDefault<z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<["jsonl", "sqlite"]>>;
        workspacePath: z.ZodDefault<z.ZodString>;
        lanceDbPath: z.ZodDefault<z.ZodString>;
        sqlitePath: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "jsonl" | "sqlite";
        workspacePath: string;
        lanceDbPath: string;
        sqlitePath: string;
    }, {
        type?: "jsonl" | "sqlite" | undefined;
        workspacePath?: string | undefined;
        lanceDbPath?: string | undefined;
        sqlitePath?: string | undefined;
    }>>;
    plugins: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    sandbox: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        type: z.ZodDefault<z.ZodEnum<["docker", "ssh"]>>;
        image: z.ZodOptional<z.ZodString>;
        host: z.ZodOptional<z.ZodString>;
        port: z.ZodOptional<z.ZodNumber>;
        username: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "docker" | "ssh";
        enabled: boolean;
        image?: string | undefined;
        host?: string | undefined;
        port?: number | undefined;
        username?: string | undefined;
    }, {
        type?: "docker" | "ssh" | undefined;
        image?: string | undefined;
        enabled?: boolean | undefined;
        host?: string | undefined;
        port?: number | undefined;
        username?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    sandbox: {
        type: "docker" | "ssh";
        enabled: boolean;
        image?: string | undefined;
        host?: string | undefined;
        port?: number | undefined;
        username?: string | undefined;
    };
    voice: {
        elevenlabs: {
            voiceId: string;
            apiKey?: string | undefined;
        };
        defaultProvider: "openai-realtime" | "gemini-live" | "elevenlabs" | "system-tts";
        openaiRealtime: {
            model: string;
            voice: string;
            apiKey?: string | undefined;
        };
        geminiLive: {
            model: string;
            voice: string;
            apiKey?: string | undefined;
        };
        systemTts: {
            rate: number;
            pitch: number;
        };
    };
    version: 1;
    gateway: {
        host: string;
        port: number;
        webhookPath: string;
        corsOrigins: string[];
        wsHeartbeatIntervalMs: number;
        apiToken?: string | undefined;
    };
    agents: Record<string, {
        name: string;
        id: string;
        model: {
            options: Record<string, unknown>;
            provider: string;
            model: string;
            temperature: number;
            maxTokens: number;
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            preset?: string | undefined;
            headers?: Record<string, string> | undefined;
            modelAliases?: Record<string, string> | undefined;
            systemPrompt?: string | undefined;
        };
        fallbackChain: {
            options: Record<string, unknown>;
            provider: string;
            model: string;
            temperature: number;
            maxTokens: number;
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            preset?: string | undefined;
            headers?: Record<string, string> | undefined;
            modelAliases?: Record<string, string> | undefined;
            systemPrompt?: string | undefined;
        }[];
        tools: {
            canvas: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            bash: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            browser: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            cron: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            sessionSpawn: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            imageGen: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
            };
            fileRead: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
                allowedPaths: string[];
            };
            fileWrite: {
                enabled: boolean;
                approval: "always-require-approval" | "owner-only" | "yolo";
                allowedPaths: string[];
            };
        };
        sandbox: {
            type: "docker" | "ssh";
            enabled: boolean;
            image?: string | undefined;
            host?: string | undefined;
            port?: number | undefined;
            username?: string | undefined;
        };
        mentionGating: boolean;
        maxSessionTurns: number;
        compactionThreshold: number;
        voice: {
            provider: "openai-realtime" | "gemini-live" | "elevenlabs" | "system-tts";
            voiceId?: string | undefined;
            wakeWord?: string | undefined;
        };
        systemPrompt?: string | undefined;
        description?: string | undefined;
    }>;
    channels: Record<string, {
        type: string;
        options: Record<string, unknown>;
        id: string;
        enabled: boolean;
        mentionGating: boolean;
        credentials: Record<string, unknown>;
        allowlist: string[];
        pairingEnabled: boolean;
    }>;
    bindings: {
        channelId: string;
        agentId: string;
        conversationId?: string | undefined;
        senderId?: string | undefined;
    }[];
    devices: {
        type: "mobile" | "desktop" | "web";
        name: string;
        id: string;
        paired: boolean;
        token?: string | undefined;
        lastSeen?: number | undefined;
    }[];
    logging: {
        level: "silent" | "error" | "warn" | "info" | "debug" | "trace";
        subsystems: Record<string, "silent" | "error" | "warn" | "info" | "debug" | "trace">;
        otel: {
            enabled: boolean;
            headers: Record<string, string>;
            endpoint?: string | undefined;
        };
        file?: string | undefined;
    };
    storage: {
        type: "jsonl" | "sqlite";
        workspacePath: string;
        lanceDbPath: string;
        sqlitePath: string;
    };
    plugins: string[];
    defaultAgentId?: string | undefined;
    ownerId?: string | undefined;
}, {
    version: 1;
    sandbox?: {
        type?: "docker" | "ssh" | undefined;
        image?: string | undefined;
        enabled?: boolean | undefined;
        host?: string | undefined;
        port?: number | undefined;
        username?: string | undefined;
    } | undefined;
    voice?: {
        elevenlabs?: {
            apiKey?: string | undefined;
            voiceId?: string | undefined;
        } | undefined;
        defaultProvider?: "openai-realtime" | "gemini-live" | "elevenlabs" | "system-tts" | undefined;
        openaiRealtime?: {
            model?: string | undefined;
            apiKey?: string | undefined;
            voice?: string | undefined;
        } | undefined;
        geminiLive?: {
            model?: string | undefined;
            apiKey?: string | undefined;
            voice?: string | undefined;
        } | undefined;
        systemTts?: {
            rate?: number | undefined;
            pitch?: number | undefined;
        } | undefined;
    } | undefined;
    gateway?: {
        host?: string | undefined;
        port?: number | undefined;
        webhookPath?: string | undefined;
        corsOrigins?: string[] | undefined;
        wsHeartbeatIntervalMs?: number | undefined;
        apiToken?: string | undefined;
    } | undefined;
    agents?: Record<string, {
        name: string;
        id: string;
        model: {
            provider: string;
            model: string;
            options?: Record<string, unknown> | undefined;
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            preset?: string | undefined;
            headers?: Record<string, string> | undefined;
            modelAliases?: Record<string, string> | undefined;
            temperature?: number | undefined;
            maxTokens?: number | undefined;
            systemPrompt?: string | undefined;
        };
        systemPrompt?: string | undefined;
        description?: string | undefined;
        fallbackChain?: {
            provider: string;
            model: string;
            options?: Record<string, unknown> | undefined;
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            preset?: string | undefined;
            headers?: Record<string, string> | undefined;
            modelAliases?: Record<string, string> | undefined;
            temperature?: number | undefined;
            maxTokens?: number | undefined;
            systemPrompt?: string | undefined;
        }[] | undefined;
        tools?: {
            canvas?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            bash?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            browser?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            cron?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            sessionSpawn?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            imageGen?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
            } | undefined;
            fileRead?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
                allowedPaths?: string[] | undefined;
            } | undefined;
            fileWrite?: {
                enabled?: boolean | undefined;
                approval?: "always-require-approval" | "owner-only" | "yolo" | undefined;
                allowedPaths?: string[] | undefined;
            } | undefined;
        } | undefined;
        sandbox?: {
            type?: "docker" | "ssh" | undefined;
            image?: string | undefined;
            enabled?: boolean | undefined;
            host?: string | undefined;
            port?: number | undefined;
            username?: string | undefined;
        } | undefined;
        mentionGating?: boolean | undefined;
        maxSessionTurns?: number | undefined;
        compactionThreshold?: number | undefined;
        voice?: {
            provider?: "openai-realtime" | "gemini-live" | "elevenlabs" | "system-tts" | undefined;
            voiceId?: string | undefined;
            wakeWord?: string | undefined;
        } | undefined;
    }> | undefined;
    defaultAgentId?: string | undefined;
    ownerId?: string | undefined;
    channels?: Record<string, {
        type: string;
        id: string;
        options?: Record<string, unknown> | undefined;
        enabled?: boolean | undefined;
        mentionGating?: boolean | undefined;
        credentials?: Record<string, unknown> | undefined;
        allowlist?: string[] | undefined;
        pairingEnabled?: boolean | undefined;
    }> | undefined;
    bindings?: {
        channelId: string;
        agentId: string;
        conversationId?: string | undefined;
        senderId?: string | undefined;
    }[] | undefined;
    devices?: {
        type: "mobile" | "desktop" | "web";
        name: string;
        id: string;
        token?: string | undefined;
        paired?: boolean | undefined;
        lastSeen?: number | undefined;
    }[] | undefined;
    logging?: {
        file?: string | undefined;
        level?: "silent" | "error" | "warn" | "info" | "debug" | "trace" | undefined;
        subsystems?: Record<string, "silent" | "error" | "warn" | "info" | "debug" | "trace"> | undefined;
        otel?: {
            enabled?: boolean | undefined;
            headers?: Record<string, string> | undefined;
            endpoint?: string | undefined;
        } | undefined;
    } | undefined;
    storage?: {
        type?: "jsonl" | "sqlite" | undefined;
        workspacePath?: string | undefined;
        lanceDbPath?: string | undefined;
        sqlitePath?: string | undefined;
    } | undefined;
    plugins?: string[] | undefined;
}>;
export type MxClawConfig = z.infer<typeof MxClawConfigSchema>;
export interface SessionTurn {
    role: "user" | "assistant" | "system" | "tool";
    content: string;
    toolCalls?: Array<{
        id: string;
        name: string;
        arguments: Record<string, unknown>;
    }>;
    toolResults?: Array<{
        id: string;
        name: string;
        result: string;
        error?: string;
    }>;
    timestamp: number;
    tokenCount?: number;
}
export interface SessionCompactionPoint {
    turnIndex: number;
    summary: string;
    timestamp: number;
}
export interface SessionManifest {
    sessionKey: string;
    agentId: string;
    channelId: string;
    senderId: string;
    conversationId: string;
    createdAt: number;
    lastActiveAt: number;
    turnCount: number;
    compactionPoints: SessionCompactionPoint[];
}
export interface PluginManifest {
    name: string;
    version: string;
    type: "channel" | "provider" | "tool" | "voice" | "extension";
    description: string;
    author: string;
    main: string;
    capabilities: string[];
    dependencies?: Record<string, string>;
}
export interface ChannelStatus {
    id: string;
    type: string;
    connected: boolean;
    lastConnectedAt?: number;
    error?: string;
    messageCount: number;
    queueSize: number;
}
export interface ProviderStatus {
    provider: string;
    model: string;
    available: boolean;
    lastCheckAt?: number;
    error?: string;
    latencyMs?: number;
}
export interface GatewayStatus {
    uptime: number;
    channels: ChannelStatus[];
    providers: ProviderStatus[];
    activeSessions: number;
    deviceCount: number;
    pluginErrors: Array<{
        plugin: string;
        error: string;
    }>;
    memoryUsage: {
        heapUsed: number;
        heapTotal: number;
        rss: number;
    };
}
export type WsClientMessage = {
    type: "auth";
    token: string;
} | {
    type: "chat:send";
    envelope: MessageEnvelope;
} | {
    type: "chat:approve";
    approvalId: string;
    approved: boolean;
} | {
    type: "canvas:event";
    event: Record<string, unknown>;
} | {
    type: "voice:start";
} | {
    type: "voice:stop";
} | {
    type: "voice:audio";
    data: string;
} | {
    type: "presence:update";
    status: "online" | "away" | "offline";
} | {
    type: "ping";
};
export type WsServerMessage = {
    type: "auth:ok";
    deviceId: string;
} | {
    type: "auth:error";
    error: string;
} | {
    type: "chat:token";
    token: string;
    conversationId: string;
    messageId: string;
} | {
    type: "chat:done";
    conversationId: string;
    messageId: string;
    fullText: string;
} | {
    type: "chat:error";
    conversationId: string;
    error: string;
} | {
    type: "approval:required";
    approvalId: string;
    tool: string;
    args: Record<string, unknown>;
    agentId: string;
} | {
    type: "canvas:update";
    json: Record<string, unknown>;
} | {
    type: "voice:token";
    token: string;
} | {
    type: "voice:error";
    error: string;
} | {
    type: "presence:update";
    deviceId: string;
    status: string;
} | {
    type: "status:update";
    status: GatewayStatus;
} | {
    type: "pong";
} | {
    type: "error";
    message: string;
    code: string;
};
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: z.ZodType;
    execute: (args: Record<string, unknown>, context: ToolContext) => Promise<ToolResult>;
}
export interface ToolContext {
    agentId: string;
    sessionKey: string;
    workspacePath: string;
    sandbox?: z.infer<typeof SandboxConfigSchema>;
    signal?: AbortSignal;
}
export interface ToolResult {
    success: boolean;
    output: string;
    error?: string;
    artifacts?: Array<{
        type: string;
        url: string;
        name: string;
    }>;
}
export interface ApprovalRequest {
    id: string;
    tool: string;
    args: Record<string, unknown>;
    agentId: string;
    sessionKey: string;
    timestamp: number;
    status: "pending" | "approved" | "denied" | "timed-out";
}
export type LLMMessageContent = string | Array<{
    type: "text";
    text: string;
} | {
    type: "image_url";
    image_url: {
        url: string;
        detail?: "auto" | "low" | "high";
    };
} | {
    type: "image";
    source?: {
        type: "base64";
        media_type: string;
        data: string;
    };
}>;
export interface LLMCompletionRequest {
    model: string;
    messages: Array<{
        role: string;
        content: LLMMessageContent;
        tool_call_id?: string;
        name?: string;
    }>;
    tools?: Array<{
        type: "function";
        function: {
            name: string;
            description: string;
            parameters: Record<string, unknown>;
        };
    }>;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    signal?: AbortSignal;
}
export interface LLMCompletionChunk {
    content: string;
    toolCalls?: Array<{
        id: string;
        name: string;
        arguments: string;
    }>;
    finishReason?: "stop" | "tool_calls" | "length" | "error";
}
export interface LLMCompletionResponse {
    content: string;
    toolCalls?: Array<{
        id: string;
        name: string;
        arguments: Record<string, unknown>;
    }>;
    finishReason: "stop" | "tool_calls" | "length" | "error";
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export interface ChannelPlugin {
    manifest: PluginManifest;
    setupChannel: (config: ChannelConfig) => Promise<void>;
    startChannel: (config: ChannelConfig, onMessage: (env: MessageEnvelope) => Promise<void>) => Promise<void>;
    stopChannel: (channelId: string) => Promise<void>;
    sendMessage: (channelId: string, reply: ReplyEnvelope) => Promise<void>;
    handleCommand?: (channelId: string, command: string, args: string[]) => Promise<void>;
    handleApproval?: (channelId: string, approval: ApprovalRequest) => Promise<void>;
    getStatus: (channelId: string) => Promise<ChannelStatus>;
}
export interface ProviderPlugin {
    manifest: PluginManifest;
    initialize: (config: Record<string, unknown>) => Promise<void>;
    complete: (request: LLMCompletionRequest) => Promise<LLMCompletionResponse>;
    completeStream: (request: LLMCompletionRequest) => AsyncGenerator<LLMCompletionChunk>;
    listModels: () => Promise<Array<{
        id: string;
        name: string;
    }>>;
    healthCheck: () => Promise<boolean>;
}
export interface VoicePlugin {
    manifest: PluginManifest;
    initialize: (config: Record<string, unknown>) => Promise<void>;
    startSession: () => Promise<{
        sessionId: string;
    }>;
    sendAudio: (sessionId: string, audio: Buffer) => Promise<void>;
    receiveAudio: (sessionId: string) => AsyncGenerator<Buffer>;
    stopSession: (sessionId: string) => Promise<void>;
}
export interface StorageAdapter {
    initialize(): Promise<void>;
    getSessionTranscript(agentId: string, sessionKey: string): Promise<SessionTurn[]>;
    appendTurn(agentId: string, sessionKey: string, turn: SessionTurn): Promise<void>;
    getSessionManifest(agentId: string, sessionKey: string): Promise<SessionManifest | null>;
    upsertSessionManifest(manifest: SessionManifest): Promise<void>;
    listSessions(agentId: string): Promise<SessionManifest[]>;
    deleteSession(agentId: string, sessionKey: string): Promise<void>;
    storeEmbedding(id: string, vector: number[], metadata: Record<string, unknown>): Promise<void>;
    searchEmbeddings(vector: number[], limit?: number): Promise<Array<{
        id: string;
        metadata: Record<string, unknown>;
        distance: number;
    }>>;
    rewriteSession(agentId: string, sessionKey: string, turns: SessionTurn[]): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=types.d.ts.map