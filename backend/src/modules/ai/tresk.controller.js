/**
 * TRESK AI Career Copilot — Controller
 * Powers context-aware conversations across four modes:
 *   1. Career / General Prep
 *   2. Resume Analysis
 *   3. DSA Hints
 *   4. Company-specific Placement Insights
 */

const ragService = require('./rag.service');

// ---------------------------------------------------------------------------
// Shared Gemini helper
// ---------------------------------------------------------------------------
async function callGemini(contents, apiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    }
  );
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

// ---------------------------------------------------------------------------
// POST /api/tresk/chat
// ---------------------------------------------------------------------------
exports.chat = async (req, res) => {
  try {
    const { message, chatHistory = [], mode = 'career' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!message) return res.status(400).json({ message: 'Message is required' });

    // Build memory context from RAG service
    const memoryContext = ragService.buildContext(mode, req.user?.userId);

    // System persona prompt for TRESK
    const systemPrompt = `You are **TRESK**, an elite AI Career Copilot built exclusively for the TRESK AI Interview Platform.
${memoryContext}
You operate in **${mode}** mode. Rules:
- Be sharp, precise, and actionable. No filler text.
- Format answers in clean Markdown with headers, bullets, and code blocks where relevant.
- For career questions: give opinionated, data-driven advice.
- For DSA: explain the optimal approach, time/space complexity, and show clean code.
- For resume: identify specific ATS issues and provide corrected bullet points.
- For placement: provide company-specific patterns, expected questions, and salary benchmarks.
End every response with a brief follow-up suggestion to keep the conversation going.`;

    const contents = [];

    // Inject system prompt as first user turn
    contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
    contents.push({ role: 'model', parts: [{ text: 'Understood. I am TRESK, your dedicated Career Copilot. How can I help you today?' }] });

    // Add chat history
    chatHistory.forEach(turn => {
      contents.push({
        role: turn.role === 'user' ? 'user' : 'model',
        parts: [{ text: turn.text }],
      });
    });

    contents.push({ role: 'user', parts: [{ text: message }] });

    if (apiKey) {
      try {
        const reply = await callGemini(contents, apiKey);
        return res.status(200).json({ reply, mode });
      } catch (e) {
        console.warn('TRESK Gemini call failed, using offline response:', e.message);
      }
    }

    // Offline fallback responses keyed by mode
    const fallbacks = {
      career:    `**TRESK here!** I can help with career roadmaps, interview strategy, and placement prep. What specific role are you targeting? 🎯`,
      resume:    `**Resume Mode activated.** Paste your resume bullet points and target job description — I'll rewrite them for maximum ATS impact. 📄`,
      dsa:       `**DSA Mode activated.** Share your problem statement and I'll break down the optimal algorithm, complexity analysis, and clean code solution. 💻`,
      placement: `**Placement Insights Mode.** Which company are you targeting? I'll provide question patterns, salary benchmarks, and insider prep tips. 🏢`,
    };

    return res.status(200).json({ reply: fallbacks[mode] || fallbacks.career, mode });
  } catch (err) {
    console.error('TRESK Chat Error:', err);
    return res.status(500).json({ message: 'TRESK is temporarily unavailable. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/tresk/analyze-resume
// ---------------------------------------------------------------------------
exports.analyzeResume = async (req, res) => {
  try {
    const { resumeText, targetRole, targetCompany } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!resumeText) return res.status(400).json({ message: 'Resume text is required' });

    const prompt = `You are TRESK, an expert ATS and technical resume analyst.
Analyze the following resume for the role of "${targetRole || 'Software Engineer'}"${targetCompany ? ` at ${targetCompany}` : ''}.

Resume:
"""
${resumeText.slice(0, 3000)}
"""

Provide a structured analysis:
1. **ATS Score** (0-100) with reasoning
2. **Critical Issues** (bullet list of what will get it rejected)
3. **Rewritten Bullets** (take the 3 weakest bullets and rewrite them with STAR format + metrics)
4. **Missing Keywords** for ${targetRole || 'Software Engineer'} at top tech companies
5. **Final Verdict** in one sentence

Use markdown formatting.`;

    if (apiKey) {
      try {
        const reply = await callGemini(
          [{ role: 'user', parts: [{ text: prompt }] }],
          apiKey
        );
        return res.status(200).json({ analysis: reply });
      } catch (e) {
        console.warn('Resume analysis Gemini call failed:', e.message);
      }
    }

    return res.status(200).json({
      analysis: `## TRESK Resume Analysis\n\n**ATS Score: 72/100**\n\nConnect your Gemini API key to get real-time ATS analysis powered by TRESK AI.`
    });
  } catch (err) {
    console.error('Resume Analysis Error:', err);
    return res.status(500).json({ message: 'Resume analysis failed' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/tresk/dsa-hint
// ---------------------------------------------------------------------------
exports.dsaHint = async (req, res) => {
  try {
    const { problem, userCode, hintLevel = 1 } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!problem) return res.status(400).json({ message: 'Problem statement is required' });

    const hint = hintLevel === 1
      ? 'Give a high-level algorithmic approach only. No code.'
      : hintLevel === 2
      ? 'Give the data structure choice and pseudocode. No full solution.'
      : 'Give a clean, commented solution with time and space complexity.';

    const prompt = `You are TRESK's DSA Mentor. ${hint}

Problem: ${problem}
${userCode ? `\nUser's current code:\n\`\`\`\n${userCode.slice(0, 1000)}\n\`\`\`` : ''}

Be encouraging. Use markdown.`;

    if (apiKey) {
      try {
        const reply = await callGemini([{ role: 'user', parts: [{ text: prompt }] }], apiKey);
        return res.status(200).json({ hint: reply, hintLevel });
      } catch (e) {
        console.warn('DSA hint Gemini call failed:', e.message);
      }
    }

    return res.status(200).json({
      hint: `**TRESK DSA Hint (Level ${hintLevel})**\n\nAdd your Gemini API key to unlock AI-powered DSA hints!`,
      hintLevel,
    });
  } catch (err) {
    console.error('DSA Hint Error:', err);
    return res.status(500).json({ message: 'DSA hint service unavailable' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/tresk/placement-insights
// ---------------------------------------------------------------------------
exports.placementInsights = async (req, res) => {
  try {
    const { company, role = 'SDE-1', userProfile } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!company) return res.status(400).json({ message: 'Company name is required' });

    const prompt = `You are TRESK's Placement Intelligence engine.
Generate a comprehensive placement guide for **${company}** — **${role}** role.

${userProfile ? `Candidate profile: ${JSON.stringify(userProfile)}` : ''}

Structure your response as:
## 🏢 ${company} — ${role} Placement Guide

### Interview Process (rounds + format)
### Top 10 Most Asked Questions (with expected answer framework)
### DSA Topics to Focus On
### System Design Expectations
### Salary & Compensation (India)
### Insider Tips
### 30-Day Prep Plan

Use emojis sparingly. Be specific and data-driven.`;

    if (apiKey) {
      try {
        const reply = await callGemini([{ role: 'user', parts: [{ text: prompt }] }], apiKey);
        return res.status(200).json({ insights: reply, company, role });
      } catch (e) {
        console.warn('Placement insights Gemini call failed:', e.message);
      }
    }

    return res.status(200).json({
      insights: `## 🏢 ${company} — ${role} Placement Guide\n\nConnect your Gemini API key to unlock TRESK's AI-powered placement intelligence for ${company}.`,
      company,
      role,
    });
  } catch (err) {
    console.error('Placement Insights Error:', err);
    return res.status(500).json({ message: 'Placement insights unavailable' });
  }
};
