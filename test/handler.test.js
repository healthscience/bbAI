import { describe, it, expect } from 'vitest';
import { stripXML, parseUIData, processResponse } from '../src/beebeeAgent/handler.js';

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

  it('should detect routing tags', async () => {
    const raw = 'I need to route this to [[MEDICAL]].';
    const result = await processResponse(raw, 'my symptoms');
    expect(result.lens.state).toBe('Routing');
    expect(result.lens.target).toBe('MEDICAL');
  });
});
