/**
 * TRESK AI — RAG (Retrieval-Augmented Generation) Service
 * Injects contextual memory into prompts based on mode and user session.
 *
 * In a production setup this would query a vector database (Pinecone / Weaviate).
 * Currently returns structured static context that shapes the LLM's responses
 * to be platform-specific and highly relevant.
 */

// Static knowledge base per mode
const KNOWLEDGE_BASE = {
  career: `
Platform Context:
- TRESK AI is a SaaS interview preparation platform for software engineering candidates.
- Users are preparing for roles at top companies: Google, Microsoft, Amazon, Flipkart, Razorpay, Zepto, Swiggy.
- The platform offers mock interviews, coding sandboxes, resume grading, and group discussions.
- The target audience is college students and early-career professionals (0–3 years experience).
`,
  resume: `
Resume Context:
- Common ATS killers: tables, graphics, columns, generic objectives, passive voice.
- Top keywords for SDE roles: REST APIs, microservices, React, Node.js, Docker, Kubernetes, CI/CD, SQL, NoSQL.
- STAR format is the gold standard for behavioral bullets: Situation → Task → Action → Result (with metrics).
- ATS scores above 80 significantly improve callback rates.
`,
  dsa: `
DSA Context:
- Top interview patterns: Sliding Window, Two Pointers, Fast & Slow Pointers, Merge Intervals, Cyclic Sort.
- Most asked topics: Arrays, Strings, Trees, Graphs, Dynamic Programming, Heaps, Tries.
- Companies with heavy DSA focus: Google, Meta, Amazon, Uber, DE Shaw, Goldman Sachs.
- Always analyze: Time Complexity, Space Complexity, Edge Cases.
`,
  placement: `
Placement Context:
- India tech placement scene 2024-25: FAANG hiring selectively, Tier-2 product companies growing fast.
- Average SDE-1 package ranges: Google ₹40-50L, Microsoft ₹25-40L, Swiggy/Zepto ₹18-28L, startups ₹12-20L.
- Most companies use 3-5 round formats: OA → Technical × 2-3 → HR/Managerial.
- Referrals increase interview chances by 5x.
`,
};

/**
 * Build a context string for the given mode.
 * @param {string} mode - 'career' | 'resume' | 'dsa' | 'placement'
 * @param {string} [userId] - Future: fetch user-specific session memory
 */
exports.buildContext = (mode = 'career', userId) => {
  const base = KNOWLEDGE_BASE[mode] || KNOWLEDGE_BASE.career;
  return `\n### Platform Knowledge Context:\n${base.trim()}\n`;
};

/**
 * Future: Store a conversation turn in session memory (stub).
 */
exports.storeMemory = (userId, mode, turn) => {
  // TODO: In production, upsert into a vector store (Pinecone/Weaviate)
  // For now, this is a no-op stub
};

/**
 * Future: Retrieve top-k relevant memories for a query (stub).
 */
exports.retrieveMemory = async (userId, query, k = 3) => {
  // TODO: Embed query, query vector store, return top-k chunks
  return [];
};
