import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import BbAI from '../src/index.js';

let bbAI;

describe('BbAI', () => {
  let mockLibrary;

beforeEach(async () => {
    // Create a mock library object
    mockLibrary = {};

    // Create a new instance of BbAI
    bbAI = new BbAI(mockLibrary);
  });

  afterEach(() => {
    // Clear all mocks after each test
  });

  it('should initialize and handle messages correctly', async () => {
    // Create a promise to wait for the event

    let bboxid = '12345'

    const eventPromise = new Promise((resolve) => {
      let responsesReceived = 0;
      bbAI.beebeeAgent.on('beebee-agent-reply', (data) => {
        // Add assertions here to verify the behavior of the beebeeMain function
        expect(data).toBeDefined();
        if (data.type !== 'response_complete' && data.type !== 'llm_ready') {
          expect(data.type).toBe('token');
          expect(data.bboxid).toBeDefined();
          expect(data.bboxid).toBe(bboxid) // Verify bboxid is present
        } else if (data.type === 'llm_ready') {
          console.log('llm ready')
        } else {
          expect(data.type).toBe('response_complete');
          responsesReceived++;
          // Resolve the promise when both events (Reply + Extraction) are received
          if (responsesReceived >= 2) {
            resolve();
          }
        }
      });
    });

    const initPromise = new Promise((resolve) => {
      bbAI.beebeeAgent.on('beebee-agent-reply', (data) => {
        if (data.type === 'llm_ready') {
          resolve();
        }
      }, 100000);
    });

    // Start the BeeBee agent and wait for initialization to complete
    await bbAI.startBeeBee();
    await initPromise;
    try {
      const { MASTER_PROMPT } = await import('../src/beebeeAgent/prompts.js');
      bbAI.beebeeAgent.beebee.startNewChatSession(bboxid, MASTER_PROMPT);
    } catch (e) {
      console.error('Error in startNewChatSession:', e);
    }
    // Call the beebeeMain function
    let prompt = "How to live a healthy life in 100 words please?";
    
    // Step 1: Peer Reply
    bbAI.currentTask = 'PEER_REPLY';
    await bbAI.beebeeMain(prompt, bboxid);

    // Step 2: Extraction (The 3Cs)
    bbAI.currentTask = 'LENS_EXTRACTION';
    const extractionPrompt = `[TASK: EXTRACT LENSES]\nInput: "${prompt}"`;
    await bbAI.beebeeMain(extractionPrompt, bboxid, {
      grammar: 'lens',
      temperature: 0.2,
      maxTokens: 128
    });

    // Wait for the event to be received
    await eventPromise;
  }, 100000); // Timeout set to 100000ms (100 seconds
});