// client/src/services/syncService.js

const DB_NAME = 'SwasthyaMitraDB';
const STORE_NAME = 'offlinePatients';

// Initialize IndexedDB
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject('Error opening DB');
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

// Save patient to IndexedDB
export const savePatientOffline = async (patientData) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const dataToSave = {
        ...patientData,
        synced: false,
        offlineTimestamp: new Date().toISOString()
      };
      
      const request = store.add(dataToSave);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject('Error saving offline');
    });
  } catch (err) {
    console.error('IndexedDB Error:', err);
    return false;
  }
};

// Get all offline patients
export const getOfflinePatients = async () => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result.filter(p => !p.synced));
      };
      request.onerror = () => reject('Error fetching offline data');
    });
  } catch (err) {
    console.error('IndexedDB Error:', err);
    return [];
  }
};

// Mark as synced
export const markAsSynced = async (id) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getReq = store.get(id);
      
      getReq.onsuccess = () => {
        const data = getReq.result;
        data.synced = true;
        const updateReq = store.put(data);
        updateReq.onsuccess = () => resolve(true);
      };
    });
  } catch (err) {
    console.error(err);
  }
};

// Background sync function
export const syncOfflineData = async (apiUrl) => {
  if (!navigator.onLine) return { success: false, message: 'Still offline' };
  
  const offlinePatients = await getOfflinePatients();
  if (offlinePatients.length === 0) return { success: true, count: 0 };
  
  let successCount = 0;
  for (const patient of offlinePatients) {
    try {
      const response = await fetch(`${apiUrl}/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient)
      });
      
      if (response.ok) {
        await markAsSynced(patient.id);
        successCount++;
      }
    } catch (err) {
      console.error('Sync failed for patient:', patient.id, err);
    }
  }
  
  return { success: true, count: successCount };
};
