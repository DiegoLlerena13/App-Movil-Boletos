// ===== MANTENIMIENTO GENÉRICO MEJORADO =====

let currentStore = '';
let currentFields = [];
let currentRecords = [];
let filteredRecords = [];
let currentEditing = null;
let currentFilter = 'all';
let currentSort = 'nombre-asc';

// Inicializar mantenimiento
async function initMantenimiento(storeName, fields) {
    currentStore = storeName;
    currentFields = fields;
    await loadRecords();
    setupSearchListener();
}

// Cargar registros
async function loadRecords() {
    currentRecords = await getAllFromStore(currentStore);
    applyFiltersAndSort();
}

// Aplicar filtros y ordenamiento
function applyFiltersAndSort() {
    // Aplicar filtro
    if (currentFilter === 'all') {
        filteredRecords = [...currentRecords];
    } else {
        filteredRecords = currentRecords.filter(r => r.estadoRegistro === currentFilter);
    }

    // Aplicar ordenamiento
    const [field, order] = currentSort.split('-');
    
    filteredRecords.sort((a, b) => {
        let compareA, compareB;
        
        if (field === 'codigo') {
            compareA = a.codigo;
            compareB = b.codigo;
            return order === 'asc' ? compareA - compareB : compareB - compareA;
        } else if (field === 'nombre') {
            compareA = (a.nombre || '').toLowerCase();
            compareB = (b.nombre || '').toLowerCase();
            if (order === 'asc') {
                return compareA.localeCompare(compareB, 'es');
            } else {
                return compareB.localeCompare(compareA, 'es');
            }
        }
        return 0;
    });

    renderRecords(filteredRecords);
}

// Filtrar por estado
function filterByStatus(status) {
    currentFilter = status;
    
    // Actualizar tabs activos
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.filter === status) {
            tab.classList.add('active');
        }
    });
    
    applyFiltersAndSort();
}

// Ordenar registros
function sortRecords(sortBy) {
    currentSort = sortBy;
    
    // Actualizar botones activos
    document.querySelectorAll('.sort-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.sort-button').classList.add('active');
    
    applyFiltersAndSort();
}

// Renderizar registros
function renderRecords(records) {
    const container = document.getElementById('listContainer');
    
    if (records.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>No se encontraron registros</p>
                <p style="font-size: 14px; margin-top: 5px;">Intenta cambiar los filtros o la búsqueda</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = records.map(record => `
        <div class="record-card" onclick="event.stopPropagation()">
            <div class="record-header">
                <div class="record-title">${record.nombre || record.descripcion || 'Sin nombre'}</div>
                <div class="record-subtitle">Código: ${record.codigo}</div>
                <span class="record-status ${getStatusClass(record.estadoRegistro)}">
                    ${getStatusLabel(record.estadoRegistro)}
                </span>
            </div>
            <div class="record-actions">
                <button class="btn-icon btn-edit" onclick="editRecord(${record.codigo})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar
                </button>
                ${record.estadoRegistro !== '*' ? `
                    <button class="btn-icon btn-toggle ${record.estadoRegistro === 'I' ? 'activate' : ''}" 
                            onclick="toggleStatus(${record.codigo})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                            <line x1="12" y1="2" x2="12" y2="12"/>
                        </svg>
                        ${record.estadoRegistro === 'A' ? 'Inactivar' : 'Activar'}
                    </button>
                ` : ''}
                <button class="btn-icon btn-delete" 
                        onclick="deleteRecord(${record.codigo})" 
                        ${record.estadoRegistro === '*' ? 'disabled' : ''}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

// Configurar listener de búsqueda
function setupSearchListener() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        
        // Filtrar desde los registros ya filtrados por estado
        let baseRecords = currentFilter === 'all' 
            ? currentRecords 
            : currentRecords.filter(r => r.estadoRegistro === currentFilter);
        
        const searched = baseRecords.filter(r => 
            (r.nombre && r.nombre.toLowerCase().includes(term)) ||
            (r.codigo && r.codigo.toString().includes(term))
        );
        
        renderRecords(searched);
    });
}

// Mostrar formulario
function showForm(record = null) {
    const modal = document.getElementById('formModal');
    const form = document.getElementById('mainForm');
    const formTitle = document.getElementById('formTitle');
    
    if (record) {
        currentEditing = {...record};
        formTitle.textContent = `Editar ${currentStore.charAt(0).toUpperCase() + currentStore.slice(1, -1)}`;
    } else {
        const newCodigo = currentRecords.length > 0 
            ? Math.max(...currentRecords.map(r => r.codigo)) + 1 
            : 1;
        currentEditing = { codigo: newCodigo, estadoRegistro: 'A' };
        formTitle.textContent = `Nuevo ${currentStore.charAt(0).toUpperCase() + currentStore.slice(1, -1)}`;
    }
    
    // Llenar campos
    currentFields.forEach(field => {
        const input = document.getElementById(field);
        if (input) {
            input.value = currentEditing[field] || '';
        }
    });
    
    modal.classList.add('active');
    
    // Configurar submit
    form.onsubmit = async (e) => {
        e.preventDefault();
        await saveRecord();
    };
}

// Guardar registro
async function saveRecord() {
    currentFields.forEach(field => {
        const input = document.getElementById(field);
        if (input && field !== 'codigo') {
            currentEditing[field] = input.value;
        }
    });
    
    if (!currentEditing.nombre || currentEditing.nombre.trim() === '') {
        alert('Por favor ingresa el nombre');
        return;
    }
    
    await addToStore(currentStore, currentEditing);
    closeForm();
    await loadRecords();
}

// Cerrar formulario
function closeForm() {
    const modal = document.getElementById('formModal');
    modal.classList.remove('active');
    currentEditing = null;
}

// Editar registro
async function editRecord(codigo) {
    const record = await getFromStore(currentStore, codigo);
    showForm(record);
}

// Eliminar registro (marcar como eliminado)
async function deleteRecord(codigo) {
    if (!confirm('¿Está seguro de que desea eliminar este registro?')) return;
    
    const record = await getFromStore(currentStore, codigo);
    record.estadoRegistro = '*';
    await addToStore(currentStore, record);
    await loadRecords();
}

// Cambiar estado (activar/inactivar)
async function toggleStatus(codigo) {
    const record = await getFromStore(currentStore, codigo);
    record.estadoRegistro = record.estadoRegistro === 'A' ? 'I' : 'A';
    await addToStore(currentStore, record);
    await loadRecords();
}

// Obtener clase CSS según estado
function getStatusClass(status) {
    switch(status) {
        case 'A': return 'status-active';
        case 'I': return 'status-inactive';
        case '*': return 'status-deleted';
        default: return '';
    }
}

// Obtener etiqueta según estado
function getStatusLabel(status) {
    switch(status) {
        case 'A': return 'Activo';
        case 'I': return 'Inactivo';
        case '*': return 'Eliminado';
        default: return '';
    }
}