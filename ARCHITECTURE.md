# LifeID — Texnik Rahbar (Frontend & Ekotizim Integratsiyasi) Arxitektura Hujjati

Loyiha: Qon quyish bo'limlari va favqulodda tibbiy yordam uchun raqamli tibbiy identifikatsiya tizimi.  
Jamoa: 
- **Ma'murjonova Madinabonu** (Rahbar, Veb va Backend / Muslima API)
- **Ishanbayeva Mubinabonu** (Mobil ilova & AI Modul / Mubina AI)
- **Axtamova Muslimaxon** (Telegram Mini App va Bot / Muslima API & TMA)

---

## 1. Tizim Arxierturasi va Texnologik Stek

### A. Shifokorlar Ilovasi (React Native / Flutter / Android Native)
*   **Maqsad:** Tez yordam va qon quyish bo'limlari shifokorlari uchun o'ta tezkor ishlash interfeysi.
*   **Asosiy imkoniyatlar:** 
    *   USB OTG orqali barmoq izi skanerlari bilan to'g'ridan-to'g'ri integratsiya.
    *   Offline rejim (SQLite / Room DB) — internet bo'lmaganda ham bemor kartasini ochish va keshdan qidirish.
    *   Favqulodda skanerlash (2 soniyada bemor allergiyasi va qon guruhini ko'rsatish).
*   **Texnologiya:** React Native (TypeScript) yoki Flutter (Dart) — cross-platform imkoniyati va USB OTG drayver kutubxonalari mavjudligi uchun tanlangan.

### B. Bemorlar uchun Telegram Mini App (React.js / Vue.js)
*   **Maqsad:** Bemor o'z profili, dori eslatmalari va donor qidirishi uchun ixcham interfeys.
*   **Texnologiya:** React.js + Tailwind CSS + `Telegram.WebApp` SDK.
*   **Asosiy ekranlar:**
    *   Bemor profili va QR / Karta kodi.
    *   Dori eslatmalari (Push / Bildirishnoma vaqtini sozlash).
    *   Donor qidirish (Qon guruhi va hudud bo'yicha filter).

---

## 2. Backend API Integratsiyasi (Muslima Backend)

Muslima taqdim etadigan umumiy backend API so'rovlarini frontend interfeyslariga ulash quyidagi standart strukturada amalga oshiriladi:

### Asosiy Endpointlar (Base URL: `https://api.lifeid.uz/v1/`)

1. **Shifokor Avtorizatsiyasi:**
   - `POST /auth/doctor/login`
   - *Payload:* `{ "doctorId": "...", "pin": "..." }`
   - *Response:* `{ "token": "JWT_TOKEN", "doctor": { ... } }`

2. **Bemor Kiritish (4 qadam):**
   - `POST /patients/register`
   - *Payload:* Shaxsiy ma'lumotlar, tibbiy ko'rsatkichlar, allergiyalar, kontaktlar va barmoq izi xeshi.

3. **Favqulodda Skanerlash (Barmoq izi bo'yicha):**
   - `GET /patients/scan?fingerprint_hash={hash}`
   - *Response:* Bemorning hayotiy muhim kartasi (Qon guruhi, o'ta xavfli allergiyalar, surunkali kasalliklar).

4. **Donor Qidirish:**
   - `GET /donors?blood_group={bg}&region={region}`

---

## 3. AI Modul Integratsiyasi (Mubinaning AI Moduli)

Mubina tomonidan yaratilgan **Gemini AI Dori Xavfsizligi Moduli**dan keladigan javoblarni shifokor va bemor ekranlarida to'g'ri ko'rsatish logikasi:

- **API So'rov (Dori va Allergiya tahlili):**
  - `POST /ai/check-drug`
  - *Payload:*
    ```json
    {
      "patient_id": "12345",
      "drug_name": "Aspirin",
      "allergies": ["Penitsillin", "Aspirin"],
      "active_diagnoses": ["Bronxial astma"]
    }
    ```
- **AI Javobini Frontend da ko'rsatish:**
  - Agar `risk_level == "HIGH"` bo'lsa ➔ Qizil banner va ogohlantirish modal oynasi chiqadi (`"Diqqat! Bemor bu doriga allergiyasi bor!"`).
  - Agar `risk_level == "SAFE"` bo'lsa ➔ Yashil tasdiq belgisi bilan dori xavfsizligi tasdiqlanadi.

---

## 4. Keraksiz Fayllarni Tozalash
Loyiha papkasidan barcha eskirgan Python bot skriptlari (`bot.py`) va ortiqcha vaqtinchalik fayllar tozalanib, faqat **Frontend**, **Android app**, **Vercel/Netlify** va **Texnik arxitektura** fayllari qoldirildi.
