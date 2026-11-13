# LifeID — Texnik Himoya va Oraliq Nazorat Uchun Savol-Javoblar Qo'llanmasi

Ushbu qo'llanma **LifeID Doctor Portal & Shoshilinch Tibbiy Tizim** loyihangiz bo'yicha oraliq nazorat va loyiha himoyasida berilishi mumkin bo'lgan eng asosiy texnik savollar va ularning professional javoblarini o'z ichiga oladi.

---

## 1. Loyiha Arxitekturasi va Maqsadi

### Q1: LifeID loyihasining asosiy vazifasi va arxitekturasi qanday?
* **Javob:**
  LifeID — favqulodda vaziyatlarda (masalan, hushsiz yoki og'ir ahvoldagi bemorlar kelganda) shifokorlarga 2 soniya ichida bemorning qon guruhi, o'ta xavfli allergiyalari va shoshilinch tibbiy kartasini aniqlash imkonini beruvchi raqamli tibbiy identifikatsiya tizimidir.
  **Arxitekturasi:**
  * **Frontend & Mobile:** Android Native (`MainActivity.kt` va `WebView`) + HTML5 / CSS3 / JavaScript (SPA arxitekturasi).
  * **Database & Cloud Sync:** Lokal shifrlangan ma'lumotlar bazasi (`IndexedDB`) + **Firebase Realtime Database** orqali bulutli sinxronizatsiya.
  * **Admin Web Dashboard:** `admin.html` (alohida xavfsiz web portal) — shifokorlar va bemorlar bazasini markaziy boshqarish uchun.

---

## 2. Mobil Ilova va WebView Integratsiyasi

### Q2: Nima uchun loyiha to'liq nativ (Kotlin/Compose) emas, balki WebView + Web Tech asosida qilindi?
* **Javob:**
  1. **Tezkorlik va Kross-platforma:** Tibbiy portal bir vaqtning o'zida Android mobil ilovasi, Telegram Mini App va Web brauzerda bir xil dizayn va mantiq bilan ishlashi kerak.
  2. **Interfeys moslashuvchanligi:** HTML/CSS yordamida shoshilinch tez yordam kartalari, qon guruhi nishonlari va rangli ogohlantirish bannerlarini juda tez va mukammal yaratish mumkin.
  3. **Nativ ko'prik (JavaScript Interface):** Android qurilmalarining apparat imkoniyatlari (kamera, telefon qo'ng'irog'i, biometrik barmoq izi sensorlari) `@JavascriptInterface` orqali to'g'ridan-to'g'ri JavaScriptga bog'langan.

---

## 3. Bulutli Ma'lumotlar Bazasi va Firebase

### Q3: Ilovada kiritilgan bemor ma'lumotlari va qo'shilgan tashxislar qanday saqlanadi va Admin panelga qanday yetib boradi?
* **Javob:**
  Tizim **Double-Sync (Ikki tomonlama sinxronizatsiya)** arxitekturasidan foydalanadi:
  1. **Cloud Backend (Firebase Realtime Database REST API):** Bemor ro'yxatdan o'tganda (`registerPatient`) yoki shifokor yangi tashxis qo'shganda (`savePatient`), ma'lumot `https://lifeid-doctor-default-rtdb.firebaseio.com/patients.json` manziliga REST API (`POST` / `PUT`) orqali real vaqt rejimida bulutga yuboriladi.
  2. **Offline Fallback (IndexedDB):** Internet bo'lmagan sharoitda lokal shifrlangan `IndexedDB` bazasiga saqlanadi va tarmoq tiklanganda sinxronlashadi.
  3. **Admin Panel:** `admin.html` ham to'g'ridan-to'g'ri shu Firebase bazasidan ma'lumotlarni o'qib olgani uchun, ilovada qilingan har qanday o'zgarish Admin panelda darhol ko'rinadi.

---

## 4. Biometrik Xavfsizlik va Barmoq Izi Skaneri

### Q4: Barmoq izi skaneri (Atpechatka) qanday ishlaydi va Samsung telefonlari sensorlari bilan qanday integratsiya qilingan?
* **Javob:**
  Standart veb-brauzerlarda barmoq izi cheklangan bo'lsa, biz Android nativ darajasida **`androidx.biometric.BiometricPrompt`** API dan foydalandik:
  1. `MainActivity.kt` ichida `WebAppInterface` klassi yaratilgan va u `@JavascriptInterface` yordamida `AndroidBio` nomi bilan JavaScriptga ochib berilgan.
  2. Skaner tugmasi bosilganda `BiometricManager` qurilmada biometriya mavjudligini tekshiradi (`BIOMETRIC_STRONG` yoki `BIOMETRIC_WEAK`) va Androidning o'zining xavfsiz **BiometricPrompt** oynasini ochadi (bu Samsung va barcha Android telefonlarning orqa yoki ekrandagi barmoq izi sensorlari bilan to'g'ridan-to'g'ri ishlaydi).
  3. Barmoq izi muvaffaqiyatli o'qilganda `onAuthenticationSucceeded` callback ishga tushib, JavaScriptga noyob biometrik token (`fpId`) qaytaradi.

---

## 5. Xavfsizlik, Validatsiyalar va Ma'lumotlar Gigiyenasi

### Q5: Forma validatsiyalari va kiritish qoliplari (Input Masks) qanday himoyalangan?
* **Javob:**
  Tizimda foydalanuvchi xatolarining oldini olish uchun qattiq qoidalar o'rnatilgan:
  * **JSHSHIR (PINFL):** Faqat raqamlardan iborat bo'lishi va aynan **14 ta raqam** bo'lishi shart (`/^[0-9]{14}$/`). Harf yoki boshqa belgilar kiritish `oninput` filtrlari orqali avtomatik bloklanadi.
  * **Pasport Seriya va Raqam:** Seriya 2 ta bosh harf (`/^[A-Z]{2}$/`), raqami esa 7 ta raqam (`/^[0-9]{7}$/`) bo'lishi tekshiriladi.
  * **Telefon Raqam:** O'zbekiston formati bo'yicha qat'iy talab qilinadi (`+998` bilan boshlanuvchi 9 ta raqam).
  * **Qon Bosimi:** Standart `120/80` formatida kiritilishi majburiy.

---

## 6. Admin Panel va Shifokorlar Nazorati

### Q6: Admin panel va shifokorlar avtorizatsiyasi qanday tashkil etilgan?
* **Javob:**
  * **Alohida Web Portal (`admin.html`):** Admin panel mobil ilovadan alohida xavfsiz web sahifa sifatida ishlaydi.
  * **Shifokorlar Nazorati:** Admin panelda maxsus **"Ruxsat Etilgan Shifokorlar"** bo'limi mavjud bo'lib, admin faqat o'zi ro'yxatdan o'tkazgan shifokorlargagina (Ism-Familiya, mutaxassislik, shifoxona va PIN kod) ilovaga kirish huquqini beradi.
  * Mobil ilovaga kirishda shifokor kiritgan ma'lumotlar bazadagi ruxsatlar ro'yxati bilan solishtiriladi. Ruxsati yo'q shifokorlar tizimga kira olmaydi. Standart admin paroli esa `7777`.
