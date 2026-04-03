export const Teach = {
  name: "teach",

  async execute(instruction, currentContext) {
    // 1. ANALYZE: Use the small LLM to parse the "Human Intent"
    const intent = await this.parseInstruction(instruction);

    // 2. BIND: Map the semantic term to a WASM variable
    const binding = {
      term: intent.subject,       // "heavy"
      variable: intent.target,    // "fluid_density"
      confidence: 1.0             // Peer-vouched truth
    };

    // 3. PERSIST: Save to the 'Sovereign Mirror' in Hyperbee
    await Memory.saveBinding(currentContext.constraint, binding);
    
    // 4. IGNITE: Immediately update the active resonAgents
    await TrinityManager.refreshWeights(binding);
    
    return `[Bee] Understood. I have linked '${binding.term}' to the ${binding.variable} physics variable.`;
  }
};