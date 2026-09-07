/**
 * LOVABLE AI GATEWAY — server only.
 *
 * One job: turn a prompt + a strict JSON schema into parsed JSON.
 * It knows nothing about exams, marks or layout.
 *
 * Streaming is mandatory on /v1/responses: these are reasoning models and a
 * buffered request would sit silent long enough to hit a platform timeout.
 */

const ENDPOINT = 'https://ai.gateway.lovable.dev/v1/responses';
/** Objective batches run on the cheaper/faster model; reasoning-heavy on the flagship. */
const MODEL_STANDARD = 'openai/gpt-5.6-terra';
const MODEL_DEEP = 'openai/gpt-5.6-sol';

export class GatewayError extends Error {
  constructor(
    public status: number,
    message: string,
    /** Seconds the gateway asked us to wait, when it said so. */
    public retryAfter?: number,
  ) {
    super(message);
    this.name = 'GatewayError';
  }

  /** 402/403 mean no further call in this run can succeed. */
  get terminal(): boolean {
    return this.status === 402 || this.status === 403 || this.status === 401;
  }
}

export interface GatewayRequest {
  instructions: string;
  input: string;
  schemaName: string;
  schema: Record<string, unknown>;
  /** 'low' keeps a per-type batch quick; the paper is many batches. */
  effort?: 'low' | 'medium';
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Calls the gateway and returns the parsed structured output.
 * 429/5xx are retried with bounded backoff; 400/401/402/403 are terminal.
 */
export async function callGatewayJson<T>(req: GatewayRequest): Promise<T> {
  const ATTEMPTS = 4;
  let lastError: GatewayError | undefined;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    try {
      return await once<T>(req);
    } catch (err) {
      if (!(err instanceof GatewayError)) throw err;
      lastError = err;
      const retryable = err.status === 429 || err.status >= 500;
      if (!retryable || attempt === ATTEMPTS - 1) throw err;
      // Free-tier 429s carry a precise retryDelay; honour it rather than guessing.
      await sleep((err.retryAfter ?? 2 ** (attempt + 1)) * 1000 + Math.random() * 500);
    }
  }
  throw lastError ?? new GatewayError(502, 'AI generation failed.');
}

async function once<T>(req: GatewayRequest): Promise<T> {
  // A user-supplied Gemini key takes precedence over the Lovable AI Gateway.
  if (process.env['GEMINI_API_KEY']) {
    const { callGeminiJson } = await import('./gemini.server');
    return callGeminiJson<T>(req);
  }

  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new GatewayError(401, 'LOVABLE_API_KEY is not configured on the server.');

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Lovable-API-Key': apiKey,
      'X-Lovable-AIG-SDK': 'fetch',
    },
    body: JSON.stringify({
      model: req.effort === 'medium' ? MODEL_DEEP : MODEL_STANDARD,
      instructions: req.instructions,
      input: req.input,
      stream: true,
      store: false,
      reasoning: { effort: req.effort ?? 'low', summary: 'auto' },
      text: {
        format: {
          type: 'json_schema',
          name: req.schemaName,
          strict: true,
          schema: req.schema,
        },
      },
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '');
    const retryAfter = Number(res.headers.get('retry-after')) || undefined;
    throw new GatewayError(res.status, gatewayMessage(res.status, detail), retryAfter);
  }

  const text = await readOutputText(res.body);
  if (!text.trim()) throw new GatewayError(502, 'The model returned an empty response.');

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new GatewayError(502, 'The model returned output that was not valid JSON.');
  }
}

function gatewayMessage(status: number, detail: string): string {
  let message = '';
  try {
    const body = JSON.parse(detail);
    message = (body?.error?.message as string) || (body?.message as string) || '';
  } catch {
    /* non-JSON body */
  }
  if (status === 402)
    return `AI credits for this workspace are exhausted${
      message && message !== 'Not enough credits' ? ` (${message})` : ''
    }. Top up the workspace AI credits to generate new questions.`;
  if (status === 403) return message || 'Lovable AI is blocked by workspace policy.';
  if (status === 429) return message || 'The AI gateway is rate limited. Try again in a moment.';
  return message || `AI gateway error (${status}).`;
}

/** Reads the SSE stream and concatenates the output_text deltas. */
async function readOutputText(body: ReadableStream<Uint8Array>): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let out = '';
  let completed = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const evt = JSON.parse(payload) as {
          type?: string;
          delta?: string;
          response?: { output_text?: string; output?: unknown[] };
        };
        if (evt.type === 'response.output_text.delta' && typeof evt.delta === 'string') {
          out += evt.delta;
        } else if (evt.type === 'response.completed' && evt.response) {
          completed = evt.response.output_text ?? extractText(evt.response.output) ?? '';
        }
      } catch {
        /* partial or non-JSON event */
      }
    }
  }

  return out || completed;
}

function extractText(output: unknown): string {
  if (!Array.isArray(output)) return '';
  let text = '';
  for (const item of output as any[]) {
    for (const part of item?.content ?? []) {
      if (typeof part?.text === 'string') text += part.text;
    }
  }
  return text;
}
