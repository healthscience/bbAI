/**
 * Skill: Altruism Handler
 * Decides whether to perform a heavy 'Full Challenge' or a light 'Signature Verification'.
 */
export const AltruismHandler = {
  async onIncomingRequest(request, valveAperture) {
    // If the valve is closed, we ignore the request entirely to save CPU.
    if (valveAperture === 0) return null;

    if (request.type === 'PROVE_PHYSICS') {
      // If we have low aperture, we don't do the heavy math.
      // Instead, we see if we have a PRE-SIGNED proof in our Hyperbee.
      if (valveAperture < 0.3) {
        const existingProof = await Memory.getProof(request.constraint);
        if (existingProof) {
          return {
            type: 'RELAYED_PROOF',
            data: existingProof,
            note: "Relayed via Sovereign Peer - Verified by Root Peer 1"
          };
        }
        return null; // Too heavy to compute right now, and no relay available.
      }
      
      // If aperture is high, we perform the full challenge for the new peer.
      return await this.performFullChallenge(request);
    }
  }
};