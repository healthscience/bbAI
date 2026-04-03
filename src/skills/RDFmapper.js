import wiki from 'wikijs';
import N3 from 'n3';
import axios from 'axios';

/**
 * Skill: RDF Navigator
 * Traverses one layer of a URI in an RDF graph and extracts words from Wikipedia.
 */
export const RDFNavigator = {
  name: "rdf_navigator",

  /**
   * Extracts words from a Wikipedia page.
   * @param {string} url - The Wikipedia URL.
   * @returns {Promise<string[]>} - List of words.
   */
  async fetchWikipediaWords(url) {
    try {
      const parts = url.split('/wiki/');
      const title = decodeURIComponent(parts.pop().replace(/_/g, ' '));
      const page = await wiki().page(title);
      const summary = await page.summary(); 
      return this.tokenize(summary);
    } catch (error) {
      console.error(`[RDFNavigator] Wikipedia extraction failed: ${error.message}`);
      return [];
    }
  },

  /**
   * Traverses one layer of connections from a DBpedia RDF link and extracts words.
   * Organizes results into an object mapping predicates to their object words.
   * @param {string} rdfUrl - The DBpedia RDF URL (e.g., .ttl or .nt).
   * @param {string} subjectUri - Optional subject URI to filter.
   * @returns {Promise<Object>} - Object where keys are layer (predicate) labels and values are arrays of words.
   */
  async fetchDBpediaLayer(rdfUrl, subjectUri = null) {
    try {
      const response = await axios.get(rdfUrl);
      const parser = new N3.Parser();
      const store = new N3.Store();

      return new Promise((resolve, reject) => {
        parser.parse(response.data, (error, quad) => {
          if (error) {
            reject(error);
          } else if (quad) {
            store.addQuad(quad);
          } else {
            // Parsing complete
            const layerMap = this.extractLayeredWords(store, subjectUri);
            resolve(layerMap);
          }
        });
      });
    } catch (error) {
      console.error(`[RDFNavigator] RDF extraction failed: ${error.message}`);
      return {};
    }
  },

  /**
   * Extracts words organized by predicate (layer keys).
   */
  extractLayeredWords(store, subjectUri) {
    const layerMap = {};
    const quads = subjectUri 
      ? store.getQuads(N3.DataFactory.namedNode(subjectUri), null, null, null)
      : store.getQuads(null, null, null, null);

    for (const quad of quads) {
      const predicateKey = this.getFragment(quad.predicate.value);
      if (!predicateKey) continue;

      if (!layerMap[predicateKey]) {
        layerMap[predicateKey] = new Set();
      }

      // Extract words from object
      if (quad.object.termType === 'Literal') {
        const literalWords = this.tokenize(quad.object.value);
        literalWords.forEach(w => layerMap[predicateKey].add(w));
      } else if (quad.object.termType === 'NamedNode') {
        const objLabel = this.getFragment(quad.object.value);
        if (objLabel) layerMap[predicateKey].add(objLabel);
      }
    }

    // Convert Sets to Arrays and filter empty layers
    const finalMap = {};
    for (const [key, wordSet] of Object.entries(layerMap)) {
      const words = Array.from(wordSet).filter(w => w && w.length > 2);
      if (words.length > 0) {
        finalMap[key] = words;
      }
    }
    return finalMap;
  },

  /**
   * Helper to get the last part of a URI.
   */
  getFragment(uri) {
    const fragment = uri.split(/[#/]/).pop();
    return fragment ? fragment.replace(/_/g, ' ') : '';
  },

  /**
   * Standard bbAI tokenization.
   */
  tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3); // Filter short words
  }
};
