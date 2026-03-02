import { stitchPrompt } from './stitcher.js';

export const stripXML = (text) => {
  if (!text) return '';
  // Remove <ui_data>...</ui_data> block
  return text.replace(/<ui_data>[\s\S]*?<\/ui_data>/g, '').trim();
};

export const parseUIData = (text) => {
  if (!text) return { capacity: [], context: [], coherence: [], state: 'Neutral' };
  
  // Try parsing as raw JSON first (for grammar-based output)
  try {
    const parsed = JSON.parse(text.trim());
    if (parsed && (parsed.capacity || parsed.context || parsed.coherence)) {
      return parsed;
    }
  } catch (e) {
    // Not raw JSON, try XML extraction
  }

  const match = text.match(/<ui_data>([\s\S]*?)<\/ui_data>/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch (e) {
      console.error('Failed to parse <ui_data> JSON:', e);
    }
  }
  // Fallback to Neutral lens state
  return {
    capacity: [],
    context: [],
    coherence: [],
    state: 'Neutral'
  };
};

export const routeToSpecialist = async (targetAgent, text) => {
  // Placeholder for routing logic
  console.log(`Routing to specialist: ${targetAgent}`);
  return {
    text: `Routing your request to ${targetAgent}...`,
    lens: { state: 'Routing', target: targetAgent }
  };
};

export const processResponse = async (rawResponse, payloadText) => {
  // Logic to detect Tool Routing
  const targetAgentMatch = rawResponse.match(/\[\[(.*?)\]\]/);
  const targetAgent = targetAgentMatch ? targetAgentMatch[1] : null;
  
  if (targetAgent) {
    // Hand-off logic to specialized HOP agents (Perplexity/ii.inc)
    return routeToSpecialist(targetAgent, payloadText);
  }

  return {
    text: stripXML(rawResponse),
    lens: parseUIData(rawResponse)
  };
};
