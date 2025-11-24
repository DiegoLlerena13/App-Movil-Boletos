// ===== CONFIGURACIÓN DE LA BASE DE DATOS =====
const DB_NAME = 'BoletosTravelDB';
const DB_VERSION = 1;

let dbInstance = null;

// Inicializar IndexedDB
function initDB() {
    if (dbInstance) {
        return Promise.resolve(dbInstance);
    }
    
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('Error al abrir la base de datos:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            dbInstance = request.result;
            console.log('Base de datos abierta exitosamente');
            resolve(dbInstance);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            console.log('Creando/actualizando estructura de la base de datos...');
            
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
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                console.error(`Error al guardar en ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error(`Error en addToStore(${storeName}):`, error);
        throw error;
    }
}

// Operación genérica para obtener un registro
async function getFromStore(storeName, key) {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                console.error(`Error al obtener de ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error(`Error en getFromStore(${storeName}):`, error);
        throw error;
    }
}

// Operación genérica para obtener todos los registros
async function getAllFromStore(storeName) {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => {
                console.error(`Error al obtener todos de ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error(`Error en getAllFromStore(${storeName}):`, error);
        throw error;
    }
}

// Operación genérica para eliminar
async function deleteFromStore(storeName, key) {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                console.error(`Error al eliminar de ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error(`Error en deleteFromStore(${storeName}):`, error);
        throw error;
    }
}

// Obtener registros activos ordenados
async function getActiveRecords(storeName) {
    try {
        const records = await getAllFromStore(storeName);
        return records
            .filter(r => r.estadoRegistro === 'A')
            .sort((a, b) => {
                const nameA = (a.nombre || '').toLowerCase();
                const nameB = (b.nombre || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });
    } catch (error) {
        console.error(`Error en getActiveRecords(${storeName}):`, error);
        return [];
    }
}

// ===== INICIALIZAR DATOS POR DEFECTO =====
async function initializeDefaultData() {
    try {
        console.log('Verificando datos iniciales...');
        
        // Verificar si ya hay datos
        const pasajeros = await getAllFromStore('pasajeros');
        if (pasajeros.length > 0) {
            console.log('✓ Ya existen datos en la base de datos');
            return;
        }

        console.log('Inicializando datos por defecto...');

        // PASAJEROS (10)
        const pasajerosData = [
            { codigo: 1, nombre: 'Juan Carlos Pérez García', estadoRegistro: 'A' },
            { codigo: 2, nombre: 'María Elena Rodríguez López', estadoRegistro: 'A' },
            { codigo: 3, nombre: 'Carlos Alberto Mendoza Silva', estadoRegistro: 'A' },
            { codigo: 4, nombre: 'Ana Patricia Flores Vargas', estadoRegistro: 'A' },
            { codigo: 5, nombre: 'Luis Fernando Castro Reyes', estadoRegistro: 'A' },
            { codigo: 6, nombre: 'Rosa María Sánchez Torres', estadoRegistro: 'A' },
            { codigo: 7, nombre: 'Pedro José Ramírez Díaz', estadoRegistro: 'A' },
            { codigo: 8, nombre: 'Carmen Isabel Huamán Quispe', estadoRegistro: 'A' },
            { codigo: 9, nombre: 'Roberto Miguel Gonzales Vega', estadoRegistro: 'A' },
            { codigo: 10, nombre: 'Sofía Alejandra Paredes Cruz', estadoRegistro: 'A' }
        ];

        // DESTINOS (10 ciudades del Perú)
        const destinosData = [
            { codigo: 1, nombre: 'Lima', estadoRegistro: 'A' },
            { codigo: 2, nombre: 'Arequipa', estadoRegistro: 'A' },
            { codigo: 3, nombre: 'Cusco', estadoRegistro: 'A' },
            { codigo: 4, nombre: 'Trujillo', estadoRegistro: 'A' },
            { codigo: 5, nombre: 'Chiclayo', estadoRegistro: 'A' },
            { codigo: 6, nombre: 'Piura', estadoRegistro: 'A' },
            { codigo: 7, nombre: 'Iquitos', estadoRegistro: 'A' },
            { codigo: 8, nombre: 'Huancayo', estadoRegistro: 'A' },
            { codigo: 9, nombre: 'Tacna', estadoRegistro: 'A' },
            { codigo: 10, nombre: 'Puno', estadoRegistro: 'A' }
        ];

        // CAJEROS (5 bancos/métodos de pago)
        const cajerosData = [
            { codigo: 1, nombre: 'BCP - Banco de Crédito del Perú', estadoRegistro: 'A' },
            { codigo: 2, nombre: 'Interbank', estadoRegistro: 'A' },
            { codigo: 3, nombre: 'Yape', estadoRegistro: 'A' },
            { codigo: 4, nombre: 'Plin', estadoRegistro: 'A' },
            { codigo: 5, nombre: 'BBVA Continental', estadoRegistro: 'A' }
        ];

        // Guardar pasajeros
        console.log('Guardando pasajeros...');
        for (const pasajero of pasajerosData) {
            await addToStore('pasajeros', pasajero);
        }

        // Guardar destinos
        console.log('Guardando destinos...');
        for (const destino of destinosData) {
            await addToStore('destinos', destino);
        }

        // Guardar cajeros
        console.log('Guardando cajeros...');
        for (const cajero of cajerosData) {
            await addToStore('cajeros', cajero);
        }

        // BOLETOS (15 boletos de ejemplo)
        const boletosData = [
            { numeroBoleto: 1, fechaViaje: '2025-01-15', pasajero: 1, pasajeroNombre: 'Juan Carlos Pérez García', destino: 1, destinoNombre: 'Lima', asiento: 'A12', monto: '85.00', cajero: 1, cajeroNombre: 'BCP - Banco de Crédito del Perú', estadoRegistro: 'A' },
            { numeroBoleto: 2, fechaViaje: '2025-01-18', pasajero: 2, pasajeroNombre: 'María Elena Rodríguez López', destino: 2, destinoNombre: 'Arequipa', asiento: 'B05', monto: '120.00', cajero: 3, cajeroNombre: 'Yape', estadoRegistro: 'A' },
            { numeroBoleto: 3, fechaViaje: '2025-01-20', pasajero: 3, pasajeroNombre: 'Carlos Alberto Mendoza Silva', destino: 3, destinoNombre: 'Cusco', asiento: 'C08', monto: '150.00', cajero: 2, cajeroNombre: 'Interbank', estadoRegistro: 'A' },
            { numeroBoleto: 4, fechaViaje: '2025-01-22', pasajero: 4, pasajeroNombre: 'Ana Patricia Flores Vargas', destino: 4, destinoNombre: 'Trujillo', asiento: 'A15', monto: '95.00', cajero: 4, cajeroNombre: 'Plin', estadoRegistro: 'A' },
            { numeroBoleto: 5, fechaViaje: '2025-01-25', pasajero: 5, pasajeroNombre: 'Luis Fernando Castro Reyes', destino: 5, destinoNombre: 'Chiclayo', asiento: 'D10', monto: '110.00', cajero: 5, cajeroNombre: 'BBVA Continental', estadoRegistro: 'A' },
            { numeroBoleto: 6, fechaViaje: '2025-02-01', pasajero: 6, pasajeroNombre: 'Rosa María Sánchez Torres', destino: 6, destinoNombre: 'Piura', asiento: 'B12', monto: '130.00', cajero: 1, cajeroNombre: 'BCP - Banco de Crédito del Perú', estadoRegistro: 'A' },
            { numeroBoleto: 7, fechaViaje: '2025-02-05', pasajero: 7, pasajeroNombre: 'Pedro José Ramírez Díaz', destino: 7, destinoNombre: 'Iquitos', asiento: 'A20', monto: '250.00', cajero: 2, cajeroNombre: 'Interbank', estadoRegistro: 'A' },
            { numeroBoleto: 8, fechaViaje: '2025-02-08', pasajero: 8, pasajeroNombre: 'Carmen Isabel Huamán Quispe', destino: 8, destinoNombre: 'Huancayo', asiento: 'C15', monto: '75.00', cajero: 3, cajeroNombre: 'Yape', estadoRegistro: 'A' },
            { numeroBoleto: 9, fechaViaje: '2025-02-10', pasajero: 9, pasajeroNombre: 'Roberto Miguel Gonzales Vega', destino: 9, destinoNombre: 'Tacna', asiento: 'D08', monto: '140.00', cajero: 4, cajeroNombre: 'Plin', estadoRegistro: 'A' },
            { numeroBoleto: 10, fechaViaje: '2025-02-12', pasajero: 10, pasajeroNombre: 'Sofía Alejandra Paredes Cruz', destino: 10, destinoNombre: 'Puno', asiento: 'B18', monto: '160.00', cajero: 5, cajeroNombre: 'BBVA Continental', estadoRegistro: 'A' },
            { numeroBoleto: 11, fechaViaje: '2025-02-15', pasajero: 1, pasajeroNombre: 'Juan Carlos Pérez García', destino: 3, destinoNombre: 'Cusco', asiento: 'A05', monto: '155.00', cajero: 1, cajeroNombre: 'BCP - Banco de Crédito del Perú', estadoRegistro: 'A' },
            { numeroBoleto: 12, fechaViaje: '2025-02-18', pasajero: 3, pasajeroNombre: 'Carlos Alberto Mendoza Silva', destino: 1, destinoNombre: 'Lima', asiento: 'C12', monto: '90.00', cajero: 3, cajeroNombre: 'Yape', estadoRegistro: 'A' },
            { numeroBoleto: 13, fechaViaje: '2025-02-20', pasajero: 5, pasajeroNombre: 'Luis Fernando Castro Reyes', destino: 2, destinoNombre: 'Arequipa', asiento: 'B08', monto: '125.00', cajero: 2, cajeroNombre: 'Interbank', estadoRegistro: 'A' },
            { numeroBoleto: 14, fechaViaje: '2025-02-22', pasajero: 7, pasajeroNombre: 'Pedro José Ramírez Díaz', destino: 4, destinoNombre: 'Trujillo', asiento: 'D15', monto: '100.00', cajero: 4, cajeroNombre: 'Plin', estadoRegistro: 'A' },
            { numeroBoleto: 15, fechaViaje: '2025-02-25', pasajero: 9, pasajeroNombre: 'Roberto Miguel Gonzales Vega', destino: 6, destinoNombre: 'Piura', asiento: 'A18', monto: '135.00', cajero: 5, cajeroNombre: 'BBVA Continental', estadoRegistro: 'A' }
        ];

        // Guardar boletos
        console.log('Guardando boletos...');
        for (const boleto of boletosData) {
            await addToStore('boletos', boleto);
        }

        console.log('✅ Datos iniciales cargados correctamente');
        console.log(`- ${pasajerosData.length} pasajeros`);
        console.log(`- ${destinosData.length} destinos`);
        console.log(`- ${cajerosData.length} cajeros`);
        console.log(`- ${boletosData.length} boletos`);

    } catch (error) {
        console.error('❌ Error al inicializar datos:', error);
        throw error;
    }
}

// ===== IMPORTAR DATOS DESDE JSON =====
async function importFromJSON(jsonData) {
    try {
        console.log('Iniciando importación de JSON...');
        
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        
        let imported = {
            pasajeros: 0,
            cajeros: 0,
            destinos: 0,
            boletos: 0
        };

        // Importar pasajeros
        if (data.pasajeros && Array.isArray(data.pasajeros)) {
            console.log(`Importando ${data.pasajeros.length} pasajeros...`);
            for (const pasajero of data.pasajeros) {
                if (pasajero.codigo && pasajero.nombre) {
                    await addToStore('pasajeros', {
                        codigo: Number(pasajero.codigo),
                        nombre: String(pasajero.nombre),
                        estadoRegistro: pasajero.estadoRegistro || 'A'
                    });
                    imported.pasajeros++;
                }
            }
        }

        // Importar cajeros
        if (data.cajeros && Array.isArray(data.cajeros)) {
            console.log(`Importando ${data.cajeros.length} cajeros...`);
            for (const cajero of data.cajeros) {
                if (cajero.codigo && cajero.nombre) {
                    await addToStore('cajeros', {
                        codigo: Number(cajero.codigo),
                        nombre: String(cajero.nombre),
                        estadoRegistro: cajero.estadoRegistro || 'A'
                    });
                    imported.cajeros++;
                }
            }
        }

        // Importar destinos
        if (data.destinos && Array.isArray(data.destinos)) {
            console.log(`Importando ${data.destinos.length} destinos...`);
            for (const destino of data.destinos) {
                if (destino.codigo && destino.nombre) {
                    await addToStore('destinos', {
                        codigo: Number(destino.codigo),
                        nombre: String(destino.nombre),
                        estadoRegistro: destino.estadoRegistro || 'A'
                    });
                    imported.destinos++;
                }
            }
        }

        // Importar boletos
        if (data.boletos && Array.isArray(data.boletos)) {
            console.log(`Importando ${data.boletos.length} boletos...`);
            for (const boleto of data.boletos) {
                if (boleto.numeroBoleto) {
                    await addToStore('boletos', {
                        numeroBoleto: Number(boleto.numeroBoleto),
                        fechaViaje: String(boleto.fechaViaje || ''),
                        pasajero: Number(boleto.pasajero || 0),
                        pasajeroNombre: String(boleto.pasajeroNombre || ''),
                        destino: Number(boleto.destino || 0),
                        destinoNombre: String(boleto.destinoNombre || ''),
                        asiento: String(boleto.asiento || ''),
                        monto: String(boleto.monto || '0.00'),
                        cajero: Number(boleto.cajero || 0),
                        cajeroNombre: String(boleto.cajeroNombre || ''),
                        estadoRegistro: boleto.estadoRegistro || 'A'
                    });
                    imported.boletos++;
                }
            }
        }

        console.log('✅ Importación completada:', imported);
        return imported;
    } catch (error) {
        console.error('❌ Error al importar JSON:', error);
        throw error;
    }
}

// ===== AUTO-INICIALIZACIÓN =====
// Inicializar la base de datos cuando se carga el script
(async function() {
    try {
        await initDB();
        await initializeDefaultData();
        console.log('Sistema de base de datos listo');
    } catch (error) {
        console.error('Error al inicializar el sistema:', error);
    }
})();