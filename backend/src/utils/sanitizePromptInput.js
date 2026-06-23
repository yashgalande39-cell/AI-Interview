/**
 * TRESK AI — Prompt Sanitization Utility
 * Strips structural characters used in prompt injections and caps lengths.
 */
function sanitizePromptInput(value, maxLength = 200) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[<>{}[\]\\]/g, '')   // remove structural characters
    .replace(/\n{3,}/g, '\n\n')    // collapse excessive newlines
    .trim()
    .slice(0, maxLength);
}

module.exports = {
  sanitizePromptInput
};
