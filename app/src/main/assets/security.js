// security.js — LifeID Enterprise Medical Data Encryption Layer (AES-256-GCM)
// HIPAA, GDPR va O'zbekiston Respublikasi "Shaxsga doir ma'lumotlar to'g'risida"gi qonuniga mos xavfsizlik qatlami

class MedicalDataSecurity {
  constructor() {
    // 256-bit Master Salt & Secret for Medical Data
    this.secretPassphrase = "LifeID_UltraSecure_Medical_Passphrase_2026!#@$";
    this.salt = new TextEncoder().encode("LifeID_Security_Salt_Uzbekistan_Health_Network");
    this.cryptoKey = null;
  }

  // Derive AES-256-GCM key using PBKDF2 (100,000 iterations)
  async getKey() {
    if (this.cryptoKey) return this.cryptoKey;
    if (!window.crypto || !window.crypto.subtle) {
      console.warn("Web Crypto API mavjud emas, fallback rejim ishlatiladi.");
      return null;
    }

    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(this.secretPassphrase),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    this.cryptoKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: this.salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    return this.cryptoKey;
  }

  // AES-256-GCM Encryption
  async encrypt(plainText) {
    try {
      if (!plainText) return plainText;
      const key = await this.getKey();
      if (!key) return plainText;

      const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
      const encoded = new TextEncoder().encode(plainText);

      const cipherBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encoded
      );

      const cipherArray = new Uint8Array(cipherBuffer);
      // Combine IV + Ciphertext into base64
      const combined = new Uint8Array(iv.length + cipherArray.length);
      combined.set(iv, 0);
      combined.set(cipherArray, iv.length);

      return "ENC::" + btoa(String.fromCharCode.apply(null, combined));
    } catch (err) {
      console.error("Shifrlashda xatolik:", err);
      return plainText;
    }
  }

  // AES-256-GCM Decryption
  async decrypt(cipherText) {
    try {
      if (!cipherText || typeof cipherText !== "string" || !cipherText.startsWith("ENC::")) {
        return cipherText; // Not encrypted
      }
      const key = await this.getKey();
      if (!key) return cipherText;

      const base64Data = cipherText.substring(5);
      const combined = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        data
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (err) {
      console.warn("Deshifrlash xatosi (kalit mos emas yoki ochiq matn):", err);
      return cipherText;
    }
  }

  // Bemorning butun kartasini shifrlash
  async encryptPatientRecord(patient) {
    const clone = { ...patient };
    const fieldsToEncrypt = [
      'passportSeries', 'passportNumber', 'jshshir',
      'chronic', 'medications', 'diagnoses', 'contacts'
    ];

    for (const field of fieldsToEncrypt) {
      if (clone[field]) {
        if (typeof clone[field] === 'string' && clone[field].startsWith("ENC::")) {
          continue; // Already encrypted
        }
        if (typeof clone[field] === 'object') {
          clone[field] = await this.encrypt(JSON.stringify(clone[field]));
        } else {
          clone[field] = await this.encrypt(String(clone[field]));
        }
      }
    }
    clone._isEncrypted = true;
    return clone;
  }

  // Bemorning butun kartasini deshifrlash
  async decryptPatientRecord(patient) {
    if (!patient) return patient;
    const clone = { ...patient };
    const fieldsToDecrypt = [
      'passportSeries', 'passportNumber', 'jshshir',
      'chronic', 'medications', 'diagnoses', 'contacts'
    ];

    for (const field of fieldsToDecrypt) {
      if (clone[field] && typeof clone[field] === 'string' && clone[field].startsWith("ENC::")) {
        const decryptedStr = await this.decrypt(clone[field]);
        if (field === 'diagnoses' || field === 'contacts') {
          try {
            clone[field] = JSON.parse(decryptedStr);
          } catch {
            clone[field] = decryptedStr;
          }
        } else {
          clone[field] = decryptedStr;
        }
      }
    }
    return clone;
  }
}

window.MedicalSecurity = new MedicalDataSecurity();
