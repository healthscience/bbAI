/**
 * traceLoom.js
 * Location: beebee-ai
 * Role: The Weaver / Joiner of Strands
 */
export const traceLoom = {
  /**
   * stitchSession
   * BeeBee calls this once loomCycle returns the raw histories.
   */
  stitchSession(rawHistories) {
    const { besearch, cue, chat, orgo, gelle } = rawHistories;

    return besearch.map(strand => {
      return {
        ...strand,
        // The "Joining" logic
        dialogue: chat.find(c => c.besearchId === strand.id),
        residue: cue.filter(q => q.besearchId === strand.id),
        logic: {
          orgo: orgo.find(o => o.id === strand.orgoId),
          gelle: gelle.find(g => g.id === strand.gelleId)
        },
        status: 'Stitched'
      };
    });
  }
};