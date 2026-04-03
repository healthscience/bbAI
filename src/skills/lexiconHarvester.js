/**
 * bbAI Skill: LexiconHarvester
 * Role: Converts Multimodal Sources into Language Weights (W_lang).
 * Sources: Research Papers, Transcripts, Tweets, Biomarker Specs.
 */

import { Hyperdrive } from '../persistence/hyper-drive.js';
import { Memory } from '../brain/memory.js';

export const LexiconHarvester = {
  name: "lexicon_harvester",

  /**
   * Entry point for new knowledge ingestion.
   * @param {string} sourceUri - Hyperdrive CID or URL of the raw data.
   * @param {string} sourceType - 'paper' | 'transcript' | 'social' | 'spec'
   */
  async digest(sourceUri, sourceType) {
    console.log(`[Bee] Harvesting Lexicon from ${sourceType}: ${sourceUri}`);
    
    // 1. RAW EXTRACTION: Pull the bytes
    const rawData = await Hyperdrive.readFile(sourceUri);
    
    // 2. CLEANING: Remove noise (ads, timestamps, tweet metadata)
    const cleanText = this.sanitize(rawData, sourceType);

    // 3. VECTORIZATION: Convert text into a Float32Array of "Concept Weights"
    // This is where the 'Small LLM' maps words to the Swimming RDF.
    const conceptWeights = await this.vectorize(cleanText);

    // 4. BRAIN UPDATE: Save the new 'Language Flavor' weights to Hyperbee
    await Memory.saveWeights('swimming_semantics', conceptWeights, {
      source: sourceUri,
      type: sourceType,
      resonance: 0.85 // Initial trust score for research/specs
    });

    return { status: 'LEARNED', conceptCount: conceptWeights.length };
  },

  /**
   * Removes non-essential data based on the source flavor.
   */
  sanitize(text, type) {
    if (type === 'transcript') {
      return text.replace(/\[\d+:\d+\]/g, ''); // Remove timestamps
    }
    if (type === 'social') {
      return text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, ''); // Remove URLs
    }
    return text.trim();
  },

  /**
   * The "Bridge" to the resonAgent:
   * Maps text strings to the numerical indices in the WASM Language Model.
   */
  async vectorize(text) {
    // This calls the internal 'Brain' tokenizer to ensure 
    // the weights align with the resonAgent's dictionary.
    const tokens = text.toLowerCase().split(/\W+/);
    const weights = new Float32Array(tokens.length); 
    
    // Logic to weight 'Biomarker' terms higher than 'General' terms
    tokens.forEach((token, i) => {
      weights[i] = this.isTechnical(token) ? 0.9 : 0.1;
    });

    return weights;
  }
};