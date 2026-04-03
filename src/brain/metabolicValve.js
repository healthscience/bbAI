/**
 * bbAI: Automatic Metabolic Valve
 * Role: Balances Local Emulation vs. Network Altruism (Nash Equilibrium).
 * Path: src/brain/metabolic-valve.js
 */

import { getContext } from './context.js';
// import { Messenger } from '../../messenger/index.js';

const VALVE_CONFIG = {
  HIGH_INTENSITY_THRESHOLD: 0.8, // 80% E-Value usage
  LOW_BATTERY_THRESHOLD: 0.2,    // 20% Battery
  NETWORK_CAP_DEFAULT: 0.2,      // 20% CPU for others (Altruism)
  NETWORK_CAP_IDLE: 0.6          // 60% CPU for others when charging/idle
};

export const MetabolicValve = {
  /**
   * Calculates the current "Altruism Quota" based on peer state.
   * @param {Object} hardwareStatus - { battery, isCharging, cpuLoad }
   * @returns {number} - 0.0 (Closed) to 1.0 (Full Open)
   */
  calculateAperture(hardwareStatus) {
    const { eValue, constraint } = getContext();
    const { battery, isCharging } = hardwareStatus;

    // 1. RULE: SELF-PRESERVATION (100/0)
    // If the Peer is mid-emulation (High E-Value) or battery is critical.
    if (eValue > VALVE_CONFIG.HIGH_INTENSITY_THRESHOLD || 
       (battery < VALVE_CONFIG.LOW_BATTERY_THRESHOLD && !isCharging)) {
      return 0.0; 
    }

    // 2. RULE: RECOVERY/IDLE (40/60)
    // If charging and no active complex constraint, we help the network more.
    if (isCharging && eValue < 0.3) {
      return VALVE_CONFIG.NETWORK_CAP_IDLE;
    }

    // 3. RULE: THE NASH EQUILIBRIUM (80/20)
    // Standard daily flow.
    return VALVE_CONFIG.NETWORK_CAP_DEFAULT;
  },

  /**
   * Applies the valve setting to the Messenger and P2P Swarm.
   */
  async update(hardwareStatus) {
    const aperture = this.calculateAperture(hardwareStatus);
    
    // Communicate the "Valve" state to the P2P layer
    // This tells Holepunch to throttle or ignore incoming 'WEIGHT_REQUESTS'
    // await Messenger.setPolicy('NETWORK_ALTRUISM_LIMIT', aperture);

    console.log(`[Bee] Metabolic Valve adjusted to: ${aperture * 100}%`);
    
    return aperture;
  }
};