import { describe, it, expect } from 'vitest';
import { stripXML, parseUIData, processResponse, StreamFilter } from '../src/beebeeAgent/handler.js';

describe('Handler Logic', () => {
  it('should strip XML correctly', () => {
    const raw = 'Here is your data.\n<ui_data>{"capacity": ["energy"]}</ui_data>\nHave a good day!';
    const stripped = stripXML(raw);
    expect(stripped).toBe('Here is your data.\n\nHave a good day!');
  });

  it('should parse valid JSON from ui_data', () => {
    const raw = 'Text\n<ui_data>{"capacity": ["energy"], "context": ["tools"], "coherence": ["balance"], "state": "Active"}</ui_data>';
    const parsed = parseUIData(raw);
    expect(parsed.state).toBe('Active');
    expect(parsed.capacity).toEqual(['energy']);
  });

  it('should fallback to Neutral state on invalid JSON', () => {
    const raw = 'Text\n<ui_data>{"capacity": ["energy", invalid json}</ui_data>';
    const parsed = parseUIData(raw);
    expect(parsed.state).toBe('Neutral');
  });

  it('should return multiple messages including routing', async () => {
    const raw = 'I need to route this to [[MEDICAL]]. <ui_data>{"state": "Active"}</ui_data>';
    const results = await processResponse(raw, 'my symptoms');
    
    expect(results).toHaveLength(3);
    expect(results.find(m => m.type === 'chat-reply').text).toBe('I need to route this to .');
    expect(results.find(m => m.type === 'lens-extraction').lens.state).toBe('Active');
    expect(results.find(m => m.type === 'agent-notification').agent).toBe('MEDICAL');
  });
});

describe('StreamFilter', () => {
  it('should filter out <ui_data> blocks during streaming', () => {
    const filter = new StreamFilter();
    const tokens = [
      'Hello ',
      'world',
      '! <ui',
      '_data>',
      '{"secret":',
      '123}',
      '</ui_data>',
      ' How are ',
      'you?'
    ];

    let output = '';
    tokens.forEach(t => {
      output += filter.process(t);
    });
    output += filter.flush();

    expect(output).toBe('Hello world!  How are you?');
  });

  it('should filter out [[Agent]] tags during streaming', () => {
    const filter = new StreamFilter();
    const tokens = [
      'Please ',
      'ask ',
      '[[PERP',
      'LEXITY]]',
      ' for help.'
    ];

    let output = '';
    tokens.forEach(t => {
      output += filter.process(t);
    });
    output += filter.flush();

    expect(output).toBe('Please ask  for help.');
  });
});
