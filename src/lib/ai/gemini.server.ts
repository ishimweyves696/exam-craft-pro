/**
 * GOOGLE GEMINI (free API key) — server only.
 *
 * Used when GEMINI_API_KEY is configured; otherwise the app falls back to the
 * Lovable AI Gateway. Same contract as the gateway: prompt + strict JSON
 * schema in, parsed JSON out.
 */
import { GatewayError } from './gateway.server';

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
/**
 * Cheapest free-tier models. flash-lite has the most generous free quota, so
 * everything objective runs there; reasoning-heavy items use plain flash
 * (pro has a tiny free-tier limit and is not used).
 */
const MODEL_STANDARD = 'gemini-3.5-flash-lite';
const MODEL_DEEP = 'gemini-3.5-flash';

export function hasGeminiKey(): boolean {
  return Boolean(process.env['GEMINI_API_KEY']);
}

/** JSON Schema -> Gemini schema (no additionalProperties, nullable flag, no type arrays). */
function toGeminiSchema(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(toGeminiSchema);
  if (!node || typeof node !== 'object') return node;

  const src = node as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(src)) {
    if (key === 'additionalProperties' || key === 'strict') continue;
    if (key === 'type') {
      if (Array.isArray(value)) {
        const types = value.filter((t) => t !== 'null');
        out['type'] = types[0] ?? 'string';
        if (value.length !== types.length) out['nullable'] = true;
      } else {
        out['type'] = value;
      }
      continue;
    }
    if (key === 'properties' && value && typeof value === 'object') {
      const props: Record<string, unknown> = {};
      for (const [name, sub] of Object.entries(value as Record<string, unknown>)) {
        props[name] = toGeminiSchema(sub);
      }
      out['properties'] = props;
      continue;
    }
    out[key] = toGeminiSchema(value);
  }
  return out;
}

/** Gemini puts the wait in RetryInfo ("retryDelay":"40s") or in the message text. */
function retryDelayFrom(detail: string): number | undefined {
  const m = detail.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/) ?? detail.match(/retry in (\d+(?:\.\d+)?)s/i);
  const seconds = m ? Number(m[1]) : NaN;
  return Number.isFinite(seconds) ? Math.min(Math.ceil(seconds), 60) : undefined;
}

function geminiMessage(status: number, detail: string): string {
  let message = '';
  try {
    const body = JSON.parse(detail);
    message = (body?.error?.message as string) || '';
  } catch {
    /* non-JSON body */
  }
  if (status === 429)
    return message || 'The Gemini free-tier rate limit was hit. Try again in a moment.';
  if (status === 401 || status === 403)
    return message || 'The Gemini API key was rejected. Check that GEMINI_API_KEY is valid.';
  return message || `Gemini API error (${status}).`;
}

export async function callGeminiJson<T>(req: {
  instructions: string;
  input: string;
  schema: Record<string, unknown>;
  effort?: 'low' | 'medium';
}): Promise<T> {
  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) throw new GatewayError(401, 'GEMINI_API_KEY is not configured on the server.');

  const model = req.effort === 'medium' ? MODEL_DEEP : MODEL_STANDARD;
  const res = await fetch(`${BASE}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: req.instructions }] },
      contents: [{ role: 'user', parts: [{ text: req.input }] }],
      generationConfig: {
        temperature: 0.8,
        responseMimeType: 'application/json',
        responseSchema: toGeminiSchema(req.schema),
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    const retryAfter =
      Number(res.headers.get('retry-after')) || retryDelayFrom(detail) || undefined;
    throw new GatewayError(res.status, geminiMessage(res.status, detail), retryAfter);
  }

  const body = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = (body.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? '')
    .join('')
    .trim();

  if (!text) throw new GatewayError(502, 'Gemini returned an empty response.');
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new GatewayError(502, 'Gemini returned output that was not valid JSON.');
  }
}
