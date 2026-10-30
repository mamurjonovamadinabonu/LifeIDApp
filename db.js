// db.js — LifeID Database Layer (IndexedDB with Rich Mock Data & Doctor Authorization)
class LifeIDDatabase {
  constructor() {
    this.dbName = 'LifeIDDB';
    this.version = 6;
    this.db = null;
    this.currentDoctor = JSON.parse(localStorage.getItem('lifeid_doctor_session')) || {
      id: 'doc_48227',
      name: 'Dr. Jasur Karimov',
      spec: 'Kardiolog • Reanimatolog',
      clinic: 'Toshkent shahar 1-son ShTTYO',
      role: 'admin'
    };
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
      store.count().onsuccess = (e) => {
        if (e.target.result === 0) {
          const mockPatients = [
            {
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
              medications: 'Salbutamol spreyi',
              contacts: [
                { name: 'Jalolov Akram', relation: 'Otasi', phone: '+998 90 123 45 67' },
                { name: 'Shahnoza Abdullayeva', relation: 'Turmush o\'rtog\'i', phone: '+998 93 987 65 43' }
              ],
              fingerprintId: 'fp_mock_001',
              isDonor: true,
              lastDonationDate: '2023-10-14',
              createdBy: this.currentDoctor.id
            },
            {
              lastName: 'Jalolov',
              firstName: 'Azizbek',
              middleName: 'Anvarovich',
              birthDate: '1996-07-22',
              workplace: 'IT Park Toshkent, Dasturchi',
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
              medications: 'Insulin',
              contacts: [
                { name: 'Nodira', relation: 'Turmush o\'rtog\'i', phone: '+998 90 123-45-67' },
                { name: 'Anvar', relation: 'Otasi', phone: '+998 91 111-22-33' }
              ],
              fingerprintId: 'fp_mock_002',
              isDonor: false,
              lastDonationDate: '2022-05-10',
              createdBy: this.currentDoctor.id
            },
            {
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
              bloodGroup: 'A (II)',
              rhesus: 'Rh-',
              bloodTestResult: 'Sog\'lom / Infeksiyasiz (Normal)',
              bp: '125/80',
              weight: '65',
              height: '165',
              diabetes: 'II tip',
              chronic: 'Gipertoniya 2-bosqich',
              allergies: ['Novokain'],
              medications: 'Enalapril',
              contacts: [
                { name: 'Tohir Umarov', relation: 'Otasi', phone: '+998 90 555 44 33' },
                { name: 'Malika', relation: 'Singlisi', phone: '+998 91 777 88 99' }
              ],
              fingerprintId: 'fp_mock_003',
              isDonor: true,
              lastDonationDate: '2023-09-01',
              createdBy: this.currentDoctor.id
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
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('patients', 'readwrite');
      const store = tx.objectStore('patients');
      patientData.createdBy = this.currentDoctor ? this.currentDoctor.id : 'doc_48227';
      const req = store.add(patientData);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async getPatients() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('patients', 'readonly');
      const store = tx.objectStore('patients');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async getDonors() {
    const patients = await this.getPatients();
    return patients.filter(p => p.isDonor);
  }

  async findByFingerprint(fpId) {
    const patients = await this.getPatients();
    return patients.find(p => p.fingerprintId === fpId) || patients[0]; // fallback to first mock patient for easy testing
  }
}

window.LifeIDDB = new LifeIDDatabase();
