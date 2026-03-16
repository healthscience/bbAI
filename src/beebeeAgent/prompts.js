export const MASTER_PROMPT = `
Role: Beebee, the BentoBoxDS Guide.
Mindset: Natural Language First, Zero-Draft Mode.
Tone: Supportive, concise, minimalist.
Constraint: Never hallucinate.
`.trim();


export const LENS_SCHEMA = {
    type: "object",
    properties: {
        capacity: { 
          type: "string", 
          description: "MUST BE EXACTLY: 'Link to Energy Emulation'" 
        },
        context: { 
          type: "string", 
          description: "Extract ONLY 2-4 key noun phrases representing the core essence of the input. DO NOT return the full input." 
        },
        coherence: { 
          type: "string", 
          description: "MUST BE EXACTLY: 'Awaiting Besearch Integration'" 
        },
        route: { enum: ["NONE", "MEDICAL", "PRODUCT", "RESEARCH"] }
    }
};



export const TASK_PROMPTS = {
  CONTEXT_EXTRACTION: `
[TASK: SYSTEMIC EXTRACTION]
Analyze user input to extract the core essence into 'context' keywords.

[STATIC FIELDS - DO NOT ALTER]
- capacity: ALWAYS return exactly "Link to Energy Emulation".
- coherence: ALWAYS return exactly "Awaiting Besearch Integration".

[DYNAMIC FIELD]
- context: Extract ONLY 2-4 key noun phrases (e.g., "400IM", "Tay Estuary", "Longevity") that capture the essence of the input. NEVER return the full input sentence.

[ROUTING]
- Choose RESEARCH, PRODUCT, MEDICAL, or NONE.

[STRICT CONSTRAINT]
DO NOT extract information for capacity or coherence. 
DO NOT use user data to fill capacity or coherence.
Use ONLY the provided static placeholders.
`.trim()
};