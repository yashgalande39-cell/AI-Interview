/**
 * TRESK AI Career Copilot — Controller
 * Powers context-aware conversations across four modes:
 *   1. Career / General Prep
 *   2. Resume Analysis
 *   3. DSA Hints
 *   4. Company-specific Placement Insights
 *
 * Uses OpenRouter (Qwen3 235B) as primary with built-in retry/fallback.
 */

const ragService = require('./rag.service');
const { callOpenRouter } = require('../../services/ai/openrouter');

// ---------------------------------------------------------------------------
// Shared OpenRouter helper — converts Gemini-style contents to OpenRouter messages
// ---------------------------------------------------------------------------
async function callAI(systemPrompt, userMessage, chatHistory = []) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.map(turn => ({
      role: turn.role === 'user' ? 'user' : 'assistant',
      content: turn.text,
    })),
    { role: 'user', content: userMessage },
  ];

  return await callOpenRouter(messages, { temperature: 0.75, max_tokens: 1500 });
}

// ---------------------------------------------------------------------------
// POST /api/tresk/chat
// ---------------------------------------------------------------------------
exports.chat = async (req, res) => {
  try {
    const { message, chatHistory = [], mode = 'career' } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    // Build memory context from RAG service
    const memoryContext = ragService.buildContext(mode, req.user?.userId);

    const systemPrompt = `You are **TRESK**, an elite AI Career Copilot built exclusively for the TRESK AI Interview Platform — India's most advanced mock interview system.
${memoryContext}
You are currently in **${mode.toUpperCase()}** mode. Core rules:
- Be sharp, precise, and actionable. No filler text or disclaimers.
- Format answers in clean Markdown with headers, bullets, and code blocks where relevant.
- For **career** mode: give opinionated, data-driven career advice tailored to Indian tech companies.
- For **dsa** mode: explain the optimal approach first, then time/space complexity, then clean annotated code.
- For **resume** mode: identify specific ATS issues and provide rewritten bullet points with metrics.
- For **placement** mode: provide company-specific interview patterns, salary benchmarks, and 30-day prep plans.
Always end with ONE follow-up question or suggestion to keep the session going.`;

    const reply = await callAI(systemPrompt, message, chatHistory);
    return res.status(200).json({ reply, mode });

  } catch (err) {
    console.error('TRESK Chat Error:', err.message);

    // Smart offline fallback
    const { mode = 'career', message = '' } = req.body;
    const fallbacks = {
      career:    `**TRESK is ready!** 🎯\n\nI specialize in helping you crack placements at Google, Microsoft, Swiggy, and top product companies. What role are you targeting right now?`,
      resume:    `**Resume Analysis Mode** 📄\n\nPaste your resume bullet points and the job description you're applying for — I'll rewrite them for maximum ATS compatibility and recruiter impact.`,
      dsa:       `**DSA Coach Mode** 💻\n\nShare the problem statement (or a LeetCode link), and I'll break down:\n- Optimal algorithm\n- Time & Space complexity\n- Clean, commented code\n- Edge cases to handle`,
      placement: `**Placement Intelligence Mode** 🏢\n\nWhich company are you targeting? Type a company name (e.g., *Google*, *Flipkart*, *Zepto*) and I'll generate:\n- Interview process breakdown\n- Top 10 most-asked questions\n- Salary benchmarks\n- 30-day prep plan`,
    };
    return res.status(200).json({ reply: fallbacks[mode] || fallbacks.career, mode, offline: true });
  }
};

// ---------------------------------------------------------------------------
// POST /api/tresk/analyze-resume
// ---------------------------------------------------------------------------
exports.analyzeResume = async (req, res) => {
  try {
    const { resumeText, targetRole, targetCompany } = req.body;
    if (!resumeText) return res.status(400).json({ message: 'Resume text is required' });

    const systemPrompt = `You are TRESK, a world-class ATS resume analyst and technical recruiter with 10 years of experience at top tech companies. You provide brutally honest, specific, and highly actionable feedback.`;

    const userPrompt = `Analyze the following resume for the role of **"${targetRole || 'Software Engineer'}"**${targetCompany ? ` at **${targetCompany}**` : ' at a top tech company'}.

Resume:
"""
${resumeText.slice(0, 3500)}
"""

Provide a structured analysis in Markdown:

## 📊 ATS Compatibility Score: X/100
*Brief reasoning for this score*

## ❌ Critical Issues (Will Get Rejected)
- Issue 1
- Issue 2

## ✍️ Rewritten Bullets (Before → After)
Take the 3 weakest achievement bullets and rewrite them with STAR format + quantified metrics.

## 🔑 Missing Keywords for ${targetRole || 'Software Engineer'}
List 6-8 high-value ATS keywords missing from this resume.

## ✅ Final Verdict
One sentence verdict on hiring likelihood.`;

    const analysis = await callAI(systemPrompt, userPrompt);
    return res.status(200).json({ analysis });

  } catch (err) {
    console.error('Resume Analysis Error:', err.message);
    return res.status(500).json({ message: 'Resume analysis temporarily unavailable. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/tresk/dsa-hint
// ---------------------------------------------------------------------------
exports.dsaHint = async (req, res) => {
  try {
    const { problem, userCode, hintLevel = 1 } = req.body;
    if (!problem) return res.status(400).json({ message: 'Problem statement is required' });

    const hintInstruction = hintLevel === 1
      ? 'Give ONLY a high-level algorithmic approach and which data structure to use. No code, no pseudocode.'
      : hintLevel === 2
      ? 'Give the data structure choice, pseudocode outline, and time complexity. No full solution code.'
      : 'Give a complete, clean, and well-commented solution with time and space complexity analysis.';

    const systemPrompt = `You are TRESK's elite DSA Mentor. You teach algorithms in a progressive, Socratic style that builds deep understanding. Be encouraging but precise. Always use Markdown with code blocks.`;

    const userPrompt = `${hintInstruction}

**Problem:** ${problem}
${userCode ? `\n**User's current attempt:**\n\`\`\`\n${userCode.slice(0, 1200)}\n\`\`\`` : ''}

${hintLevel < 3 ? 'Remember: do NOT give the full solution. Guide, don\'t spoil.' : 'Provide the full optimal solution with detailed explanation.'}`;

    const hint = await callAI(systemPrompt, userPrompt);
    return res.status(200).json({ hint, hintLevel });

  } catch (err) {
    console.error('DSA Hint Error:', err.message);
    return res.status(500).json({ message: 'DSA hint service temporarily unavailable.' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/tresk/placement-insights
// ---------------------------------------------------------------------------
exports.placementInsights = async (req, res) => {
  try {
    const { company, role = 'SDE-1', userProfile } = req.body;
    if (!company) return res.status(400).json({ message: 'Company name is required' });

    const systemPrompt = `You are TRESK's Placement Intelligence Engine — an expert on Indian tech hiring, interview processes, compensation benchmarks, and company-specific prep strategies. You have detailed knowledge of 500+ companies' interview pipelines.`;

    const userPrompt = `Generate a comprehensive placement guide for **${company}** — **${role}** role.
${userProfile ? `\nCandidate profile: ${JSON.stringify(userProfile)}` : ''}

Format your response in Markdown:

## 🏢 ${company} — ${role} Complete Placement Guide

### 📋 Interview Process
(Number of rounds, format of each round, typical timeline)

### 🔥 Top 10 Most Asked Questions
(With the expected answer framework for each)

### 💻 DSA Topics to Master
(Specific algorithms and patterns they love)

### 🏗️ System Design Expectations
(For SDE-2 and above; skip for freshers)

### 💰 Salary & Compensation (India 2024-25)
(CTC range, equity, perks)

### 🎯 Insider Tips
(Culture fit, red flags, what they really look for)

### 📅 30-Day Prep Plan
(Week-by-week breakdown)

Be specific, data-driven, and India-focused.`;

    const insights = await callAI(systemPrompt, userPrompt);
    return res.status(200).json({ insights, company, role });

  } catch (err) {
    console.error('Placement Insights Error:', err.message);
    return res.status(500).json({ message: 'Placement insights temporarily unavailable.' });
  }
};
