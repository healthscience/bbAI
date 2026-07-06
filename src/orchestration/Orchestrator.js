'use strict'

export class Orchestrator {
  constructor(wiring, consilienceWeave) {
    this.wiring = wiring;
    this.consilienceWeave = consilienceWeave;
  }

  bindHeliClock() {
    this.wiring.heliLocation.on('HELI_DEGREE_PULSE', (pulseData) => {
      
      // 1. Query the Orrery for all entities tracking a temporal rhythm
      const activeEntities = {} /*this.wiring.safeflow.registry.getEntitiesWith([
        'LibraryReferenceComponent', 
        'TempoComponent'
      ]); */

      const entityCount = activeEntities.length;
      for (let i = 0; i < entityCount; i++) {
        const entityId = activeEntities[i];
        const tempoConfig = this.wiring.safeflow.registry.getComponent(entityId, 'TempoComponent');
        
        // 2. Check if the current physical truth satisfies this specific contract's tempo
        if (this.evaluateTempoShift(tempoConfig, pulseData)) {
          
          const contractRef = // this.wiring.safeflow.registry.getComponent(entityId, 'LibraryReferenceComponent');
          
          console.log(`[Interplay] Tempo [${tempoConfig.rhythm}] reached for [${contractRef.contractId}]. Triggering Emulation...`);
          
          // 3. Fire the weave, passing the reference and the exact temporal anchor
          // this.consilienceWeave.execute(contractRef.contractId, pulseData);

          // 4. Reset the tempo baseline for the next cycle
          // this.advanceTempoBaseline(entityId, tempoConfig, pulseData);
        }
      }
    });
  }

  /**
   * Evaluates if the required cycle threshold has been crossed
   */
  evaluateTempoShift(tempoConfig, pulseData) {
    switch (tempoConfig.rhythm) {
      case 'daily':
        // Triggered when the daily rotation wraps (e.g., drops from 359 back to 0)
        return pulseData.daily < tempoConfig.lastDailyValue;
        
      case 'seasonal':
        // Triggered every 90 degrees of the yearly orbit
        return Math.floor(pulseData.yearly / 90) !== Math.floor(tempoConfig.lastYearlyValue / 90);
        
      case 'orbital':
        // Triggered when the whole number age increments
        return pulseData.age.whole > tempoConfig.lastAgeWhole;

      case 'custom_arc':
        // Triggered after a specific degree delta has accumulated
        let delta = pulseData.yearly - tempoConfig.baselineYearly;
        if (delta < 0) delta += 360; 
        return delta >= tempoConfig.targetDelta;

      default:
        return false;
    }
  }

  /**
   * Updates the memory state to track the next cycle
   */
  advanceTempoBaseline(entityId, tempoConfig, pulseData) {
    const updatedTempo = {
      ...tempoConfig,
      lastDailyValue: pulseData.daily,
      lastYearlyValue: pulseData.yearly,
      lastAgeWhole: pulseData.age.whole,
      baselineYearly: pulseData.yearly // Reset for custom arcs
    };
    
    this.wiring.safeflow.registry.updateComponent(entityId, 'TempoComponent', updatedTempo);
  }
}