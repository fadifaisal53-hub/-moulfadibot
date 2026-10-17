import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText, generateText, generateObject } from "ai";
import { z } from "zod";
import {
  PROVIDERS,
  PROVIDER_ORDER,
  getProviderApiKey,
  hasAnyProvider,
  getAvailableProviders,
} from "./providers.js";

export interface GenerateOptions {
  system?: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  preferredProvider?: string;
}

const rateLimitWindow = new Map<string, number[]>();
const WINDOW_MS = 60_000;

function isRateLimited(id: string, rpm: number): boolean {
  const now = Date.now();
  const ts = (rateLimitWindow.get(id) ?? []).filter((t) => now - t < WINDOW_MS);
  rateLimitWindow.set(id, ts);
  return ts.length >= rpm;
}

function recordRequest(id: string) {
  const ts = rateLimitWindow.get(id) ?? [];
  ts.push(Date.now());
  rateLimitWindow.set(id, ts);
}

function createModel(provider: any) {
  const apiKey = getProviderApiKey(provider);
  if (!apiKey) throw new Error(`Missing ${provider.apiKeyEnv}`);

  const client = createOpenAICompatible({
    name: provider.id,
    baseURL: provider.baseURL,
    apiKey,
    headers:
      provider.id === "openrouter"
        ? { "HTTP-Referer": "https://moulinex.dev", "X-Title": "Moulinex" }
        : undefined,
  });
  return client.chatModel(provider.defaultModel);
}

function getCandidates(preferred?: string) {
  const available = PROVIDER_ORDER.map((id) => PROVIDERS[id]).filter(
    (p) => getProviderApiKey(p) && !isRateLimited(p.id, p.limits.rpm),
  );
  if (preferred) {
    const pref = available.find((p) => p.id === preferred);
    if (pref) return [pref, ...available.filter((p) => p.id !== preferred)];
  }
  return available;
}

export async function streamWithFallback(opts: GenerateOptions) {
  const candidates = getCandidates(opts.preferredProvider);
  if (candidates.length === 0) {
    throw new Error("لا يوجد مزود LLM متاح. أضف مفتاحاً في .env");
  }

  let lastError: Error | null = null;
  for (const provider of candidates) {
    try {
      const result = streamText({
        model: createModel(provider),
        system: opts.system,
        prompt: opts.prompt,
        maxTokens: opts.maxTokens ?? 800,
        temperature: opts.temperature ?? 0.7,
      });
      recordRequest(provider.id);
      return result;
    } catch (e) {
      lastError = e as Error;
    }
  }
  throw new Error(`فشل جميع المزودين: ${lastError?.message}`);
}

export async function generateWithFallback(
  opts: GenerateOptions,
): Promise<string> {
  const candidates = getCandidates(opts.preferredProvider);
  if (candidates.length === 0) throw new Error("لا يوجد مزود LLM متاح");

  let lastError: Error | null = null;
  for (const provider of candidates) {
    try {
      const result = await generateText({
        model: createModel(provider),
        system: opts.system,
        prompt: opts.prompt,
        maxTokens: opts.maxTokens ?? 800,
        temperature: opts.temperature ?? 0.7,
      });
      recordRequest(provider.id);
      return result.text;
    } catch (e) {
      lastError = e as Error;
    }
  }
  throw new Error(`فشل: ${lastError?.message}`);
}

export async function generateObjectWithFallback<T extends z.ZodTypeAny>(
  opts: GenerateOptions & { schema: T },
): Promise<z.infer<T>> {
  const candidates = getCandidates(opts.preferredProvider);
  if (candidates.length === 0) throw new Error("لا يوجد مزود");

  let lastError: Error | null = null;
  for (const provider of candidates) {
    try {
      const result = await generateObject({
        model: createModel(provider),
        system: opts.system,
        prompt: opts.prompt,
        schema: opts.schema,
        maxTokens: opts.maxTokens ?? 2000,
      });
      recordRequest(provider.id);
      return result.object as z.infer<T>;
    } catch (e) {
      lastError = e as Error;
    }
  }
  throw new Error(`فشل: ${lastError?.message}`);
}

export { hasAnyProvider, getAvailableProviders, PROVIDERS };
