// db.js — LifeID Database Layer (IndexedDB + Firebase Realtime Cloud Database Sync)
const FIREBASE_DB_URL = "https://lifeid-doctor-default-rtdb.firebaseio.com";

class LifeIDDatabase {
  constructor() {
    this.dbName = 'LifeIDDB';
    this.version = 6;
    this.db = null;
    let savedSession = null;
    try {
      savedSession = localStorage.getItem('lifeid_doctor_session');
    } catch (e) {}
    try {
      this.currentDoctor = savedSession ? JSON.parse(savedSession) : {
        id: 'doc_madina',
        name: "Dr. Madinabonu Ma'murjonova",
        spec: "Loyiha Rahbari • Bosh Shifokor",
        clinic: "Respublika ShTTYO Markazi",
        role: "admin"
      };
    } catch (e) {
      this.currentDoctor = {
        id: 'doc_madina',
        name: "Dr. Madinabonu Ma'murjonova",
        spec: "Loyiha Rahbari • Bosh Shifokor",
        clinic: "Respublika ShTTYO Markazi",
        role: "admin"
      };
    }
  }

  getDefaultMockPatients() {
    return [
      {
        id: 1,
        lastName: 'Abdullayev',
        firstName: 'Xurshid',
        middleName: 'Mirzoevich',
        birthDate: '1989-03-15',
        workplace: 'Toshkent mexanika zavodi, muhandis',
        gender: 'Erkak',
        nationality: 'O\'zbek',
        citizenship: 'O\'zbekiston',
        passportSeries: 'AA',
        passportNumber: '7823941',
        jshshir: '31503850000000',
        bloodGroup: 'O (I)',
        rhesus: 'Rh+',
        bloodTestResult: 'Sog\'lom / Infeksiyasiz (Normal)',
        bp: '135/85',
        weight: '78',
        height: '178',
        diabetes: 'Mavjud emas',
        chronic: 'Bronxial astma (og\'ir)',
        allergies: ['Penitsillin'],
        diagnoses: ['Bronxial astma xuruji (12.01.2024 - Dr. Jasur Karimov)'],
        medications: 'Salbutamol spreyi',
        contacts: [
          { name: 'Jalolov Akram', relation: 'Otasi', phone: '+998 90 123 45 67' },
          { name: 'Shahnoza Abdullayeva', relation: 'Turmush o\'rtog\'i', phone: '+998 93 987 65 43' }
        ],
        fingerprintId: 'fp_mock_001',
        isDonor: true,
        lastDonationDate: '2023-10-14',
        createdBy: 'doc_default'
      },
      {
        id: 2,
        lastName: 'Jalolov',
        firstName: 'Azizbek',
        middleName: 'Anvarovich',
        birthDate: '1996-07-22',
        workplace: 'IT Park Toshkent, dasturchi',
        gender: 'Erkak',
        nationality: 'O\'zbek',
        citizenship: 'O\'zbekiston',
        passportSeries: 'AB',
        passportNumber: '4452190',
        jshshir: '42207960000001',
        bloodGroup: 'A (II)',
        rhesus: 'Rh+',
        bloodTestResult: 'Gepatit B / C infeksiyasi',
        bp: '120/80',
        weight: '72',
        height: '180',
        diabetes: 'I tip',
        chronic: 'Qandli diabet 1-tur',
        allergies: ['Penitsillin', 'Aspirin'],
        diagnoses: ['Qandli diabet dinamik nazoratda (10.02.2024 - Dr. Malika Umarova)'],
        medications: 'Insulin',
        contacts: [
          { name: 'Nodira Jalolova', relation: 'Turmush o\'rtog\'i', phone: '+998 90 123 45 67' },
          { name: 'Anvar Jalolov', relation: 'Otasi', phone: '+998 91 111 22 33' }
        ],
        fingerprintId: 'fp_mock_002',
        isDonor: false,
        lastDonationDate: '2022-05-10',
        createdBy: 'doc_default'
      },
      {
        id: 3,
        lastName: 'Umarova',
        firstName: 'Nigora',
        middleName: 'Tohirovna',
        birthDate: '1982-11-05',
        workplace: '52-sonli maktab, o\'qituvchi',
        gender: 'Ayol',
        nationality: 'O\'zbek',
        citizenship: 'O\'zbekiston',
        passportSeries: 'AC',
        passportNumber: '9981234',
        jshshir: '48211820000002',
        bloodGroup: 'B (III)',
        rhesus: 'Rh-',
        bloodTestResult: 'Sog\'lom / Infeksiyasiz (Normal)',
        bp: '125/80',
        weight: '65',
        height: '165',
        diabetes: 'Mavjud emas',
        chronic: 'Surunkali gastrit',
        allergies: ['Novokain'],
        diagnoses: ['Remissiya bosqichi (05.03.2024 - Dr. Jasur Karimov)'],
        medications: 'Omeprazol',
        contacts: [
          { name: 'Farrux Umarov', relation: 'Turmush o\'rtog\'i', phone: '+998 97 765 43 21' },
          { name: 'Dilnoza Umarova', relation: 'Singlisi', phone: '+998 99 888 77 66' }
        ],
        fingerprintId: 'fp_mock_003',
        isDonor: true,
        lastDonationDate: '2024-01-20',
        createdBy: 'doc_default'
      }
    ];
  }

  async init() {
    return new Promise((resolve) => {
      try {
        if (typeof indexedDB === 'undefined' || !indexedDB) {
          console.warn("IndexedDB mavjud emas, localStorage rejimida ishlaydi.");
          return resolve(null);
        }
        const request = indexedDB.open(this.dbName, this.version);
        request.onerror = (e) => {
          console.warn("IndexedDB ochishda ogohlantirish:", e);
          resolve(null);
        };
        request.onsuccess = () => {
          this.db = request.result;
          this.seedMockDataIfNeeded()
            .then(() => resolve(this.db))
            .catch(() => resolve(this.db));
        };
        request.onupgradeneeded = (event) => {
          try {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('patients')) {
              const store = db.createObjectStore('patients', { keyPath: 'id', autoIncrement: true });
              store.createIndex('createdBy', 'createdBy', { unique: false });
            }
            if (!db.objectStoreNames.contains('history')) {
              db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
            }
          } catch (upgradeErr) {
            console.warn("IndexedDB upgrade xatosi:", upgradeErr);
          }
        };
      } catch (err) {
        console.warn("IndexedDB init istisnosi:", err);
        resolve(null);
      }
    });
  }

  async seedMockDataIfNeeded() {
    try {
      if (!localStorage.getItem('lifeid_shared_patients')) {
        localStorage.setItem('lifeid_shared_patients', JSON.stringify(this.getDefaultMockPatients()));
      }
    } catch(e) {}
    return new Promise((resolve) => {
      if (!this.db) return resolve();
      try {
        const tx = this.db.transaction('patients', 'readwrite');
        const store = tx.objectStore('patients');
        const req = store.count();
        req.onsuccess = async (e) => {
          if (e.target.result === 0) {
            const mockPatients = this.getDefaultMockPatients();
            mockPatients.forEach(p => {
              try { store.add(p); } catch(e){}
            });
          }
          resolve();
        };
        req.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }

  loginDoctor(doctorData) {
    this.currentDoctor = doctorData;
    try {
      localStorage.setItem('lifeid_doctor_session', JSON.stringify(doctorData));
    } catch(e) {}
  }

  logoutDoctor() {
    this.currentDoctor = null;
    try {
      localStorage.removeItem('lifeid_doctor_session');
    } catch(e) {}
    location.reload();
  }

  async addPatient(patientData) {
    let payload = patientData;
    if (window.MedicalSecurity) {
      payload = await window.MedicalSecurity.encryptPatientRecord(patientData);
    }

    try {
      // Sync to Firebase Cloud Database (Encrypted)
      const response = await fetch(`${FIREBASE_DB_URL}/patients.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const resJson = await response.json();
        patientData.firebaseKey = resJson.name;
        payload.firebaseKey = resJson.name;
      }
    } catch (err) {
      console.warn("Firebase addPatient offline:", err);
    }

    let result = Date.now();
    patientData.id = patientData.id || Date.now();
    if (this.db) {
      try {
        result = await new Promise((resolve) => {
          const tx = this.db.transaction('patients', 'readwrite');
          const store = tx.objectStore('patients');
          patientData.createdBy = this.currentDoctor ? this.currentDoctor.id : 'doc_default';
          const req = store.add(patientData);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(patientData.id);
        });
      } catch (e) {
        console.warn("IndexedDB add error:", e);
      }
    }

    try {
      let cached = JSON.parse(localStorage.getItem('lifeid_shared_patients') || '[]');
      cached.push(patientData);
      localStorage.setItem('lifeid_shared_patients', JSON.stringify(cached));
    } catch (e) {}

    return result;
  }

  async savePatient(patientData) {
    let payload = patientData;
    if (window.MedicalSecurity) {
      payload = await window.MedicalSecurity.encryptPatientRecord(patientData);
    }

    try {
      if (patientData.firebaseKey) {
        await fetch(`${FIREBASE_DB_URL}/patients/${patientData.firebaseKey}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        const res = await fetch(`${FIREBASE_DB_URL}/patients.json`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const resJson = await res.json();
          patientData.firebaseKey = resJson.name;
          payload.firebaseKey = resJson.name;
        }
      }
    } catch (err) {
      console.warn("Firebase savePatient offline:", err);
    }

    let result = true;
    if (this.db) {
      try {
        result = await new Promise((resolve) => {
          const tx = this.db.transaction('patients', 'readwrite');
          const store = tx.objectStore('patients');
          const req = store.put(patientData);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(true);
        });
      } catch (e) {
        console.warn("IndexedDB put error:", e);
      }
    }

    try {
      let cached = JSON.parse(localStorage.getItem('lifeid_shared_patients') || '[]');
      const idx = cached.findIndex(p => p.id === patientData.id || (p.passportSeries === patientData.passportSeries && p.passportNumber === patientData.passportNumber));
      if (idx >= 0) cached[idx] = patientData; else cached.push(patientData);
      localStorage.setItem('lifeid_shared_patients', JSON.stringify(cached));
    } catch (e) {}

    return result;
  }

  async getPatients() {
    let rawPatients = [];
    try {
      const response = await fetch(`${FIREBASE_DB_URL}/patients.json`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          rawPatients = Object.entries(data).map(([key, val]) => ({ ...val, firebaseKey: key }));
        }
      }
    } catch (err) {
      console.warn("Firebase getPatients offline, using local DB:", err);
    }

    if (!rawPatients || rawPatients.length === 0) {
      if (this.db) {
        try {
          rawPatients = await new Promise((resolve) => {
            const tx = this.db.transaction('patients', 'readonly');
            const store = tx.objectStore('patients');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve([]);
          });
        } catch (e) {
          console.warn("IndexedDB getPatients error:", e);
        }
      }
    }

    // Fallback to localStorage or mock patients if indexedDB is empty or failed
    if (!rawPatients || rawPatients.length === 0) {
      try {
        const cached = localStorage.getItem('lifeid_shared_patients');
        if (cached) {
          rawPatients = JSON.parse(cached);
        }
      } catch (e) {}
    }

    if (!rawPatients || rawPatients.length === 0) {
      rawPatients = this.getDefaultMockPatients();
    }

    // Automatically decrypt records if encrypted
    let list = rawPatients;
    if (window.MedicalSecurity && Array.isArray(rawPatients)) {
      list = await Promise.all(rawPatients.map(p => window.MedicalSecurity.decryptPatientRecord(p)));
    }

    try {
      localStorage.setItem('lifeid_shared_patients', JSON.stringify(list));
    } catch (e) {}

    return list;
  }

  async getDonors() {
    const patients = await this.getPatients();
    return patients.filter(p => p.isDonor);
  }

  async findByFingerprint(fpId) {
    const patients = await this.getPatients();
    return patients.find(p => p.fingerprintId === fpId) || patients[0];
  }
}

window.LifeIDDB = new LifeIDDatabase();
