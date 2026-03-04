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
  // Handle case where rawResponse is an object (e.g., { type: 'response_complete', data: '...' })
  const responseText = (typeof rawResponse === 'object' && rawResponse !== null) 
    ? (rawResponse.data || rawResponse.text || '') 
    : (rawResponse || '');

  // Logic to detect Tool Routing
  const targetAgentMatch = responseText.match(/\[\[(.*?)\]\]/);
  const targetAgent = targetAgentMatch ? targetAgentMatch[1] : null;
  
  const results = [];

  // 1. Text for chat reply
  results.push({
    type: 'chat-reply',
    text: stripXML(responseText).replace(/\[\[.*?\]\]/g, '').trim()
  });

  // 2. Lens extraction
  results.push({
    type: 'lens-extraction',
    lens: parseUIData(responseText)
  });

  // 3. Agent routing notification
  if (targetAgent) {
    results.push({
      type: 'agent-notification',
      agent: targetAgent,
      text: `we need to create research paper from ${targetAgent} are you happy to call the agent? Or should we ask perplexity for product information about ....?`
    });
  }

  return results;
};

/**
 * Simple stateful filter for streaming tokens to hide <ui_data> and [[Agent]] tags
 */
export class StreamFilter {
  constructor() {
    this.buffer = '';
    this.isFiltering = false;
  }

  process(token) {
    this.buffer += token;
    
    // If we are currently filtering out a block
    if (this.isFiltering) {
      if (this.buffer.includes('</ui_data>') || this.buffer.includes(']]')) {
        // Find where the block ends
        const uiEnd = this.buffer.indexOf('</ui_data>');
        const agentEnd = this.buffer.indexOf(']]');
        
        let endIdx = -1;
        if (uiEnd !== -1 && agentEnd !== -1) endIdx = Math.min(uiEnd + 10, agentEnd + 2);
        else if (uiEnd !== -1) endIdx = uiEnd + 10;
        else endIdx = agentEnd + 2;

        this.buffer = this.buffer.substring(endIdx);
        this.isFiltering = false;
        return this.process(''); // Recurse to check for more tags
      }
      return ''; // Still filtering
    }

    // Check for start of tags
    const uiStart = this.buffer.indexOf('<ui_data>');
    const agentStart = this.buffer.indexOf('[[');

    if (uiStart !== -1 || agentStart !== -1) {
      const startIdx = uiStart !== -1 && agentStart !== -1 ? Math.min(uiStart, agentStart) : (uiStart !== -1 ? uiStart : agentStart);
      const output = this.buffer.substring(0, startIdx);
      this.buffer = this.buffer.substring(startIdx);
      this.isFiltering = true;
      return output;
    }

    // If buffer is getting long and no tags found, release most of it
    // but keep enough to catch a split tag (e.g. "<ui_")
    if (this.buffer.length > 10) {
      const output = this.buffer.substring(0, this.buffer.length - 9);
      this.buffer = this.buffer.substring(this.buffer.length - 9);
      return output;
    }

    return '';
  }

  flush() {
    if (this.isFiltering) return '';
    const output = this.buffer;
    this.buffer = '';
    return output;
  }
}
