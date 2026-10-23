// scanner.js - Biometric Fingerprint Scanner (WebAuthn + Simulator)
class BiometricScanner {
  async scanFingerprint() {
    if (window.PublicKeyCredential && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (available) {
        try {
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);
          const credential = await navigator.credentials.create({
            publicKey: {
              challenge: challenge,
              rp: { name: "LifeID Medical Portal", id: window.location.hostname },
              user: {
                id: Uint8Array.from("LifeIDPatient", c => c.charCodeAt(0)),
                name: "patient@lifeid.uz",
                displayName: "LifeID Bemor"
              },
              pubKeyCredParams: [{ alg: -7, type: "public-key" }],
              authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
              timeout: 60000
            }
          });
          if (credential) {
            return { success: true, fpId: 'fp_auth_' + Math.random().toString(36).substring(2, 9) };
          }
        } catch (e) {
          console.log('WebAuthn cancelled or fallback used:', e);
        }
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const fpId = 'fp_sim_' + Math.floor(Math.random() * 1000000);
        resolve({ success: true, fpId: fpId });
      }, 2000);
    });
  }
}

window.BioScanner = new BiometricScanner();
