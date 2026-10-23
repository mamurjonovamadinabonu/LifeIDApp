// db.js - LifeID Database Layer (IndexedDB + LocalStorage with User Isolation & Admin Panel)
class LifeIDDatabase {
  constructor() {
    this.dbName = 'LifeIDDB';
    this.version = 2; // Incremented version for schema update
    this.db = null;
    this.currentUserId = this.getOrCreateUserId();
  }

  getOrCreateUserId() {
    let uid = localStorage.getItem('lifeid_user_id');
    if (!uid) {
      // Check Telegram WebApp user if available
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
        uid = 'tg_' + window.Telegram.WebApp.initDataUnsafe.user.id;
      } else {
        uid = 'doc_' + Math.floor(Math.random() * 100000);
      }
      localStorage.setItem('lifeid_user_id', uid);
    }
    return uid;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.seedInitialData().then(() => resolve(this.db));
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('patients')) {
          const patientStore = db.createObjectStore('patients', { keyPath: 'id', autoIncrement: true });
          patientStore.createIndex('passport', 'passport', { unique: false });
          patientStore.createIndex('createdBy', 'createdBy', { unique: false });
          patientStore.createIndex('isDonor', 'isDonor', { unique: false });
        } else {
          // ensure index exists
          const tx = event.target.transaction;
          const store = tx.objectStore('patients');
          if (!store.indexNames.contains('createdBy')) {
            store.createIndex('createdBy', 'createdBy', { unique: false });
          }
        }
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async seedInitialData() {
    return new Promise((resolve) => {
      const transaction = this.db.transaction(['patients', 'history', 'users'], 'readwrite');
      const patientStore = transaction.objectStore('patients');

      patientStore.count().onsuccess = (e) => {
        if (e.target.result === 0) {
          const samplePatients = [
            {
              firstName: 'Xurshid',
              lastName: 'Abdullayev',
              middleName: 'Mirzoevich',
              birthDate: '1985-03-15',
              gender: 'Erkak',
              nationality: "O'zbek",
              citizenship: "O'zbekiston",
              passportSeries: 'AB',
              passportNumber: '1234567',
              jshshir: '31503850010024',
              address: 'Toshkent sh., Yunusobod tumani, 5-kvartal, 12-uy',
              bloodGroup: 'A (II)',
              rhesus: 'Rh+',
              bp: '120/80',
              weight: '75',
              height: '175',
              diabetes: "Yo'q",
              chronic: 'Gipertenziya (2018-yildan)',
              allergies: ['Penitsillin', 'Aspirin'],
              medications: 'Enalapril 10mg',
              surgeries: 'Appendektomiya (2015)',
              contacts: [
                { name: 'Maftuna Abdullayeva', relation: "Turmush o'rtog'i", phone: '+998 90 123 45 67' }
              ],
              fingerprintId: 'fp_hash_sample_001',
              isDonor: true,
              createdBy: this.currentUserId,
              createdAt: new Date().toISOString()
            },
            {
              firstName: 'Dilbar',
              lastName: 'Turdiyeva',
              middleName: 'Anvarovna',
              birthDate: '1992-07-22',
              gender: 'Ayol',
              nationality: "O'zbek",
              citizenship: "O'zbekiston",
              passportSeries: 'AC',
              passportNumber: '7654321',
              jshshir: '42207920040011',
              address: 'Toshkent sh., Chilonzor tumani, 3-mavze, 45-uy',
              bloodGroup: 'O (I)',
              rhesus: 'Rh+',
              bp: '110/70',
              weight: '62',
              height: '168',
              diabetes: "Yo'q",
              chronic: 'Yo\'q',
              allergies: ['Sulfanilamid'],
              medications: 'Vataminlar',
              surgeries: 'Yo\'q',
              contacts: [
                { name: 'Anvar Turdiyev', relation: 'Ota', phone: '+998 93 987 65 43' }
              ],
              fingerprintId: 'fp_hash_sample_002',
              isDonor: true,
              createdBy: 'doc_admin',
              createdAt: new Date().toISOString()
            }
          ];
          samplePatients.forEach(p => patientStore.add(p));
        }
        resolve();
      };
    });
  }

  async addPatient(patientData) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['patients', 'history'], 'readwrite');
      const store = tx.objectStore('patients');
      patientData.createdBy = this.currentUserId;
      patientData.createdAt = new Date().toISOString();
      const req = store.add(patientData);
      req.onsuccess = () => {
        const historyStore = tx.objectStore('history');
        historyStore.add({
          action: 'Yangi bemor qo\'shildi',
          details: `${patientData.lastName} ${patientData.firstName} ro'yxatga olindi (ID: ${this.currentUserId})`,
          timestamp: new Date().toISOString(),
          userId: this.currentUserId
        });
        resolve(req.result);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getPatients(isAdmin = false) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('patients', 'readonly');
      const store = tx.objectStore('patients');
      const req = store.getAll();
      req.onsuccess = () => {
        const all = req.result;
        if (isAdmin) {
          resolve(all); // Admin sees all patients
        } else {
          // Regular user sees only their own created patients
          const filtered = all.filter(p => p.createdBy === this.currentUserId || !p.createdBy);
          resolve(filtered);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getDonors(isAdmin = false) {
    const patients = await this.getPatients(isAdmin);
    return patients.filter(p => p.isDonor);
  }

  async getHistory(isAdmin = false) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('history', 'readonly');
      const store = tx.objectStore('history');
      const req = store.getAll();
      req.onsuccess = () => {
        const all = req.result.reverse();
        if (isAdmin) {
          resolve(all);
        } else {
          resolve(all.filter(h => h.userId === this.currentUserId || !h.userId));
        }
      };
      req.onerror = () => reject(req.error);
    });
  }
}

window.LifeIDDB = new LifeIDDatabase();
