/**
 * TRESK AI — RAG (Retrieval-Augmented Generation) Service
 * =====================================================================
 * Handles storing and retrieving contextual preparation memories.
 * Seamlessly checks for pgvector support, falling back to pg_trgm trigram
 * text similarity matching if the vector extension is not active.
 */

const { query } = require('../../config/pgDb');

// Static knowledge base per mode (fallback / baseline injection)
const KNOWLEDGE_BASE = {
  career: `
Platform Context:
- TRESK AI is a SaaS career copilot and mock interview simulation platform.
- Target audience: college students and early-career software engineering candidates.
- Supported interview tracks: HR, Technical, Behavioral, and System Design.
- Features: Real-time gaze/stress web analytics, AI code grading, resume scorecards, and roundtable group debates.
`,
  resume: `
Resume Optimization Context:
- ATS parser systems prioritize clean structures: single columns, standard fonts, no graphs or icons.
- Quantifiable impact is critical: use metrics (e.g. "increased latency speeds by 40%", "reduced error rates by 12%").
- Highlight core SDE tech skills: React, Node.js, Express, PostgreSQL, Docker, Git, CI/CD pipelines.
`,
  dsa: `
DSA Optimization Context:
- Popular algorithmic patterns: Two Pointers, Sliding Window, Graph DFS/BFS, Dynamic Programming.
- Target optimal complexity: O(N) or O(N log N) time, O(1) auxiliary space when possible.
- Cover all edge cases: empty input, single element, negative values, integer overflows.
`,
  placement: `
Placement / Hiring Context:
- SDE hiring formats: Resume screening -> Online Coding Assessment -> Technical Interviews -> HR / Cultural Fit.
- FAANG tier interviews require strong whiteboard system design and algorithmic debugging skills.
`,
};

/**
 * Check if the user_memories table has the vector embedding column.
 */
const hasVectorColumn = async () => {
  try {
    const res = await query(`
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'user_memories' AND column_name = 'embedding'
    `);
    return res.rows.length > 0;
  } catch (e) {
    return false;
  }
};

/**
 * Retrieve text embeddings from Gemini or OpenRouter (optional, future-proof).
 */
const getEmbedding = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text }] }
        })
      });
      if (response.ok) {
        const data = await response.json();
        return data.embedding?.values || null;
      }
    } catch (err) {
      console.warn('[RAG] Gemini embedding generation failed:', err.message);
    }
  }
  return null;
};

/**
 * Store a contextual preparation memory in the database.
 * @param {string} userId - ID of the user
 * @param {string} sourceType - 'interview' | 'resume' | 'coding' | 'chat'
 * @param {string} sourceId - ID of the related session/file
 * @param {string} chunkText - Raw context text
 * @param {object} [metadata] - Optional additional keys
 */
exports.storeMemory = async (userId, sourceType, sourceId, chunkText, metadata = {}) => {
  try {
    if (!userId || userId === 'anonymous') return;
    if (!chunkText || !chunkText.trim()) return;

    const vectorActive = await hasVectorColumn();
    let embeddingVal = null;

    if (vectorActive) {
      embeddingVal = await getEmbedding(chunkText);
    }

    if (vectorActive && embeddingVal) {
      // Store using pgvector
      const vectorStr = `[${embeddingVal.join(',')}]`;
      await query(`
        INSERT INTO user_memories (user_id, source_type, source_id, chunk_text, embedding, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [userId, sourceType, sourceId || '', chunkText, vectorStr, JSON.stringify(metadata)]);
    } else {
      // Store standard text row (for trigram similarity search)
      await query(`
        INSERT INTO user_memories (user_id, source_type, source_id, chunk_text, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [userId, sourceType, sourceId || '', chunkText, JSON.stringify(metadata)]);
    }
    console.log(`[RAG] Saved preparation memory chunk of type ${sourceType} for user ${userId}.`);
  } catch (err) {
    console.warn('[RAG] Error storing memory:', err.message);
  }
};

/**
 * Retrieve top relevant memories for a user query.
 * @param {string} userId
 * @param {string} queryText
 * @param {number} k - max results
 */
exports.retrieveMemory = async (userId, queryText, k = 3) => {
  try {
    if (!userId || userId === 'anonymous' || !queryText) return [];

    const vectorActive = await hasVectorColumn();
    let embeddingVal = null;

    if (vectorActive) {
      embeddingVal = await getEmbedding(queryText);
    }

    if (vectorActive && embeddingVal) {
      // Query using cosine similarity distance
      const vectorStr = `[${embeddingVal.join(',')}]`;
      const res = await query(`
        SELECT chunk_text, source_type, created_at, (embedding <=> $2) as distance
        FROM user_memories
        WHERE user_id = $1
        ORDER BY distance ASC
        LIMIT $3
      `, [userId, vectorStr, k]);
      return res.rows.map(r => r.chunk_text);
    } else {
      // Query using pg_trgm trigram similarity metric (extremely fast, zero dependencies!)
      const res = await query(`
        SELECT chunk_text, source_type, similarity(chunk_text, $2) as sim
        FROM user_memories
        WHERE user_id = $1 AND similarity(chunk_text, $2) > 0.05
        ORDER BY sim DESC
        LIMIT $3
      `, [userId, queryText, k]);
      return res.rows.map(r => r.chunk_text);
    }
  } catch (err) {
    console.warn('[RAG] Error retrieving memory:', err.message);
    return [];
  }
};

/**
 * Build a combined context prompt injection string for a conversation.
 * @param {string} mode - 'career' | 'resume' | 'dsa' | 'placement'
 * @param {string} [userId] - Optional candidate identifier
 * @param {string} [userQuery] - Query string to fetch relevant history
 */
exports.buildContext = async (mode = 'career', userId, userQuery) => {
  const base = KNOWLEDGE_BASE[mode] || KNOWLEDGE_BASE.career;
  let contextStr = `\n### Platform Knowledge Context:\n${base.trim()}\n`;

  if (userId && userQuery) {
    const historicalMemories = await exports.retrieveMemory(userId, userQuery, 3);
    if (historicalMemories.length > 0) {
      contextStr += `\n### Relevant Candidate History & Feedback:\n`;
      historicalMemories.forEach((mem, idx) => {
        contextStr += `- Memory [${idx + 1}]: "${mem.trim()}"\n`;
      });
      contextStr += `\n`;
    }
  }

  return contextStr;
};
