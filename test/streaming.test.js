import { describe, it, expect, vi } from 'vitest';
import { StreamFilter } from '../src/beebeeAgent/handler.js';
import { EventEmitter } from 'events';

// Mocking the environment for listenBeeBeeAgent test
class MockBeeBeeAgent extends EventEmitter {}
class MockContext {
  constructor() {
    this.beebeeAgent = new MockBeeBeeAgent();
    this.emitted = [];
    this.currentTask = null;
  }
  emit(event, data) {
    this.emitted.push({ event, data });
  }
}

describe('Streaming Integration', () => {
  it('should filter tokens and emit clean text', async () => {
    const ctx = new MockContext();
    const streamFilter = new StreamFilter();
    
    // Simulate the listenBeeBeeAgent logic
    ctx.beebeeAgent.on('beebee-agent-reply', (data) => {
      if (data.type === 'token') {
        const cleanToken = streamFilter.process(data.data || '');
        if (cleanToken) {
          ctx.emit('beebee-pre-response', { ...data, data: cleanToken });
        }
      }
    });

    const tokens = [
      { type: 'token', data: 'Hello ' },
      { type: 'token', data: '<ui' },
      { type: 'token', data: '_data>' },
      { type: 'token', data: '{"state":"Active"}' },
      { type: 'token', data: '</ui_data>' },
      { type: 'token', data: 'world!' }
    ];

    tokens.forEach(t => ctx.beebeeAgent.emit('beebee-agent-reply', t));
    
    // Flush remaining buffer
    const final = streamFilter.flush();
    if (final) {
      ctx.emit('beebee-pre-response', { type: 'token', data: final });
    }

    const output = ctx.emitted
      .filter(e => e.event === 'beebee-pre-response')
      .map(e => e.data.data)
      .join('');

    expect(output).toBe('Hello world!');
  });

  it('should filter out agent tags during streaming', async () => {
    const ctx = new MockContext();
    const streamFilter = new StreamFilter();
    
    ctx.beebeeAgent.on('beebee-agent-reply', (data) => {
      if (data.type === 'token') {
        const cleanToken = streamFilter.process(data.data || '');
        if (cleanToken) {
          ctx.emit('beebee-pre-response', { ...data, data: cleanToken });
        }
      }
    });

    const tokens = [
      { type: 'token', data: 'Call ' },
      { type: 'token', data: '[[PERP' },
      { type: 'token', data: 'LEXITY]]' },
      { type: 'token', data: ' now.' }
    ];

    tokens.forEach(t => ctx.beebeeAgent.emit('beebee-agent-reply', t));
    
    const final = streamFilter.flush();
    if (final) {
      ctx.emit('beebee-pre-response', { type: 'token', data: final });
    }

    const output = ctx.emitted
      .filter(e => e.event === 'beebee-pre-response')
      .map(e => e.data.data)
      .join('');

    expect(output).toBe('Call  now.');
  });
});
