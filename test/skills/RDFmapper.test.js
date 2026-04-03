import { describe, it, expect } from 'vitest';
import { RDFNavigator } from '../../src/skills/RDFmapper.js';

describe('RDFNavigator Live Integration', () => {
  // Increase timeout for live network requests
  const TIMEOUT = 15000;

  it('should extract words from live Wikipedia URL for Heart', async () => {
    const url = 'https://en.wikipedia.org/wiki/Heart';
    const words = await RDFNavigator.fetchWikipediaWords(url);
    
    console.log(`[Test] Wikipedia '${url}' - Extracted ${words.length} words.`);
    
    expect(words.length).toBeGreaterThan(0);
    // Basic validation that we got heart-related content
    expect(words.some(w => w.includes('heart'))).toBe(true);
  }, TIMEOUT);

  it('should parse live RDF and extract one layer of words for Heart', async () => {
    const rdfUrl = 'https://dbpedia.org/data/Heart.ttl';
    const subjectUri = 'http://dbpedia.org/resource/Heart';
    
    const layerMap = await RDFNavigator.fetchDBpediaLayer(rdfUrl, subjectUri);
      
    console.log(`[Test] DBpedia '${rdfUrl}' - Extracted ${Object.keys(layerMap).length} layers.`);
    
    expect(Object.keys(layerMap).length).toBeGreaterThan(0);
    // Should have keys like 'label' or 'anatomy'
    expect(layerMap).toHaveProperty('label');
    expect(layerMap.label).toContain('heart');
  }, TIMEOUT);

  it('should handle invalid live URLs gracefully', async () => {
    const layerMap = await RDFNavigator.fetchDBpediaLayer('https://dbpedia.org/data/ThisDoesNotExist_12345.ttl');
    expect(layerMap).toEqual({});
  }, TIMEOUT);
});
