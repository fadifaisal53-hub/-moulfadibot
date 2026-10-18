export type ProviderId =
  | "openrouter"
  | "groq"
  | "cerebras"
  | "mistral"
  | "gemini";

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  baseURL: string;
  apiKeyEnv: string;
  defaultModel: string;
  limits: { rpm: number; rpd: number };
  priority: number;
}

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    baseURL: "https://openrouter.ai/api/v1",
    apiKeyEnv: "OPENROUTER_API_KEY",
    defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
    limits: { rpm: 20, rpd: 50 },
    priority: 1,
  },
  groq: {
    id: "groq",
    name: "Groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKeyEnv: "GROQ_API_KEY",
    defaultModel: "llama-3.3-70b-versatile",
    limits: { rpm: 30, rpd: 1000 },
    priority: 2,
  },
  cerebras: {
    id: "cerebras",
    name: "Cerebras",
    baseURL: "https://api.cerebras.ai/v1",
    apiKeyEnv: "CEREBRAS_API_KEY",
    defaultModel: "llama-3.3-70b",
    limits: { rpm: 30, rpd: 14400 },
    priority: 3,
  },
  mistral: {
    id: "mistral",
    name: "Mistral",
    baseURL: "https://api.mistral.ai/v1",
    apiKeyEnv: "MISTRAL_API_KEY",
    defaultModel: "mistral-small-latest",
    limits: { rpm: 60, rpd: 1000 },
    priority: 4,
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKeyEnv: "GEMINI_API_KEY",
    defaultModel: "gemini-2.0-flash",
    limits: { rpm: 15, rpd: 1500 },
    priority: 5,
  },
};

export const PROVIDER_ORDER: ProviderId[] = Object.values(PROVIDERS)
  .sort((a, b) => a.priority - b.priority)
  .map((p) => p.id);

export function getProviderApiKey(provider: ProviderConfig): string | null {
  const key = process.env[provider.apiKeyEnv];
  return key && key.trim().length > 0 ? key.trim() : null;
}

export function getAvailableProviders(): ProviderConfig[] {
  return PROVIDER_ORDER.map((id) => PROVIDERS[id]).filter(
    (p) => getProviderApiKey(p) !== null,
  );
}

export function hasAnyProvider(): boolean {
  return getAvailableProviders().length > 0;
}
