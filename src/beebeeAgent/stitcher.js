import { MASTER_PROMPT, TASK_PROMPTS } from './prompts.js';

export const stitchPrompt = (userInput, task = 'CONTEXT_EXTRACTION') => {
  return `
${MASTER_PROMPT}
${TASK_PROMPTS[task]}
<user_context>${userInput}</user_context>
<response_guidance>Provide Clean Text followed by <ui_data>JSON</ui_data></response_guidance>
  `.trim();
};
