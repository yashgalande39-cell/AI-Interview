const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// In-memory Cache
const requestCache = new Map();

// Helper to clean up cache entries if they exceed a limit
function cleanCache() {
  if (requestCache.size > 100) {
    const keys = Array.from(requestCache.keys());
    // remove oldest 20 entries
    for (let i = 0; i < 20; i++) {
      requestCache.delete(keys[i]);
    }
  }
}

/**
 * Parse JSON from AI response safely, stripping markdown fences
 */
function parseJsonResponse(text) {
  if (!text) {
    throw new Error('Empty text content');
  }
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

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

const MODELS = {
  primary: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free',
  fast: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free',
  code: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free',
  free: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free',
};

/**
 * Call OpenRouter with retry logic, timeout, caching, and fallback handling
 */
async function callOpenRouter(messages, optionsOrModel = {}, options = {}, retries = 3) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured in the environment variables');
  }

  let model = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free';
  let actualOptions = options;

  if (typeof optionsOrModel === 'string') {
    model = optionsOrModel;
  } else {
    actualOptions = optionsOrModel;
  }

  // Check cache first
  const cacheKey = JSON.stringify({ messages, model, options: actualOptions });
  if (requestCache.has(cacheKey)) {
    console.log(`[OpenRouter Cache] Hit for model ${model}`);
    return requestCache.get(cacheKey);
  }

  const body = {
    model,
    messages,
    temperature: actualOptions.temperature ?? 0.7,
    max_tokens: actualOptions.max_tokens ?? 1500,
  };

  const timeoutMs = actualOptions.timeout ?? 15000; // 15 seconds default timeout

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log(`[OpenRouter API] Calling ${model} (Attempt ${attempt}/${retries})`);
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://interview-ai.platform',
          'X-Title': 'AI Mock Interview Platform',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(id);

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) {
          throw new Error('Empty response content received from OpenRouter API');
        }

        const trimmedText = text.trim();
        // Cache successful response
        requestCache.set(cacheKey, trimmedText);
        cleanCache();
        return trimmedText;
      }

      const errText = await response.text();

      // Handle Rate Limit (429) specifically
      if (response.status === 429 && attempt < retries) {
        const retryAfterSec = parseInt(errText.match(/retry_after_seconds["\s:]+([\d.]+)/)?.[1] || '5', 10);
        const waitTime = (retryAfterSec || 5) * 1000;
        console.warn(`[OpenRouter API] Rate limit hit (429). Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      throw new Error(`OpenRouter API error ${response.status}: ${errText}`);

    } catch (error) {
      clearTimeout(id);
      console.error(`[OpenRouter API] Error during attempt ${attempt}:`, error.message);

      if (error.name === 'AbortError') {
        console.warn(`[OpenRouter API] Request timed out after ${timeoutMs}ms.`);
      }

      if (attempt === retries) {
        throw error; // Rethrow on final failure
      }

      // Wait a bit before retrying (exponential backoff)
      const backoffTime = attempt * 1500;
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }

  throw new Error('OpenRouter: Max retries exceeded without a successful response.');
}

module.exports = {
  callOpenRouter,
  parseJsonResponse,
  requestCache,
  MODELS,
};
