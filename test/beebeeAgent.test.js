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
    const eventPromise = new Promise((resolve) => {
      bbAI.beebeeAgent.on('beebee-agent-reply', (data) => {
        console.log('beebee reply');
        console.log(data);

        // Add assertions here to verify the behavior of the beebeeMain function
        expect(data).toBeDefined();
        if (data.type !== 'response_complete') {
          expect(data.type).toBe('token');
        } else {
          expect(data.type).toBe('response_complete');
          // Resolve the promise when the event is received
          resolve();
        }
      });
    });
    await bbAI.startBeeBee()
    console.log('over start')
    // Call the beebeeMain function
    let prompt = "How to live a healthy life in 100 words please?";
    await bbAI.beebeeMain(prompt);

    // Wait for the event to be received
    await eventPromise;
  }, 100000); // Timeout set to 100000ms (100 seconds
});