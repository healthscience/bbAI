import { describe, it, expect } from 'vitest';
import { stitchPrompt } from '../src/beebeeAgent/stitcher.js';

describe('Stitcher Logic', () => {
  it('should combine master prompt, task prompt, and user context', () => {
    const userInput = 'I want to improve my 400IM time.';
    const stitched = stitchPrompt(userInput);
    
    expect(stitched).toContain('Role: Beebee, the BentoBoxDS Guide.');
    expect(stitched).toContain('[TASK: EXTRACT LENSES]');
    expect(stitched).toContain('<user_context>I want to improve my 400IM time.</user_context>');
    expect(stitched).toContain('<response_guidance>');
  });
});
