/**
 * Skill: DataMapper
 * Translates safeFLOW-ecs objects into WASM-ready TypedArrays.
 * Reference: MIT Space vs Time (Efficient memory layout).
 */

export const DataMapper = {
  /**
   * Packs biomarker data into a Float32Array based on the RDF Schema.
   * @param {Object} rawData - Data pulled from safeFLOW-ecs.
   * @param {Array} schema - Ordered list of biomarkers from RDF (e.g., ['HR', 'VO2', 'Velocity']).
   * @returns {Float32Array} - The 'Clean' buffer for the resonAgent.
   */
  pack(rawData, schema) {
    const buffer = new Float32Array(schema.length);

    for (let i = 0; i < schema.length; i++) {
      const key = schema[i];
      // If a biomarker is missing, we default to 0.0 (Zero-Draft Mode)
      buffer[i] = rawData[key] || 0.0;
    }

    return buffer;
  },

  /**
   * The "Catalytic" Pack: Reuses an existing buffer to save memory energy.
   */
  packInPlace(rawData, schema, targetBuffer) {
    schema.forEach((key, index) => {
      targetBuffer[index] = rawData[key] || 0.0;
    });
  }
};