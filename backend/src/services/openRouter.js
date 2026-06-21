/**
 * Legacy OpenRouter AI Service Wrapper
 * Redirects all calls to the modular services in backend/src/services/ai/
 */

const openrouter = require('./ai/openrouter');
const interviewAgent = require('./ai/interviewAgent');
const resumeAnalyzer = require('./ai/resumeAnalyzer');
const scoringEngine = require('./ai/scoringEngine');
const feedbackEngine = require('./ai/feedbackEngine');
const recommendationEngine = require('./ai/recommendationEngine');

module.exports = {
  // Foundation API and Models
  callOpenRouter: openrouter.callOpenRouter,
  parseJsonResponse: openrouter.parseJsonResponse,
  MODELS: openrouter.MODELS,

  // Interview Agent
  generateInterviewQuestions: interviewAgent.generateInterviewQuestions,
  generateFollowUp: interviewAgent.generateFollowUp,

  // Resume Analyzer
  parseResumeText: resumeAnalyzer.parseResumeText,
  generateATSSuggestions: resumeAnalyzer.generateATSSuggestions,
  analyzeResume: resumeAnalyzer.analyzeResume,
  analyzeJobDescription: resumeAnalyzer.analyzeJobDescription,

  // Scoring Engine
  evaluateAnswer: scoringEngine.evaluateAnswer,
  reviewCode: scoringEngine.reviewCode,

  // Feedback Engine
  generatePerformanceFeedback: feedbackEngine.generatePerformanceFeedback,

  // Recommendation Engine
  generateRecommendations: recommendationEngine.generateRecommendations,
};
