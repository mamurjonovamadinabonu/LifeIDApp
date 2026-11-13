// db.js — LifeID Database Layer (IndexedDB + Firebase Realtime Cloud Database Sync)
const FIREBASE_DB_URL = "https://lifeid-doctor-default-rtdb.firebaseio.com";

class LifeIDDatabase {
  constructor() {
    this.dbName = 'LifeIDDB';
    this.version = 6;
    this.db = null;
    this.currentDoctor = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.seedMockDataIfNeeded().then(() => resolve(this.db));
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('patients')) {
          const store = db.createObjectStore('patients', { keyPath: 'id', autoIncrement: true });
          store.createIndex('createdBy', 'createdBy', { unique: false });
        }
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async seedMockDataIfNeeded() {
    return new Promise((resolve) => {
      const tx = this.db.transaction('patients', 'readwrite');
      const store = tx.objectStore('patients');
      store.count().onsuccess = async (e) => {
        if (e.target.result === 0) {
          const mockPatients = [
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
            }
          ];
          mockPatients.forEach(p => store.add(p));
        }
        resolve();
      };
    });
  }

  loginDoctor(doctorData) {
    this.currentDoctor = doctorData;
    localStorage.setItem('lifeid_doctor_session', JSON.stringify(doctorData));
  }

  logoutDoctor() {
    this.currentDoctor = null;
    localStorage.removeItem('lifeid_doctor_session');
    location.reload();
  }

  async addPatient(patientData) {
    try {
      // Sync to Firebase Cloud Database
      const response = await fetch(`${FIREBASE_DB_URL}/patients.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData)
      });
      if (response.ok) {
        const resJson = await response.json();
        patientData.firebaseKey = resJson.name;
      }
    } catch (err) {
      console.warn("Firebase addPatient offline:", err);
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('patients', 'readwrite');
      const store = tx.objectStore('patients');
      patientData.createdBy = this.currentDoctor ? this.currentDoctor.id : 'doc_default';
      const req = store.add(patientData);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async savePatient(patientData) {
    try {
      if (patientData.firebaseKey) {
        await fetch(`${FIREBASE_DB_URL}/patients/${patientData.firebaseKey}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patientData)
        });
      } else {
        await fetch(`${FIREBASE_DB_URL}/patients.json`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patientData)
        });
      }
    } catch (err) {
      console.warn("Firebase savePatient offline:", err);
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('patients', 'readwrite');
      const store = tx.objectStore('patients');
      const req = store.put(patientData);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async getPatients() {
    try {
      const response = await fetch(`${FIREBASE_DB_URL}/patients.json`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          const cloudPatients = Object.entries(data).map(([key, val]) => ({ ...val, firebaseKey: key }));
          return cloudPatients;
        }
      }
    } catch (err) {
      console.warn("Firebase getPatients offline, using local DB:", err);
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('patients', 'readonly');
      const store = tx.objectStore('patients');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
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
