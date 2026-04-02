/**
 * BEEBEE-AI: CATALYST PROFILES
 * Manages the "Medicine" feel by balancing Space (Memory) vs Time (CPU).
 */

const CatalystProfiles = {
  // Performance: Trading Space for Time
  performance: {
    label: "400IM_SPRINT",
    resonanceFrequency: 10, // 100ms ticks
    tmto: "PRE_COMPUTE",
    onEnable: (swarm) => {
      swarm.emit('LOAD_BIFURCATION_TABLES'); 
      swarm.emit('SET_LEDGER_RESOLUTION', 'HIGH');
    }
  },

  // Balanced: The "Catalytic" sweet spot
  balanced: {
    label: "DAILY_FLOW",
    resonanceFrequency: 1000, // 1s ticks
    tmto: "CATALYTIC_XOR", 
    onEnable: (swarm) => {
      swarm.emit('USE_CATALYTIC_WORKSPACE');
      swarm.emit('SET_LEDGER_RESOLUTION', 'MED');
    }
  },

  // Eco: Trading Time for Space
  eco: {
    label: "RECOVERY_SLEEP",
    resonanceFrequency: 60000, // 1m ticks or event-driven
    tmto: "RE_COMPUTE_ON_DEMAND",
    onEnable: (swarm) => {
      swarm.emit('FLUSH_ALL_NON_ESSENTIAL_RAM');
      swarm.emit('SET_LEDGER_RESOLUTION', 'SUMMARY_ONLY');
    }
  }
};

/**
 * Bee's Automatic Gearbox
 * Monitors Peer E-Value and Device Battery
 */
export function autoSwitchProfile(peerData, bee) {
  const { eValue, battery, isCharging } = peerData;

  if (eValue > 8 && (battery > 0.2 || isCharging)) {
    return CatalystProfiles.performance;
  } 
  
  if (battery < 0.15 && !isCharging) {
    return CatalystProfiles.eco;
  }

  return CatalystProfiles.balanced;
}