// beebee/src/conduction/besearchConduction.js

export class BesearchConduction {
  constructor(wiring) {
    // wiring provides access to: safeflow, heli, library, peer/network contexts
    this.wiring = wiring; 
    this.activeContracts = [];
    
    // Ledger ensures conduction fires exactly once per geometric Arc per solar day cycle
    this.historyLedger = new Set(); 
  }

  /**
   * V1: Bring conduction online and bind to the planetary rotation.
   * @param {Array} besearchContracts - Active contracts self-authorized by the peer
   */
  engage(besearchContracts) {
    this.activeContracts = besearchContracts;
    console.log(`[Conduction] Engaging ${this.activeContracts.length} besearch contracts...`);

    // We do not use old-world polling or timers (setInterval, ms).
    // We bind directly to the Heli engine's native geometric event emitter.
    // As the planet rotates and passes a threshold, Heli emits the new Arc.
    this.wiring.heli.on('arc_progression', (currentArc, cycleIndex) => {
      this.evaluateArcMatch(currentArc, cycleIndex);
    });
  }

  /**
   * The core V1 loop: Triggered purely by the planet shifting Arcs.
   */
  evaluateArcMatch(currentArc, cycleIndex) {
    for (const contract of this.activeContracts) {
      
      // The target Arc specified in the peer's contract (e.g., 'zenith', 'dawn', 'nadir')
      const targetArc = contract.heliPulse; 

      // Compare the contract's geometric requirement to the current planetary Arc
      if (targetArc === currentArc) {
        
        // Create a unique lock: Contract ID + Solar Cycle Index + Arc
        const pulseLock = `${contract.id}-${cycleIndex}-${targetArc}`;

        if (!this.historyLedger.has(pulseLock)) {
          console.log(`[Conduction] Heli Arc match met for contract: ${contract.id} at Arc [${targetArc}]`);
          
          this.buildAndPushQuery(contract, cycleIndex, currentArc);
          
          this.historyLedger.add(pulseLock);
        }
      }
    }
  }

  /**
   * Constructs the data footprint to send to SafeFlow-ECS  // maybe upgrade HQB  hop query builder
   */
  buildAndPushQuery(contract, cycleIndex, arc) {
    // V1 HOPquery construction based strictly on geometric coordinates and the contract
    const hopQuery = {
      intent: "besearch_pulse",
      contractId: contract.id,
      cues: contract.cues,
      heli: {
        index: cycleIndex,
        arc: arc
      }
    };

    try {
      // Direct injection into the SafeFlow-ECS execution fabric via universal wiring
      this.wiring.safeflow.inputHOPquery(hopQuery);
      console.log(`[Conduction] HOPquery conducted to SafeFlow-ECS for ${contract.id}`);
    } catch (error) {
      console.error(`[Conduction] SafeFlow-ECS input failed for ${contract.id}:`, error);
    }
  }

  /**
   * Cleanly unbinds the conduction layer
   */
  disengage() {
    // Unhook from the Heli engine's Arc progression event
    if (this.wiring.heli.removeAllListeners) {
      this.wiring.heli.removeAllListeners('arc_progression');
    }
    this.historyLedger.clear();
    console.log("[Conduction] Arc monitoring disengaged.");
  }
}