/**
 * bbAI: Brain Memory
 * Role: Persistent storage for Weights, Bindings, and Composite Contracts.
 * Technology: Hyperbee (Local-first, P2P Key-Value Store)
 */

let currentHolepunch = {};

/**
 * Initializes the context with the global contextAgent (Holepunch/HOP network)
 */
export const initializeMemory = (agent) => {
  currentHolepunch = agent;
};


export const Memory = {
  /**
   * Saves numerical weights (Physics, Language, or Pattern flavors).
   * @param {string} flavorKey - e.g., 'swimming_semantics'
   * @param {Float32Array|Array} weights - The numerical 'IQ' of the agent.
   * @param {Object} metadata - Source CID, timestamp, resonance score.
   */
  async saveWeights(flavorKey, weights, metadata = {}) {
    await currentHolepunch.BeeData.put(`weights:${flavorKey}`, {
      weights: Array.from(weights), // Convert to array for JSON storage
      metadata,
      updatedAt: Date.now()
    });
    console.log(`[Memory] Weights persisted for flavor: ${flavorKey}`);
  },

  /**
   * Retrieves weights for a specific agent flavor.
   */
  async getWeights(flavorKey) {
    const entry = await currentHolepunch.BeeData.get(`weights:${flavorKey}`);
    return entry ? entry.value : null;
  },

  /**
   * Saves a Semantic Binding (The @teach link).
   * Links a human word ("heavy") to a Physics Variable ("fluid_density").
   */
  async saveBinding(constraint, binding) {
    const key = `binding:${constraint}:${binding.term}`;
    await currentHolepunch.BeeData.put(key, {
      ...binding,
      vouchedBy: 'Peer_Sovereign_Identity'
    });
  },

  /**
   * Saves an Ordered Composite (The 400IM Sequence).
   */
  async saveComposite(key, chain) {
    await currentHolepunch.BeeData.put(`composite:${key}`, {
      chain,
      version: '1.0.0'
    });
  },

  /**
   * Retrieves the 'History of Feel' for the Pattern Agent.
   * Pulls previous snapshots where resonance was high.
   */
  async getHistory(constraint) {
    const history = [];
    // We stream the history for this specific constraint
    const stream = currentHolepunch.BeeData.createReadStream({
      gte: `history:${constraint}:`,
      lte: `history:${constraint}:\xff`
    });

    for await (const node of stream) {
      history.push(node.value);
    }
    return history;
  },

  /**
   * Records a 'Moment of Resonance'.
   * Called by the ContextManager when the resonAgent reports back.
   */
  async recordResonance(constraint, snapshot) {
    const id = Date.now();
    await currentHolepunch.BeeData.put(`history:${constraint}:${id}`, {
      ...snapshot,
      timestamp: id
    });
  }
};