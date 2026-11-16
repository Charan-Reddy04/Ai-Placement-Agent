import Groq from 'groq-sdk';
import env from '../config/env.js';

let groqInstance = null;
let verifiedWorkingModel = null;
let isListingModels = false;

function initGroqClient() {
  if (
    env.GROQ_API_KEY &&
    env.GROQ_API_KEY.trim() !== '' &&
    !env.GROQ_API_KEY.includes('your_')
  ) {
    try {
      groqInstance = new Groq({ apiKey: env.GROQ_API_KEY.trim() });
    } catch (err) {
      console.warn('[GroqService]: Could not initialize Groq SDK:', err.message);
    }
  } else {
    groqInstance = null;
  }
}

initGroqClient();

export const hasLiveGroqKey = () => {
  return (
    !!groqInstance &&
    !!env.GROQ_API_KEY &&
    env.GROQ_API_KEY.trim() !== '' &&
    !env.GROQ_API_KEY.includes('your_')
  );
};

// Dynamically discover active models supported on user's Groq account
async function getAvailableChatModels() {
  if (!groqInstance) {
    initGroqClient();
  }

  if (!groqInstance) {
    return [env.GROQ_MODEL || 'qwen/qwen3.8-27b'];
  }

  try {
    const listRes = await groqInstance.models.list();
    const liveModels = (listRes?.data || []).map((m) => m.id);
    const nonChatFilter = /(whisper|prompt-guard|orpheus|safeguard)/i;
    const chatModels = liveModels.filter((m) => !nonChatFilter.test(m));
    console.log('[GroqService]: Connected to Groq. Active chat models:', chatModels);

    // Preferred priority order
    const priority = [
      env.GROQ_MODEL,
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'allam-2-7b',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
    ].filter(Boolean);

    const ordered = [];
    for (const p of priority) {
      if (chatModels.includes(p) && !ordered.includes(p)) {
        ordered.push(p);
      }
    }
    for (const c of chatModels) {
      if (!ordered.includes(c)) {
        ordered.push(c);
      }
    }

    return ordered.length > 0 ? ordered : ['qwen/qwen3.8-27b'];
  } catch (err) {
    console.warn(`[GroqService]: Could not list live models (${err.status || ''} ${err.message}). Using default.`);
    return [env.GROQ_MODEL || 'qwen/qwen3.8-27b'];
  }
}

// Generic LLM completion with dynamic model discovery, token budgeting, and automatic fallback
export const callGroqChat = async ({
  messages,
  temperature = 0.2,
  max_tokens = 800,
  responseFormat = null,
  tools = null,
  toolChoice = 'auto',
}) => {
  if (!hasLiveGroqKey()) {
    return null; // Signals caller to use deterministic local AI reasoning engine
  }

  const candidateModels = await getAvailableChatModels();

  for (const modelToUse of candidateModels) {
    try {
      const payload = {
        model: modelToUse,
        messages,
        temperature,
        max_tokens, // Crucial: avoids exceeding free tier on-demand OTPM (Output Tokens Per Minute) limit
      };

      if (responseFormat) {
        payload.response_format = responseFormat;
      }

      if (tools && tools.length > 0) {
        payload.tools = tools;
        payload.tool_choice = toolChoice;
      }

      const completion = await groqInstance.chat.completions.create(payload);
      return completion.choices[0]?.message;
    } catch (err) {
      console.warn(
        `[GroqService]: Model '${modelToUse}' returned error (${err.status || ''} ${err.message?.slice(0, 150)}). Trying fallback model...`
      );
    }
  }

  console.warn('[GroqService]: All Groq models exhausted. Falling back to local agent reasoning.');
  return null;
};

export default {
  hasLiveGroqKey,
  callGroqChat,
};
