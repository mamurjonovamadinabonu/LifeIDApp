// db.js - LifeID Database Layer (No Mock Data, Strict Doctor Authorization)
class LifeIDDatabase {
  constructor() {
    this.dbName = 'LifeIDDB';
    this.version = 4;
    this.db = null;
    this.currentDoctor = JSON.parse(localStorage.getItem('lifeid_doctor_session')) || null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
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
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['patients', 'history'], 'readwrite');
      const store = tx.objectStore('patients');
      patientData.createdBy = this.currentDoctor ? this.currentDoctor.id : 'unknown_doctor';
      patientData.doctorName = this.currentDoctor ? this.currentDoctor.name : 'Noma\'lum shifokor';
      patientData.createdAt = new Date().toISOString();
      const req = store.add(patientData);
      req.onsuccess = () => {
        const historyStore = tx.objectStore('history');
        historyStore.add({
          action: 'Yangi bemor qo\'shildi',
          details: `${patientData.lastName} ${patientData.firstName} ro'yxatga olindi`,
          timestamp: new Date().toISOString(),
          doctorId: patientData.createdBy
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
        if (isAdmin || (this.currentDoctor && this.currentDoctor.role === 'admin')) {
          resolve(all);
        } else {
          const docId = this.currentDoctor ? this.currentDoctor.id : '';
          resolve(all.filter(p => p.createdBy === docId));
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
        if (isAdmin || (this.currentDoctor && this.currentDoctor.role === 'admin')) {
          resolve(all);
        } else {
          const docId = this.currentDoctor ? this.currentDoctor.id : '';
          resolve(all.filter(h => h.doctorId === docId));
        }
      };
      req.onerror = () => reject(req.error);
    });
  }
}

window.LifeIDDB = new LifeIDDatabase();
