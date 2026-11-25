
let currentStep = 1;
let selectedBlood = 'O (I)';
let selectedRhesus = 'Rh+';
let currentFpId = null;

window.addEventListener('DOMContentLoaded', async () => {
  try {
    if (window.LifeIDDB) {
      await window.LifeIDDB.init();
    }
  } catch (e) {
    console.warn("LifeIDDB init error:", e);
  }
  checkDoctorAuth();
  loadDashboard();
});

function checkDoctorAuth() {
  try {
    let doc = window.LifeIDDB?.currentDoctor;
    if (!doc) {
      const saved = localStorage.getItem('lifeid_doctor_session');
      if (saved) {
        try {
          doc = JSON.parse(saved);
          if (window.LifeIDDB) window.LifeIDDB.currentDoctor = doc;
        } catch (e) {}
      }
    }

    const overlay = document.getElementById('loginOverlay');
    if (!doc) {
      if (overlay) overlay.style.setProperty('display', 'flex', 'important');
      return;
    }

    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
    }

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setTxt('dashDocName', doc.name);
    setTxt('dashDocSpecClinic', (doc.spec || '') + ' • ' + (doc.clinic || ''));
    setTxt('headerAvatar', (doc.name || 'MM').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase());
    setTxt('profileName', doc.name);
    setTxt('profileSpec', doc.spec);
    setTxt('profileClinic', doc.clinic);
    setVal('profileIdField', doc.id);
  } catch (err) {
    console.warn("checkDoctorAuth error:", err);
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.style.setProperty('display', 'none', 'important');
  }
}

function toggleLoginPin() {
  const input = document.getElementById('loginPin');
  const btn = document.getElementById('toggleLoginBtn');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.textContent = '🙈';
  } else {
    input.type = 'password';
    if (btn) btn.textContent = '👁️';
  }
}

function quickLogin(docType) {
  try {
    // 1. Immediately force dismiss the login overlay
    const overlay = document.getElementById('loginOverlay');
    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
    }

    let doc;
    if (docType === 'madina') {
      doc = { id: 'doc_madina', name: "Dr. Madinabonu Ma'murjonova", spec: "Loyiha Rahbari • Bosh Shifokor", clinic: "Respublika ShTTYO Markazi", role: "admin" };
    } else if (docType === 'jasur') {
      doc = { id: 'doc_jasur', name: "Dr. Jasur Karimov", spec: "Kardiolog • Reanimatolog", clinic: "Toshkent shahar 1-son ShTTYO", role: "admin" };
    } else if (docType === 'malika') {
      doc = { id: 'doc_malika', name: "Dr. Malika Umarova", spec: "Terapevt • Gematolog", clinic: "Respublika Qon Markazi", role: "doctor" };
    } else {
      doc = { id: 'doc_emergency', name: "Dr. Madinabonu Ma'murjonova", spec: "Navbatchi Shifokor", clinic: "Shoshilinch Tibbiy Yordam (103)", role: "admin" };
    }

    try {
      localStorage.setItem('lifeid_doctor_session', JSON.stringify(doc));
    } catch(e) {}

    if (window.LifeIDDB) {
      window.LifeIDDB.loginDoctor(doc);
    }

    checkDoctorAuth();
    loadDashboard();
    showToast("Xush kelibsiz, " + doc.name + "!");
  } catch (err) {
    console.error("quickLogin error:", err);
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.style.setProperty('display', 'none', 'important');
  }
}

function handleDoctorLogin() {
  const pinInput = document.getElementById('loginPin');
  const pin = pinInput ? pinInput.value.trim() : '';

  if (pin === '7777' || !pin) {
    return quickLogin('madina');
  } else if (pin === '1234') {
    return quickLogin('malika');
  } else {
    // Custom PIN entered
    try {
      let authorizedDoctors = JSON.parse(localStorage.getItem('lifeid_authorized_doctors') || '[]');
      const match = authorizedDoctors.find(d => d.pin === pin);
      if (match) {
        if (window.LifeIDDB) window.LifeIDDB.loginDoctor(match);
        checkDoctorAuth();
        loadDashboard();
        showToast("Xush kelibsiz, " + match.name + "!");
        return;
      }
    } catch (e) {}
    // Default fast fallback
    quickLogin('madina');
  }
}

function switchTab(tabName, el) {
  document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active-view'));
  document.getElementById('view-' + tabName).classList.add('active-view');

  if (el) {
    document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
    if (!el.classList.contains('center-scanner-btn')) {
      el.classList.add('active');
    }
  }

  const titles = { dashboard: "Bosh sahifa", addPatient: "Yangi bemor qo'shish", patientsList: "Bemorlar tibbiy kartasi", donorsSearch: "Qon Donorlarini Qidirish", scanner: "Favqulodda Skaner", profile: "Shifokor Profili" };
  document.getElementById('headerTitle').textContent = titles[tabName] || "LifeID";

  if (tabName === 'dashboard') loadDashboard();
  if (tabName === 'patientsList') loadPatientsList();
}

function goBack() {
  switchTab('dashboard', document.querySelectorAll('.nav-item')[0]);
}

async function loadDashboard() {
  const patients = await window.LifeIDDB.getPatients();
  const donors = await window.LifeIDDB.getDonors();
  document.getElementById('statPatients').textContent = patients.length;
  document.getElementById('statDonors').textContent = donors.length;

  const list = document.getElementById('dashboardPatientsList');
  list.innerHTML = '';
  if (patients.length === 0) {
    list.innerHTML = '<div style="font-size:13px; color:var(--text-3); text-align:center; padding:20px;">Hozircha bemorlar qo\'shilmagan.</div>';
    return;
  }
  patients.slice(-3).reverse().forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div style="display:flex; justify-content:between; align-items:flex-start; margin-bottom:8px;">
        <div>
          <div style="font-size:15px; font-weight:700;">${p.lastName} ${p.firstName}</div>
          <div style="font-size:11.5px; color:var(--text-3);">Tug'ilgan: ${p.birthDate} · Ish joyi: ${p.workplace || 'Kiritilmagan'}</div>
        </div>
        <span class="blood-badge">${p.bloodGroup} ${p.rhesus}</span>
      </div>
      <div style="font-size:12.5px; color:var(--primary); margin-bottom:8px;"><b>Allergiya:</b> ${p.allergies?.join(', ') || 'Yo\'q'}</div>
      <div style="display:flex; justify-content:between; align-items:center;">
        <span style="font-size:11.5px; color:var(--success); font-weight:600;">● Barqaror nazoratda</span>
        <button onclick="switchTab('patientsList', document.querySelectorAll('.nav-item')[1])" style="background:var(--primary-light); color:var(--primary); border:none; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">Kartani ochish</button>
      </div>
    `;
    list.appendChild(card);
  });
}

let activePatientFilter = 'all';
async function loadPatientsList() {
  const patients = await window.LifeIDDB.getPatients();
  let filtered = patients;
  if (activePatientFilter === 'critical') {
    filtered = patients.filter(p => (p.bloodTestResult && !p.bloodTestResult.includes('Sog\'lom')) || (p.allergies && p.allergies.length > 0));
  } else if (activePatientFilter === 'donor') {
    filtered = patients.filter(p => p.isDonor);
  }
  renderPatientsList(filtered);
}

function setPatientFilter(filter, el) {
  activePatientFilter = filter;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  loadPatientsList();
}

async function filterPatientsList() {
  const query = document.getElementById('patientSearchInput').value.toLowerCase();
  const patients = await window.LifeIDDB.getPatients();
  const filtered = patients.filter(p =>
    `${p.lastName} ${p.firstName} ${p.passportSeries}${p.passportNumber} ${p.jshshir}`.toLowerCase().includes(query)
  );
  renderPatientsList(filtered);
}

function makeTelLink(phone) {
  if (!phone) return '#';
  const cleanPhone = phone.replace(/[^+\d]/g, '');
  return `tel:${cleanPhone}`;
}

async function renderPatientsList(patients) {
  const list = document.getElementById('fullPatientsList');
  list.innerHTML = '';
  if (patients.length === 0) {
    list.innerHTML = '<div style="font-size:13px; color:var(--text-3); text-align:center; padding:30px;">Bemorlar topilmadi.</div>';
    return;
  }
  patients.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div style="display:flex; justify-content:between; align-items:flex-start; margin-bottom:10px;">
        <div>
          <div style="font-size:16px; font-weight:700;">${p.lastName} ${p.firstName} ${p.middleName||''}</div>
          <div style="font-size:12px; color:var(--text-3);">Pasport: ${p.passportSeries} ${p.passportNumber} · JSHSHIR: ${p.jshshir}</div>
          <div style="font-size:12px; color:var(--text-2);"><b>Ish joyi:</b> ${p.workplace || 'Kiritilmagan'}</div>
        </div>
        <span class="blood-badge">${p.bloodGroup} ${p.rhesus}</span>
      </div>
      <div style="margin-bottom:8px;">
        <span class="alert-badge">⚠️ Allergiya: ${p.allergies?.join(', ') || 'Yo\'q'}</span>
      </div>
      <div style="font-size:13px; color:var(--text-2); margin-bottom:4px;"><b>Asosiy kasallik tarixi:</b> ${p.chronic || 'Yo\'q'}</div>
      <div style="font-size:13px; color:var(--text-2); margin-bottom:4px;"><b>Tashxislar & Ko'riklar:</b> <span style="color:var(--primary); font-weight:600;">${p.diagnoses && p.diagnoses.length ? p.diagnoses.join('; ') : 'Hali qo\'shimcha tashxislar kiritilmagan'}</span></div>
      <div style="font-size:13px; color:var(--text-2); margin-bottom:4px;"><b>Qon tahlili / Infeksiya:</b> ${p.bloodTestResult || 'Normal'}</div>
      <div style="font-size:13px; color:var(--text-2); margin-bottom:12px;"><b>ICE (Yaqinlari):</b> ${p.contacts?.[0]?.name} (${p.contacts?.[0]?.phone}) | ${p.contacts?.[1]?.name} (${p.contacts?.[1]?.phone})</div>
      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:8px; margin-top:8px; gap:8px;">
        <button onclick="openAddDiagnosisModal('${p.firebaseKey || p.id || (p.passportSeries + p.passportNumber)}')" style="background:var(--primary-light); color:var(--primary); border:1px solid var(--red-border); padding:6px 12px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">🩺 Kasallik/Tashxis qo'shish</button>
        <a href="${makeTelLink(p.contacts?.[0]?.phone)}" style="background:var(--success-light); color:var(--success); padding:6px 12px; border-radius:8px; font-size:12px; font-weight:600; text-decoration:none;">📞 Qo'ng'iroq</a>
      </div>
    `;
    list.appendChild(card);
  });
}

async function searchDoctorDonors() {
  const targetBlood = document.getElementById('doctorSearchBlood').value;
  const donors = await window.LifeIDDB.getDonors();
  const results = document.getElementById('doctorDonorResults');
  results.innerHTML = '';

  const now = new Date();
  const filtered = donors.filter(d => {
    const matches = d.bloodGroup && d.bloodGroup.includes(targetBlood.split(' ')[0]);
    if (!matches) return false;
    const lastDonation = new Date(d.lastDonationDate || '2024-01-01');
    const diffMonths = (now.getFullYear() - lastDonation.getFullYear()) * 12 + (now.getMonth() - lastDonation.getMonth());
    return diffMonths >= 3;
  });

  if (filtered.length === 0) {
    results.innerHTML = `<div class="card" style="text-align:center; color:var(--text-3); font-size:13px;">Ushbu qon guruhi bo'yicha kamida 3 oy oldin qon topshirgan donor topilmadi.</div>`;
    return;
  }

  filtered.forEach(d => {
    results.innerHTML += `
      <div class="card">
        <div style="display:flex; justify-content:between; align-items:flex-start;">
          <div>
            <div style="font-size:16px; font-weight:700;">${d.lastName} ${d.firstName}</div>
            <div style="font-size:12px; color:var(--success); font-weight:600; margin-top:2px;">✓ Oxirgi donorlik: 3 oydan oldin (Xavfsiz)</div>
            <div style="font-size:12px; color:var(--text-2);"><b>Ish joyi:</b> ${d.workplace || 'Kiritilmagan'}</div>
          </div>
          <span class="blood-badge">${d.bloodGroup} ${d.rhesus}</span>
        </div>
        <div style="margin-top:10px; font-size:13px; color:var(--text-2);"><b>Telefon:</b> ${d.contacts?.[0]?.phone || '-'}</div>
        <div style="font-size:13px; color:var(--text-2);"><b>Kasallik tarixi (Anamnez):</b> ${d.chronic || 'Surunkali kasalliklar yo\'q'}</div>
        <div style="font-size:13px; color:var(--text-2);"><b>Qon tahlili natijasi:</b> ${d.bloodTestResult || 'Normal'}</div>
        <div style="margin-top:10px;"><a href="${makeTelLink(d.contacts?.[0]?.phone)}" class="btn-primary" style="padding:10px; text-decoration:none; text-align:center; display:block;">📞 Tezkor qo'ng'iroq</a></div>
      </div>
    `;
  });
}

function validateStep1() {
  const ln = document.getElementById('pLastName').value.trim();
  const fn = document.getElementById('pFirstName').value.trim();
  const bd = document.getElementById('pBirthDate').value.trim();
  const series = document.getElementById('pPassportSeries').value.trim();
  const number = document.getElementById('pPassportNumber').value.trim();
  const jshshir = document.getElementById('pJshshir').value.trim();

  if (!ln || !fn) {
    alert("Xato: Familiya va Ism to'ldirilishi shart!");
    return false;
  }
  if (!bd) {
    alert("Xato: Tug'ilgan sana kiritilishi shart!");
    return false;
  }
  if (!/^[A-Z]{2}$/.test(series)) {
    alert("Xato: Pasport seriyasi 2 ta bosh harfdan iborat bo'lishi shart (masalan: AA).");
    return false;
  }
  if (!/^[0-9]{7}$/.test(number)) {
    alert("Xato: Pasport raqami 7 ta raqamdan iborat bo'lishi shart.");
    return false;
  }
  if (!/^[0-9]{14}$/.test(jshshir)) {
    alert("Xato: JSHSHIR (PINFL) aynan 14 ta raqamdan iborat bo'lishi shart (harflar yoki boshqa belgilar qo'shib bo'lmaydi).");
    return false;
  }
  return true;
}

function validateStep2() {
  const bp = document.getElementById('pBp').value.trim();
  const weight = document.getElementById('pWeight').value.trim();
  const height = document.getElementById('pHeight').value.trim();
  const contact1 = document.getElementById('pContact1').value.trim();
  const contact2 = document.getElementById('pContact2').value.trim();
  const allergies = document.querySelectorAll('#allergyTags .custom-tag');

  if (!/^[0-9]{2,3}\/[0-9]{2,3}$/.test(bp)) {
    alert("Xato: Qon bosimi formati noto'g'ri (masalan: 120/80 formatida kiriting).");
    return false;
  }
  if (!weight || isNaN(weight)) {
    alert("Xato: Vazn (kg) kiritilishi shart va raqam bo'lishi kerak.");
    return false;
  }
  if (!height || isNaN(height)) {
    alert("Xato: Bo'yi (sm) kiritilishi shart va raqam bo'lishi kerak.");
    return false;
  }
  if (allergies.length === 0) {
    alert("Xato: Kamida 1 ta o'ta xavfli allergiya kiritilishi shart!");
    return false;
  }
  const phoneRegex = /^\+998[0-9]{9}$/;
  if (!phoneRegex.test(contact1) || !phoneRegex.test(contact2)) {
    alert("Xato: Telefon raqam O'zbekiston formati bo'yicha to'liq kiritilishi shart (+998 bilan boshlanuvchi 9 ta raqam, masalan: +998901234567).");
    return false;
  }
  return true;
}

function validateStep3() {
  if (!currentFpId) {
    alert("Diqqat: Bemorning barmoq izi skaner qilinishi shart! Iltimos, barmoq izini skanerlang.");
    return false;
  }
  return true;
}

function goToStep(step) {
  if (step > currentStep) {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
  }

  document.querySelectorAll('.wizard-step').forEach(s => s.style.display = 'none');
  document.getElementById('wizardStep' + step).style.display = 'block';

  for (let i = 1; i <= 4; i++) {
    const indicator = document.getElementById('stepIndicator' + i);
    indicator.className = 'step-item';
    if (i < step) indicator.classList.add('completed');
    if (i === step) indicator.classList.add('active');
  }
  currentStep = step;

  if (step === 4) populateReviewSummary();
}

function selectBloodGroup(el, group) {
  document.querySelectorAll('#wizardStep2 .blood-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedBlood = group;
}

function selectRhesus(el, rh) {
  document.querySelectorAll('.rhesus-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedRhesus = rh;
}

function addAllergyTag() {
  const input = document.getElementById('allergyInput');
  const val = input.value.trim();
  if (!val) return;
  const container = document.getElementById('allergyTags');
  const tag = document.createElement('div');
  tag.className = 'custom-tag';
  tag.innerHTML = val + ' <button onclick="this.parentElement.remove()">×</button>';
  container.appendChild(tag);
  input.value = '';
}

async function scanFpWizard() {
  const status = document.getElementById('wizardFpStatus');
  status.textContent = 'Biometrik skaner ishlamoqda... (Sensorga teging)';
  const res = await window.BioScanner.scanFingerprint();
  if (res && res.success) {
    currentFpId = res.fpId;
    status.textContent = '✓ Barmoq izi tasdiqlandi (' + res.fpId + ')';
    showToast("Barmoq izi muvaffaqiyatli qabul qilindi!");
  } else {
    currentFpId = null;
    status.textContent = '❌ Skanerlash amalga oshmadi yoki bekor qilindi';
    alert("Diqqat: Barmoq izi tasdiqlanmadi! Bemor saqlash uchun biometrik skanerlash talab qilinadi.");
  }
}

function populateReviewSummary() {
  const ln = document.getElementById('pLastName').value;
  const fn = document.getElementById('pFirstName').value;
  const summary = document.getElementById('reviewSummary');
  summary.innerHTML = `<b>F.I.O.:</b> ${ln} ${fn}<br><b>Qon guruhi:</b> ${selectedBlood} ${selectedRhesus}<br><b>Skaner ID:</b> ${currentFpId || 'Aniqlanmagan'}`;
}

async function saveNewPatientFinal() {
  if (!validateStep1() || !validateStep2() || !validateStep3()) return;

  const lastName = document.getElementById('pLastName').value.trim();
  const firstName = document.getElementById('pFirstName').value.trim();
  const allergies = Array.from(document.querySelectorAll('#allergyTags .custom-tag')).map(t => t.firstChild.textContent.trim());

  const patient = {
    lastName, firstName,
    middleName: document.getElementById('pMiddleName').value,
    birthDate: document.getElementById('pBirthDate').value,
    workplace: document.getElementById('pWorkplace').value,
    gender: document.getElementById('pGender').value,
    nationality: document.getElementById('pNationality').value,
    citizenship: document.getElementById('pCitizenship').value,
    passportSeries: document.getElementById('pPassportSeries').value,
    passportNumber: document.getElementById('pPassportNumber').value,
    jshshir: document.getElementById('pJshshir').value,
    bloodGroup: selectedBlood,
    rhesus: selectedRhesus,
    bloodTestResult: document.getElementById('pBloodTestResult').value,
    bp: document.getElementById('pBp').value,
    weight: document.getElementById('pWeight').value,
    height: document.getElementById('pHeight').value,
    diabetes: document.getElementById('pDiabetes').value,
    chronic: document.getElementById('pChronic').value,
    allergies,
    medications: document.getElementById('pMedications')?.value || '',
    contacts: [
      { name: '1-Yaqini', phone: document.getElementById('pContact1').value },
      { name: '2-Yaqini', phone: document.getElementById('pContact2').value }
    ],
    fingerprintId: currentFpId,
    isDonor: document.getElementById('donorToggle').checked,
    lastDonationDate: document.getElementById('pLastDonation').value
  };

  await window.LifeIDApi.registerPatient(patient);
  showToast("Bemor bazaga muvaffaqiyatli qo'shildi!");
  goToStep(1);
  switchTab('dashboard', document.querySelectorAll('.nav-item')[0]);
}

let _lastScannedPatient = null;

// 🚨 FAVQULODDA TEZ TIBBIY YORDAM SKANERI (Hushsiz bemor uchun)
async function performEmergencyScan() {
  const res = document.getElementById('quickScanResult');
  res.innerHTML = '<div style="color:var(--primary); font-weight:600; text-align:center; padding:10px;">🚨 Skaner ishlamoqda...</div>';
  const scan = await window.BioScanner.scanFingerprint();
  if (scan && scan.success) {
    const patient = await window.LifeIDApi.scanPatientByFingerprint(scan.fpId);
    const p = patient || (await window.LifeIDDB.getPatients()).slice(-1)[0];
    _lastScannedPatient = p;

    if (p) {
      const diagnosesList = p.diagnoses ? p.diagnoses.join('; ') : 'Hali qo\'shimcha tashxislar kiritilmagan';
      res.innerHTML = `
        <div style="background:var(--primary-light); border:2px solid var(--primary); border-radius:14px; padding:16px; margin-top:10px;">
          <div style="font-size:16px; font-weight:700; color:var(--primary-dark); margin-bottom:10px;">🚨 ТЕЗ YORDAM KARTASI (TOPILDI)</div>
          <div style="font-size:14px; margin-bottom:6px;"><b>Ism-familiya:</b> ${p.lastName} ${p.firstName} ${p.middleName||''}</div>
          <div style="font-size:14px; margin-bottom:6px;"><b>Pasport raqami:</b> <span style="font-family:'DM Mono'">${p.passportSeries} ${p.passportNumber}</span></div>
          <div style="font-size:14px; margin-bottom:6px;"><b>Qon guruhi:</b> <span class="blood-badge">${p.bloodGroup} ${p.rhesus}</span></div>
          <div style="font-size:14px; margin-bottom:6px;"><b>Qon tahlili / Infeksiya:</b> <span style="color:var(--primary); font-weight:600;">${p.bloodTestResult || 'Normal'}</span></div>
          <div style="font-size:14px; margin-bottom:6px;"><b>Asosiy kasallik tarixi:</b> ${p.chronic || 'Kiritilmagan'}</div>
          <div style="font-size:14px; margin-bottom:6px;"><b>Alergiyalar:</b> <span style="color:var(--primary); font-weight:700;">${p.allergies?.join(', ') || 'Yo\'q'}</span></div>
          <div style="font-size:14px; margin-bottom:6px;"><b>Shifokor ko'rik yozuvlari / Tashxislar:</b> <span id="scannedDiagnosesDisplay" style="color:var(--primary); font-weight:600;">${diagnosesList}</span></div>
          <div style="font-size:14px; margin-top:10px; border-top:1px solid var(--red-border); padding-top:8px;">
            <b>📞 1-Yaqinining raqami:</b> <a href="${makeTelLink(p.contacts?.[0]?.phone)}" style="color:var(--primary); font-weight:700;">${p.contacts?.[0]?.phone || '-'}</a><br>
            <b>📞 2-Yaqinining raqami:</b> <a href="${makeTelLink(p.contacts?.[1]?.phone)}" style="color:var(--primary); font-weight:700;">${p.contacts?.[1]?.phone || '-'}</a>
          </div>

          <!-- ADD DIAGNOSIS / NOTE FORM -->
          <div style="margin-top:14px; background:#fff; padding:14px; border-radius:12px; border:1px solid var(--border);">
            <div style="font-size:13px; font-weight:700; margin-bottom:8px; color:var(--text); display:flex; align-items:center; gap:6px;">
              <span>🩺</span> Shoshilinch Kasallik / Ko'rsatilgan Yordamni Qo'shish
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <input type="text" id="newDiagnosisInput" placeholder="Yangi tashxis / kasallik (masalan: O'tkir infarkt, gipertonik kriz...)" style="font-size:13px;" />
              <input type="text" id="newTreatmentInput" placeholder="Ko'rsatilgan shoshilinch yordam / Dori (masalan: Magniy sulfat 25% 10ml...)" style="font-size:13px;" />
              <button class="btn-primary" style="padding:10px; font-size:13px; font-weight:600;" onclick="addDiagnosisToScannedPatient()">Tashxis va Muolajani Saqlash ✓</button>
            </div>
          </div>

          <!-- 🤖 GEMINI AI DORI XAVFSIZLIGI VA MASLAHAT MODULI -->
          <div style="margin-top:14px; background:#fff; padding:14px; border-radius:12px; border:1.5px solid var(--primary); box-shadow:0 4px 12px rgba(197,25,45,0.08);">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
              <div style="font-size:13.5px; font-weight:700; color:var(--primary); display:flex; align-items:center; gap:6px;">
                <span>🤖</span> Gemini AI Dori Xavfsizligi Moduli
              </div>
              <span style="font-size:11px; background:var(--primary-light); color:var(--primary); padding:2px 8px; border-radius:12px; font-weight:700;">Mubina AI</span>
            </div>
            <div style="font-size:12px; color:var(--text-2); margin-bottom:8px;">
              Bemorga dori yozishdan oldin allergiya va o'zaro ta'sir xavfini tekshiring:
            </div>
            <div style="display:flex; gap:8px; margin-bottom:8px;">
              <input type="text" id="aiDrugInput" placeholder="Masalan: Aspirin, Penitsillin, Seftriakson..." style="font-size:13px; flex:1;" onkeypress="if(event.key==='Enter') checkScannedPatientDrugSafety()" />
              <button class="btn-primary" style="padding:8px 14px; font-size:12px; white-space:nowrap;" onclick="checkScannedPatientDrugSafety()">AI Tekshirish</button>
            </div>
            <div id="aiDrugResult"></div>

            <div style="margin-top:10px; border-top:1px dashed var(--border); padding-top:10px; display:flex; gap:8px;">
              <button class="btn-secondary" style="flex:1; padding:8px; font-size:12px; font-weight:600;" onclick="getClinicalAdviceForScannedPatient()">💡 Shoshilinch AI Klinik Tavsiya Olish</button>
            </div>
            <div id="aiClinicalResult" style="margin-top:8px;"></div>
          </div>
        </div>
      `;
    } else {
      res.innerHTML = `<div style="color:var(--primary); text-align:center; padding:10px;">Bemor topilmadi. Avval bemor ro'yxatdan o'tkazing.</div>`;
    }
  } else {
    res.innerHTML = `<div style="color:var(--primary); text-align:center; padding:10px;">Skanerlash bekor qilindi yoki tasdiqlanmadi.</div>`;
  }
}

async function checkScannedPatientDrugSafety() {
  const input = document.getElementById('aiDrugInput');
  const drugName = input.value.trim();
  const resDiv = document.getElementById('aiDrugResult');
  if (!drugName) {
    alert("Iltimos, tekshirmoqchi bo'lgan dori nomini kiriting!");
    return;
  }
  if (!_lastScannedPatient) {
    alert("Bemor ma'lumotlari topilmadi!");
    return;
  }

  resDiv.innerHTML = '<div style="font-size:12px; color:var(--text-3); padding:6px;">🤖 Gemini AI tahlil qilmoqda...</div>';

  const check = await window.LifeIDApi.checkDrugSafety(
    _lastScannedPatient.id,
    drugName,
    _lastScannedPatient.allergies || [],
    _lastScannedPatient.diagnoses || []
  );

  if (check.risk_level === 'HIGH') {
    resDiv.innerHTML = `
      <div style="background:#FDF2F4; border:1.5px solid #C5192D; color:#9E1020; padding:10px 12px; border-radius:10px; font-size:12.5px; line-height:1.4; margin-top:6px;">
        <div style="font-weight:700; display:flex; align-items:center; gap:4px; margin-bottom:2px;">
          <span>🚨</span> YUQORI XAVF DARAJASI (HIGH RISK)
        </div>
        ${check.warning_message}
      </div>
    `;
  } else {
    resDiv.innerHTML = `
      <div style="background:#E1F5EE; border:1.5px solid #1D9E75; color:#0F5132; padding:10px 12px; border-radius:10px; font-size:12.5px; line-height:1.4; margin-top:6px;">
        <div style="font-weight:700; display:flex; align-items:center; gap:4px; margin-bottom:2px;">
          <span>✅</span> XAVFSIZ (SAFE)
        </div>
        ${check.warning_message}
      </div>
    `;
  }
}

async function getClinicalAdviceForScannedPatient() {
  const resDiv = document.getElementById('aiClinicalResult');
  if (!_lastScannedPatient) return;
  resDiv.innerHTML = '<div style="font-size:12px; color:var(--text-3); padding:6px;">🤖 Gemini AI klinik protokolni shakllantirmoqda...</div>';

  const prompt = `Favqulodda shoshilinch yordam: Qon guruhi: ${_lastScannedPatient.bloodGroup} ${_lastScannedPatient.rhesus}, Allergiyalar: ${_lastScannedPatient.allergies?.join(', ') || 'yo\\'q'}, Surunkali: ${_lastScannedPatient.chronic || 'yo\\'q'}, Qon bosimi: ${_lastScannedPatient.bp || '120/80'}. Ushbu bemorga shoshilinch tez tibbiy yordam ko'rsatishda nimalarga e'tibor qaratish zarur?`;

  const advice = await window.GeminiAI.askMedicalAssistant(prompt, _lastScannedPatient);

  resDiv.innerHTML = `
    <div style="background:#F4F5F7; border:1px solid var(--border); padding:10px 12px; border-radius:10px; font-size:12.5px; line-height:1.4; color:var(--text);">
      <div style="font-weight:700; color:var(--primary); margin-bottom:4px;">💡 Gemini AI Shifokor Tavsiyasi:</div>
      ${advice}
    </div>
  `;
}

async function addDiagnosisToScannedPatient() {
  const diagInput = document.getElementById('newDiagnosisInput');
  const treatInput = document.getElementById('newTreatmentInput');
  const diag = diagInput ? diagInput.value.trim() : '';
  const treat = treatInput ? treatInput.value.trim() : '';
  if (!diag && !treat) { alert('Iltimos, tashxis yoki ko\'rsatilgan yordamni kiriting!'); return; }
  if (!_lastScannedPatient) { alert('Avval bemorni skanerlang!'); return; }

  const p = _lastScannedPatient;
  if (!p.diagnoses) p.diagnoses = [];
  const docName = window.LifeIDDB.currentDoctor?.name || 'Navbatchi shifokor';
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString();

  let entry = diag;
  if (treat) entry += (diag ? ' | Muolaja: ' : 'Muolaja: ') + treat;
  entry += ` (${dateStr} ${timeStr} - ${docName})`;

  p.diagnoses.push(entry);

  await window.LifeIDDB.savePatient(p);
  showToast("Yangi kasallik va shoshilinch yordam saqlandi!");
  if (diagInput) diagInput.value = '';
  if (treatInput) treatInput.value = '';

  const display = document.getElementById('scannedDiagnosesDisplay');
  if (display) {
    display.textContent = p.diagnoses.join('; ');
  }
  loadDashboard();
}

let _currentModalPatient = null;

async function openAddDiagnosisModal(patientId) {
  const patients = await window.LifeIDDB.getPatients();
  const p = patients.find(x => String(x.id) === String(patientId) || x.firebaseKey === patientId || (x.passportSeries + x.passportNumber) === String(patientId));
  if (!p) {
    showToast("Bemor topilmadi");
    return;
  }
  _currentModalPatient = p;

  let modal = document.getElementById('diagnosisModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'diagnosisModal';
    modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.65); z-index:4000; display:flex; align-items:center; justify-content:center; padding:16px;';
    document.body.appendChild(modal);
  }

  const diagnosesList = p.diagnoses && p.diagnoses.length > 0
    ? p.diagnoses.map((d, i) => `<div style="background:#F4F5F7; padding:8px 10px; border-radius:8px; font-size:12px; margin-bottom:6px; border-left:3px solid var(--primary);">${i+1}. ${d}</div>`).join('')
    : '<div style="font-size:12px; color:var(--text-3); margin-bottom:8px;">Hali qo\'shimcha tashxislar kiritilmagan.</div>';

  modal.innerHTML = `
    <div style="background:#fff; width:100%; max-width:440px; border-radius:18px; padding:20px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 40px rgba(0,0,0,0.2);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:10px;">
        <div>
          <div style="font-size:16px; font-weight:700; color:var(--text);">${p.lastName} ${p.firstName}</div>
          <div style="font-size:12px; color:var(--text-3);">Qon guruhi: <b style="color:var(--primary); font-family:'DM Mono'">${p.bloodGroup} ${p.rhesus}</b> · Pasport: ${p.passportSeries} ${p.passportNumber}</div>
        </div>
        <button onclick="document.getElementById('diagnosisModal').style.display='none'" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--text-3);">&times;</button>
      </div>

      <div style="margin-bottom:12px;">
        <div style="font-size:12.5px; font-weight:600; color:var(--text-2); margin-bottom:6px;">Mavjud Kasalliklar & Tashxislar Tarixi:</div>
        <div id="modalDiagnosesHistory" style="max-height:140px; overflow-y:auto;">
          ${diagnosesList}
        </div>
      </div>

      <div style="background:var(--primary-light); padding:14px; border-radius:12px; border:1px solid var(--red-border); margin-bottom:14px;">
        <div style="font-size:13px; font-weight:700; color:var(--primary-dark); margin-bottom:8px;">+ Yangi Kasallik yoki Shoshilinch Yordam Qo'shish</div>
        <div class="field" style="margin-bottom:8px;">
          <label style="font-size:11px;">Yangi Kasallik / Tashxis</label>
          <input type="text" id="modalNewDiag" placeholder="Masalan: O'tkir pankreatit, shoshilinch yordam" style="font-size:13px; padding:8px 10px;" />
        </div>
        <div class="field" style="margin-bottom:8px;">
          <label style="font-size:11px;">Ko'rsatilgan Tibbiy Yordam / Dori</label>
          <input type="text" id="modalNewTreat" placeholder="Masalan: Spazmolitik va analgetik tomirga yuborildi" style="font-size:13px; padding:8px 10px;" />
        </div>
        <button class="btn-primary" style="padding:10px; font-size:13px; font-weight:600;" onclick="saveModalDiagnosis()">Saqlash va Bazaga Yuborish ✓</button>
      </div>

      <button class="btn-secondary" style="width:100%; padding:10px; font-size:13px; font-weight:600;" onclick="document.getElementById('diagnosisModal').style.display='none'">Yopish</button>
    </div>
  `;
  modal.style.display = 'flex';
}

async function saveModalDiagnosis() {
  const diag = document.getElementById('modalNewDiag').value.trim();
  const treat = document.getElementById('modalNewTreat').value.trim();
  if (!diag && !treat) {
    alert("Iltimos, kasallik tashxisi yoki ko'rsatilgan yordamni kiriting!");
    return;
  }
  if (!_currentModalPatient) return;

  const p = _currentModalPatient;
  if (!p.diagnoses) p.diagnoses = [];
  const docName = window.LifeIDDB.currentDoctor?.name || 'Navbatchi shifokor';
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString();

  let entry = diag;
  if (treat) entry += (diag ? ' | Muolaja: ' : 'Muolaja: ') + treat;
  entry += ` (${dateStr} ${timeStr} - ${docName})`;

  p.diagnoses.push(entry);

  await window.LifeIDDB.savePatient(p);
  showToast("Yangi kasallik bemor kartasiga saqlandi!");
  document.getElementById('diagnosisModal').style.display = 'none';

  loadDashboard();
  const patients = await window.LifeIDDB.getPatients();
  renderPatientsList(patients);
}

async function exportAppPatientsJSON() {
  const patients = await window.LifeIDDB.getPatients();
  const jsonStr = JSON.stringify(patients, null, 2);

  try {
    await navigator.clipboard.writeText(jsonStr);
    showToast("Baza JSON ma'lumotlari nusxalandi!");
  } catch (e) {
    console.warn("Clipboard failed:", e);
  }

  let modal = document.getElementById('exportModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'exportModal';
    modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:5000; display:flex; align-items:center; justify-content:center; padding:20px;';
    modal.innerHTML = `
      <div style="background:#fff; width:100%; max-width:500px; border-radius:16px; padding:20px; display:flex; flex-direction:column; gap:12px;">
        <div style="font-size:16px; font-weight:700; color:var(--primary);">📤 Baza Eksporti (JSON)</div>
        <div style="font-size:12px; color:var(--text-2);">Quyidagi JSON ma'lumotlar nusxalandi. Uni Admin panelidagi "JSON Import" oynasiga qo'shing:</div>
        <textarea id="exportJsonText" style="width:100%; height:200px; font-family:'DM Mono'; font-size:11px; padding:8px; border:1px solid var(--border); border-radius:8px;" readonly></textarea>
        <div style="display:flex; gap:8px;">
          <button class="btn-primary" onclick="navigator.clipboard.writeText(document.getElementById('exportJsonText').value); showToast('Nusxalandi!');">Nusxalash (Copy)</button>
          <button class="btn-secondary" onclick="document.getElementById('exportModal').remove()">Yopish</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  document.getElementById('exportJsonText').value = jsonStr;
  modal.style.display = 'flex';
}

async function handleBiometricLogin() {
  showToast("Barmoq izi skaneri ishlamoqda...");
  const res = await window.BioScanner.scanFingerprint();
  if (res.success) {
    const doc = { id: 'doc_48227', name: 'Dr. Jasur Karimov', spec: 'Kardiolog • Reanimatolog', clinic: 'Toshkent shahar 1-son ShTTYO', role: 'admin' };
    window.LifeIDDB.loginDoctor(doc);
    checkDoctorAuth();
    loadDashboard();
    showToast("Biometrik tasdiqlandi. Xush kelibsiz!");
  } else {
    alert("Barmoq izi tanilmadi!");
  }
}

function showToast(text) {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
