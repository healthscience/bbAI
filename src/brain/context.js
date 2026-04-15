/**
 * bbAI: Context Manager
 * Role: The "Nervous System" that identifies the Peer's current Story/State.
 */

let currentContext = {
  constraint: 'idle',
  eValue: 0.1, // Metabolic Energy Usage (0.0 to 1.0)
  intent: 'waiting',
  wiring: null
};

/**
 * Initializes the context with the global wiring (Holepunch/HOP network)
 */
export const initializeContext = (wiringIn) => {
  currentContext.wiring = wiringIn;
  console.log('[Bee] Context initialized with wiring');
};

export const getContext = () => {
  // 1. Sync with the Life-Strap (safeFLOW)
  // If heart rate is high and motion is rhythmic, infer "High Intensity"
  
  // Use initialized wiring if available, otherwise fallback to safeFLOW import
  const provider = currentContext.wiring;
  const biomarkers = provider.getLatest ? provider.getLatest() : { heartRate: 0 };
  
  if (biomarkers.heartRate > 140) {
    currentContext.eValue = 0.85; // Prioritize local physics!
  } else {
    currentContext.eValue = 0.2;  // Open the valve for the network
  }

  return currentContext;
};

export const setContext = (newStory) => {
  // Called when a Peer enters a new Story in BentoBoxDS
  // Example: "Starting my 400IM swim"
  currentContext.constraint = newStory.constraint;
  currentContext.intent = newStory.intent;
  
  console.log(`[Bee] Context Shift: ${currentContext.constraint}`);
};


export const ContextManager = {
  /**
   * Called by the resonAgent Messenger
   * @param {Object} report - { resonance, inferredState, intensity }
   */
  handleAgentReport(report) {
    currentContext.eValue = report.intensity;
    currentContext.lastAgentUpdate = Date.now();
    
    // If the agent detects a 'Stroke Change' (e.g. Fly to Back)
    // we trigger the next Cue Contract in the sequence.
    if (report.event === 'STATE_TRANSITION') {
      console.log(`[Bee] resonAgent detected shift to: ${report.inferredState}`);
      this.triggerHandover(report.inferredState);
    }
  },

  getContext() {
    return currentContext;
  }
};
