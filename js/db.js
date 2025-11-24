// ===== CONFIGURACIÓN DE LA BASE DE DATOS =====
const DB_NAME = 'BoletosTravelDB';
const DB_VERSION = 1;

// Inicializar IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Crear stores si no existen
            if (!db.objectStoreNames.contains('usuarios')) {
                db.createObjectStore('usuarios', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('pasajeros')) {
                const pasajeros = db.createObjectStore('pasajeros', { keyPath: 'codigo' });
                pasajeros.createIndex('nombre', 'nombre', { unique: false });
                pasajeros.createIndex('estadoRegistro', 'estadoRegistro', { unique: false });
            }
            if (!db.objectStoreNames.contains('cajeros')) {
                const cajeros = db.createObjectStore('cajeros', { keyPath: 'codigo' });
                cajeros.createIndex('nombre', 'nombre', { unique: false });
                cajeros.createIndex('estadoRegistro', 'estadoRegistro', { unique: false });
            }
            if (!db.objectStoreNames.contains('destinos')) {
                const destinos = db.createObjectStore('destinos', { keyPath: 'codigo' });
                destinos.createIndex('nombre', 'nombre', { unique: false });
                destinos.createIndex('estadoRegistro', 'estadoRegistro', { unique: false });
            }
            if (!db.objectStoreNames.contains('boletos')) {
                const boletos = db.createObjectStore('boletos', { keyPath: 'numeroBoleto' });
                boletos.createIndex('fechaViaje', 'fechaViaje', { unique: false });
                boletos.createIndex('estadoRegistro', 'estadoRegistro', { unique: false });
            }
        };
    });
}

// Operación genérica para agregar/actualizar
async function addToStore(storeName, data) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Operación genérica para obtener un registro
async function getFromStore(storeName, key) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Operación genérica para obtener todos los registros
async function getAllFromStore(storeName) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Operación genérica para eliminar
async function deleteFromStore(storeName, key) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Obtener registros activos ordenados
async function getActiveRecords(storeName) {
    const records = await getAllFromStore(storeName);
    return records
        .filter(r => r.estadoRegistro === 'A')
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
}