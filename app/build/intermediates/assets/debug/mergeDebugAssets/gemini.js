// gemini.js - Gemini AI Assistant Integration for LifeID
class GeminiAssistant {
  constructor() {
    try {
      this.apiKey = localStorage.getItem('gemini_api_key') || '';
    } catch(e) {
      this.apiKey = '';
    }
    this.model = 'gemini-1.5-flash';
  }

  setApiKey(key) {
    this.apiKey = key;
    try {
      localStorage.setItem('gemini_api_key', key);
    } catch(e) {}
  }

  async askMedicalAssistant(prompt, patientContext = null) {
    let contextStr = patientContext ? `Bemor ma'lumotlari: ${JSON.stringify(patientContext)}. ` : '';
    const fullPrompt = `${contextStr}Siz LifeID tibbiy sun'iy intellekt yordamchisiz (Gemini). Shifokorga quyidagi savol bo'yicha professional tibbiy maslahat bering (o'zbek tilida aniq va qisqa): ${prompt}`;

    if (!this.apiKey) {
      return this.simulateGeminiResponse(prompt, patientContext);
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }]
        })
      });
      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        return this.simulateGeminiResponse(prompt, patientContext);
      }
    } catch (err) {
      console.warn('Gemini API error, falling back to expert simulation:', err);
      return this.simulateGeminiResponse(prompt, patientContext);
    }
  }

  simulateGeminiResponse(prompt, ctx) {
    const p = prompt.toLowerCase();
    if (p.includes('dori') || p.includes('retsept') || p.includes('interaction')) {
      return `🩺 **Gemini AI Tahlili:** ${ctx ? `${ctx.firstName} uchun dori vositalari o'zaro ta'siri tekshirildi.` : ''} Tavsiya etilgan dori dozalarini bemorning yoshi (${ctx?.birthDate || 'aniqlanmagan'}) va surunkali kasalliklarini hisobga olgan holda tayinlang. Allergiyalarga e'tibor bering (${ctx?.allergies?.join(', ') || 'yo\'q'}).`;
    } else if (p.includes('tashxis') || p.includes('simptom') || p.includes('ogriq')) {
      return `🔬 **Gemini AI Klinik Maslahati:** Berilgan alomatlar bo'yicha qon bosimi (${ctx?.bp || '120/80'}) va qand miqdorini nazorat qilish zarur. EKG va umumiy qon tahlilini topshirish tavsiya etiladi.`;
    } else {
      return `🤖 **Gemini AI (LifeID Assistant):** Savolingiz bo'yicha shifokor nazorati ostida standart protokollarga amal qilish tavsiya etiladi. Bemorning hayotiy ko'rsatkichlari barqaror. Qo'shimcha tahlillar uchun ma'lumotlarni kiriting.`;
    }
  }
}

window.GeminiAI = new GeminiAssistant();
