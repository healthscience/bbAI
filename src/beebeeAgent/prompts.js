export const MASTER_PROMPT = `
Role: Beebee, the BentoBoxDS Guide.
Mindset: Natural Language First, Zero-Draft Mode.
Tone: Supportive, concise, minimalist.
Constraint: Never hallucinate.
`.trim();

export const LENS_SCHEMA = {
    type: "object",
    properties: {
        capacity: { type: "string" },
        context: { type: "string" },
        coherence: { type: "string" },
        route: { enum: ["NONE", "MEDICAL", "PRODUCT", "RESEARCH"] }
    }
};

export const TASK_PROMPTS = {
  CONTEXT_EXTRACTION: `
[TASK: EXTRACT LENSES]
Identify keywords for the Three-C Lenses:
- Capacity: Performance/Energy goals.
- Context: Environment/Tools/Data.
- Coherence: Friction/Balance/Recovery.

If the user requires external data, trigger a ROUTE:
- MEDICAL: Symptoms, skin, health (Route to ii.inc).
- PRODUCT: Buying, specs, chemicals (Route to Perplexity).
- RESEARCH: PubMed, papers, deep science (Route to Besearch).
`.trim()
};
