/**
 * traceLoom.js
 * The Synthesis Engine for BeeBee-AI.
 * Orchestrates the "Genesis" and "Warm Start" of a Peer's session.
 */

export const TraceLoom = {
  /**
   * stitch
   * The master assembly function.
   * @param {Object} raw - The "Shotgun" histories from library-hop/loomCycle
   * @param {Object} beebee - The active BeeBee instance for pattern activation
   */
  async stitch(raw, beebee) {
    const {
      lifestrap = [], // <--- This is the missing piece 
      besearch = [], 
      cue = [], 
      chat = [], 
      marker = [], 
      orgo = [], 
      gelle = [],
      agentMemory = [],
      learnHistory = [] 
    } = raw;

    // 0 get the most first lifestrap story set by peer
    // We ensure every strand we stitch is authorized by the Lifestrap Contract
    const activeLifestrap = lifestrap[0]; // Assuming most recent/active

    // 1. UNIVERSAL HAND-OFF: Language resonAgent
    // The linguistic brain learns from ALL contexts (One-to-Many).
    if (beebee.resonAgents?.language) {
      const globalLang = agentMemory.filter(m => m.agentType === 'language');
      beebee.resonAgents.language.hydrate(globalLang);
    }

    // 2. THE STRAND ASSEMBLY: Processing each Besearch Cycle
    const activeStrands = besearch.map(strand => {
      const strandId = strand.id;

      const stitched = {
        ...strand,
        
        // RELATIONAL JOINING
        dialogue: chat.find(c => c.besearchId === strandId),
        residue: cue.filter(q => q.besearchId === strandId || q.context === strand.context),
        anchors: marker.filter(m => m.besearchId === strandId),

        // LOGIC HYDRATION
        logic: {
          orgo: orgo.find(o => o.id === strand.orgoId),
          gelle: gelle.find(g => g.id === strand.gelleId),
          evolution: learnHistory.filter(l => l.targetId === strand.orgoId) // NEAT-HOP lessons
        },

        // TRINITY MEMORY (Specific to this Physics/Pattern)
        specialistMemory: {
          physics: agentMemory.find(m => m.besearchId === strandId && m.agentType === 'physics'),
          pattern: agentMemory.find(m => m.besearchId === strandId && m.agentType === 'pattern')
        }
      };

      // 3. PATTERN ACTIVATION (The Hand-offs)
      this.activatePatterns(stitched, beebee);

      return stitched;
    });

    return activeStrands;
  },

  /**
   * activatePatterns
   * Fires the specific internal BeeBee systems for a stitched strand.
   */
  activatePatterns(strand, beebee) {
    // A. Brain Focus: Feed the dialogue and unmapped cues to the Brain
    if (beebee.brain) {
      beebee.brain.engageContext(strand.dialogue, strand.residue);
    }

    // B. Skill Loading: If it's a 'swim' strand, wake the relevant skill
    if (beebee.skills && strand.type) {
      beebee.skills.request(strand.type);
    }

    // C. Specialist Agents: Spawn the specific Physics/Pattern monitors
    if (beebee.resonAgents) {
      beebee.resonAgents.spawnSpecialists(
        strand.id, 
        strand.logic.orgo, 
        strand.specialistMemory
      );
    }
  },

  /**
   * verifyCoherence
   * Simple logic to check if the Orgo math aligns with the last known Pulse.
   */
  getCoherenceScore(orgo, pulse) {
    if (!orgo || !pulse) return 1.0;
    // Implementation of the resonance delta calculation
    return 1.0; // Placeholder for alignment logic
  }
};





/**
 * traceLoom.js (Updated with Lifestrap Anchor)
 */

export const traceLoom = {
  async stitch(raw, beebee) {
    const { 
      lifestrap = [], // <--- This is the missing piece
      besearch = [], 
      // ... other raw parts
    } = raw;

    // 0. THE ANCHOR VALIDATION
    // We ensure every strand we stitch is authorized by the Lifestrap Contract
    const activeLifestrap = lifestrap[0]; // Assuming most recent/active

    const activeStrands = besearch.map(strand => {
      // Security/Logic Check: Does this strand belong to our current Story?
      if (activeLifestrap && !activeLifestrap.allowedStrands.includes(strand.id)) {
        return null; 
      }

      const stitched = {
        ...strand,
        storyContext: activeLifestrap.goal, // e.g. "Longevity at 65"
        // ... rest of the joining logic
      };
      
      // ... rest of the stitch
    }).filter(Boolean); // Remove unauthorized strands

    return activeStrands;
  }
};