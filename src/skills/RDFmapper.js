/**
 * Skill: RDF Navigator
 * Traverses one layer of the local-first metadata graph.
 */
const localGraph = {
  'meta:400im_race': {
    'requiresModel': 'ipfs://swimming-physics-v2.wasm',
    'requiresBiomarkers': ['HR', 'VO2', 'Strokes_Per_Length'],
    'resonanceThreshold': 0.85
  }
};

export const traverseConstraintMetadata = (anchor) => {
  // Simple 1-layer lookup (Subject -> Predicate -> Object)
  const metadata = localGraph[anchor];
  
  if (!metadata) {
    throw new Error(`Coherence Gap: No RDF metadata found for ${anchor}`);
  }

  return {
    wasmUri: metadata.requiresModel,
    inputSchema: metadata.requiresBiomarkers
  };
};