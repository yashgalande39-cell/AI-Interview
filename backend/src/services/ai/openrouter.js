const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const { LRUCache } = require('lru-cache');

// In-memory response cache
const responseCache = new LRUCache({
  max: 200,                  // max 200 entries
  ttl: 1000 * 60 * 30,      // 30-minute TTL
  maxSize: 10 * 1024 * 1024, // 10 MB total
  sizeCalculation: (v) => v.length,
});

/**
 * Parse JSON from AI response safely, stripping markdown fences
 */
function parseJsonResponse(text) {
  if (!text) throw new Error('Empty text content');
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrMatch) return JSON.parse(arrMatch[0]);
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]);
    throw new Error('Could not parse JSON from AI response');
  }
}

// Verified working free-tier models on OpenRouter (June 2025)
const MODELS = {
  primary: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
  fast:    'meta-llama/llama-3.3-70b-instruct:free',
  code:    'meta-llama/llama-3.3-70b-instruct:free',
  free:    'meta-llama/llama-3.3-70b-instruct:free',
};

// Failover chain — tried in order when a model is unavailable
const MODEL_FAILOVER = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'google/gemma-4-31b-it:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'openai/gpt-oss-20b:free',
];

/**
 * Call OpenRouter with automatic model failover, retry logic, and caching.
 */
async function callOpenRouter(messages, optionsOrModel = {}, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');

  let preferredModel = MODELS.primary;
  let actualOptions = options;

  if (typeof optionsOrModel === 'string') {
    preferredModel = optionsOrModel;
  } else {
    actualOptions = optionsOrModel;
  }

  const timeoutMs = actualOptions.timeout ?? 30000;

  // Dedup failover list: put preferred model first
  const modelsToTry = [preferredModel, ...MODEL_FAILOVER.filter(m => m !== preferredModel)];

  // Check cache
  const cacheKey = JSON.stringify({ messages, model: preferredModel, options: actualOptions });
  if (responseCache.has(cacheKey)) {
    console.log(`[OpenRouter Cache] Hit`);
    return responseCache.get(cacheKey);
  }

  let lastError = null;

  for (const model of modelsToTry) {
    const body = {
      model,
      messages,
      temperature: actualOptions.temperature ?? 0.7,
      max_tokens: actualOptions.max_tokens ?? 1500,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log(`[OpenRouter] Trying ${model}`);
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://tresk-ai.platform',
          'X-Title': 'TRESK AI Interview Platform',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new Error('Empty response content from OpenRouter');

        const trimmed = text.trim();
        responseCache.set(cacheKey, trimmed);
        console.log(`[OpenRouter] ✅ Success with ${model}`);
        return trimmed;
      }

      const errText = await response.text();

      // Rate limited — wait and retry same model
      if (response.status === 429) {
        const wait = 5000;
        console.warn(`[OpenRouter] Rate limited on ${model}, waiting ${wait}ms`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }

      // Model unavailable (404) — try next in failover list
      if (response.status === 404 || response.status === 400) {
        console.warn(`[OpenRouter] Model ${model} unavailable (${response.status}), trying next...`);
        lastError = new Error(`Model ${model} unavailable: ${errText}`);
        continue;
      }

      throw new Error(`OpenRouter error ${response.status}: ${errText}`);

    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.warn(`[OpenRouter] ${model} timed out after ${timeoutMs}ms, trying next...`);
        lastError = err;
        continue;
      }
      // Only continue to next model on network/availability errors
      if (err.message.includes('unavailable') || err.message.includes('404')) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All OpenRouter models exhausted without a successful response');
}

module.exports = { callOpenRouter, parseJsonResponse, requestCache: responseCache, MODELS };
