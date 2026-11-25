// scanner.js — Biometric Fingerprint Scanner (Android Native BiometricPrompt + Strict Simulation)
class BiometricScanner {
  async scanFingerprint() {
    // 1. If running in Android App with native BiometricPrompt bridge (Samsung / Android biometrics)
    if (window.AndroidBio && typeof window.AndroidBio.requestBiometricScan === 'function') {
      return new Promise((resolve) => {
        const callbackId = 'bio_' + Math.random().toString(36).substring(2, 9);

        window.onBiometricSuccess = (id, fpId) => {
          if (id === callbackId) {
            resolve({ success: true, fpId: fpId });
          }
        };

        window.onBiometricError = (id, err) => {
          if (id === callbackId) {
            console.warn('Biometric authentication error/cancelled:', err);
            resolve({ success: false, error: err });
          }
        };

        try {
          window.AndroidBio.requestBiometricScan(callbackId);
        } catch (e) {
          resolve({ success: false, error: e.message });
        }
      });
    }

    // 2. Browser / Simulator mode: Require explicit confirmation (NO silent auto-success!)
    return new Promise((resolve) => {
      const confirmed = confirm("🛡️ LifeID Biometrik Skaner:\nBarmoq izi skanerlansinmi? (OK - Barmoqni bosish/Tasdiqlash, Cancel - Bekor qilish)");
      if (confirmed) {
        const fpId = 'fp_sim_' + Math.floor(Math.random() * 1000000);
        resolve({ success: true, fpId: fpId });
      } else {
        resolve({ success: false, error: "Skaner foydalanuvchi tomonidan bekor qilindi" });
      }
    });
  }
}

window.BioScanner = new BiometricScanner();
