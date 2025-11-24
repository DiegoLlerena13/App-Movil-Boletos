// ===== MANTENIMIENTO DE BOLETOS MEJORADO =====

let boletos = [];
let filteredBoletos = [];
let currentBoleto = null;
let pasajeros = [];
let destinos = [];
let cajeros = [];
let currentSelectorType = null;
let currentFilterBoleto = 'all';
let currentSortBoleto = 'numeroBoleto-desc';

// Inicializar
async function initBoletos() {
    await loadBoletos();
    await loadRelatedData();
    setupSearchListenerBoleto();
}

// Cargar boletos
async function loadBoletos() {
    boletos = await getAllFromStore('boletos');
    applyFiltersAndSortBoletos();
}

// Cargar datos relacionados
async function loadRelatedData() {
    pasajeros = await getActiveRecords('pasajeros');
    destinos = await getActiveRecords('destinos');
    cajeros = await getActiveRecords('cajeros');
}

// Aplicar filtros y ordenamiento
function applyFiltersAndSortBoletos() {
    // Aplicar filtro
    if (currentFilterBoleto === 'all') {
        filteredBoletos = [...boletos];
    } else {
        filteredBoletos = boletos.filter(b => b.estadoRegistro === currentFilterBoleto);
    }

    // Aplicar ordenamiento
    const [field, order] = currentSortBoleto.split('-');
    
    filteredBoletos.sort((a, b) => {
        let compareA, compareB;
        
        switch(field) {
            case 'numeroBoleto':
                compareA = a.numeroBoleto;
                compareB = b.numeroBoleto;
                return order === 'asc' ? compareA - compareB : compareB - compareA;
                
            case 'fechaViaje':
                compareA = new Date(a.fechaViaje);
                compareB = new Date(b.fechaViaje);
                return order === 'asc' ? compareA - compareB : compareB - compareA;
                
            case 'monto':
                compareA = parseFloat(a.monto) || 0;
                compareB = parseFloat(b.monto) || 0;
                return order === 'asc' ? compareA - compareB : compareB - compareA;
                
            case 'destino':
                compareA = (a.destinoNombre || '').toLowerCase();
                compareB = (b.destinoNombre || '').toLowerCase();
                return order === 'asc' 
                    ? compareA.localeCompare(compareB, 'es') 
                    : compareB.localeCompare(compareA, 'es');
                
            default:
                return 0;
        }
    });

    renderBoletos(filteredBoletos);
}

// Filtrar por estado
function filterByStatusBoleto(status) {
    currentFilterBoleto = status;
    
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.filter === status) {
            tab.classList.add('active');
        }
    });
    
    applyFiltersAndSortBoletos();
}

// Ordenar boletos
function sortBoletos(sortBy) {
    currentSortBoleto = sortBy;
    
    document.querySelectorAll('.sort-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.sort-button').classList.add('active');
    
    applyFiltersAndSortBoletos();
}

// Renderizar boletos
function renderBoletos(records) {
    const container = document.getElementById('listContainer');
    
    if (records.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                    <path d="M13 5v2"/>
                    <path d="M13 17v2"/>
                    <path d="M13 11v2"/>
                </svg>
                <p>No se encontraron boletos</p>
                <p style="font-size: 14px; margin-top: 5px;">Intenta cambiar los filtros o la búsqueda</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = records.map(boleto => `
        <div class="record-card boleto-card">
            <div class="boleto-header">
                <div class="boleto-number">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                    </svg>
                    Boleto #${boleto.numeroBoleto}
                </div>
                <span class="record-status ${getStatusClass(boleto.estadoRegistro)}">
                    ${getStatusLabel(boleto.estadoRegistro)}
                </span>
            </div>
            
            <div class="boleto-details">
                <div class="boleto-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>${boleto.pasajeroNombre || 'Sin pasajero'}</span>
                </div>
                <div class="boleto-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>${boleto.destinoNombre || 'Sin destino'}</span>
                </div>
                <div class="boleto-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>${formatDate(boleto.fechaViaje)}</span>
                </div>
                <div class="boleto-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    <span>Asiento: ${boleto.asiento}</span>
                </div>
                <div class="boleto-row boleto-price">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    <span style="font-size: 18px; font-weight: 700; color: var(--primary);">S/ ${boleto.monto}</span>
                </div>
            </div>

            <div class="record-actions">
                <button class="btn-icon btn-edit" onclick="editBoleto(${boleto.numeroBoleto})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar
                </button>
                ${boleto.estadoRegistro !== '*' ? `
                    <button class="btn-icon btn-toggle ${boleto.estadoRegistro === 'I' ? 'activate' : ''}" 
                            onclick="toggleBoletoStatus(${boleto.numeroBoleto})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                            <line x1="12" y1="2" x2="12" y2="12"/>
                        </svg>
                        ${boleto.estadoRegistro === 'A' ? 'Inactivar' : 'Activar'}
                    </button>
                ` : ''}
                <button class="btn-icon btn-delete" 
                        onclick="deleteBoleto(${boleto.numeroBoleto})" 
                        ${boleto.estadoRegistro === '*' ? 'disabled' : ''}>
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

// Configurar búsqueda
function setupSearchListenerBoleto() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        
        let baseRecords = currentFilterBoleto === 'all' 
            ? boletos 
            : boletos.filter(b => b.estadoRegistro === currentFilterBoleto);
        
        const searched = baseRecords.filter(b => 
            b.numeroBoleto?.toString().includes(term) ||
            b.pasajeroNombre?.toLowerCase().includes(term) ||
            b.destinoNombre?.toLowerCase().includes(term)
        );
        
        renderBoletos(searched);
    });
}

// Mostrar formulario de boleto
function showFormBoleto(boleto = null) {
    const modal = document.getElementById('formModal');
    const form = document.getElementById('boletoForm');
    const formTitle = document.getElementById('formTitle');
    
    if (boleto) {
        currentBoleto = {...boleto};
        formTitle.textContent = 'Editar Boleto';
    } else {
        const newNumero = boletos.length > 0 
            ? Math.max(...boletos.map(b => b.numeroBoleto)) + 1 
            : 1;
        const today = new Date().toISOString().split('T')[0];
        currentBoleto = {
            numeroBoleto: newNumero,
            fechaViaje: today,
            pasajero: '',
            pasajeroNombre: '',
            destino: '',
            destinoNombre: '',
            asiento: '',
            monto: '',
            cajero: '',
            cajeroNombre: '',
            estadoRegistro: 'A'
        };
        formTitle.textContent = 'Nuevo Boleto';
    }
    
    // Llenar campos
    document.getElementById('numeroBoleto').value = currentBoleto.numeroBoleto;
    document.getElementById('fechaViaje').value = currentBoleto.fechaViaje;
    document.getElementById('pasajero').value = currentBoleto.pasajero || '';
    document.getElementById('pasajeroNombre').value = currentBoleto.pasajeroNombre || '';
    document.getElementById('destino').value = currentBoleto.destino || '';
    document.getElementById('destinoNombre').value = currentBoleto.destinoNombre || '';
    document.getElementById('asiento').value = currentBoleto.asiento || '';
    document.getElementById('monto').value = currentBoleto.monto || '';
    document.getElementById('cajero').value = currentBoleto.cajero || '';
    document.getElementById('cajeroNombre').value = currentBoleto.cajeroNombre || '';
    
    modal.classList.add('active');
    
    // Configurar submit
    form.onsubmit = async (e) => {
        e.preventDefault();
        await saveBoleto();
    };
}

// Guardar boleto
async function saveBoleto() {
    currentBoleto.fechaViaje = document.getElementById('fechaViaje').value;
    currentBoleto.asiento = document.getElementById('asiento').value;
    currentBoleto.monto = document.getElementById('monto').value;
    
    if (!currentBoleto.pasajero || !currentBoleto.destino || !currentBoleto.cajero) {
        alert('⚠️ Por favor complete todos los campos requeridos:\n- Pasajero\n- Destino\n- Cajero');
        return;
    }
    
    if (!currentBoleto.asiento || !currentBoleto.monto) {
        alert('⚠️ Por favor complete el asiento y el monto');
        return;
    }
    
    await addToStore('boletos', currentBoleto);
    closeFormBoleto();
    await loadBoletos();
}

// Cerrar formulario
function closeFormBoleto() {
    const modal = document.getElementById('formModal');
    modal.classList.remove('active');
    currentBoleto = null;
}

// Editar boleto
async function editBoleto(numeroBoleto) {
    const boleto = await getFromStore('boletos', numeroBoleto);
    showFormBoleto(boleto);
}

// Eliminar boleto
async function deleteBoleto(numeroBoleto) {
    if (!confirm('¿Está seguro de que desea eliminar este boleto?')) return;
    
    const boleto = await getFromStore('boletos', numeroBoleto);
    boleto.estadoRegistro = '*';
    await addToStore('boletos', boleto);
    await loadBoletos();
}

// Cambiar estado del boleto
async function toggleBoletoStatus(numeroBoleto) {
    const boleto = await getFromStore('boletos', numeroBoleto);
    boleto.estadoRegistro = boleto.estadoRegistro === 'A' ? 'I' : 'A';
    await addToStore('boletos', boleto);
    await loadBoletos();
}

// Mostrar selector
function showSelector(type) {
    currentSelectorType = type;
    const modal = document.getElementById('selectorModal');
    const title = document.getElementById('selectorTitle');
    
    let data = [];
    let titleText = '';
    
    switch(type) {
        case 'pasajero':
            data = pasajeros;
            titleText = 'Seleccionar Pasajero';
            break;
        case 'destino':
            data = destinos;
            titleText = 'Seleccionar Destino';
            break;
        case 'cajero':
            data = cajeros;
            titleText = 'Seleccionar Cajero';
            break;
    }
    
    title.textContent = titleText;
    renderSelectorList(data);
    
    modal.classList.add('active');
    
    // Búsqueda en selector
    const searchInput = document.getElementById('selectorSearch');
    searchInput.value = '';
    searchInput.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = data.filter(item => 
            item.nombre.toLowerCase().includes(term) ||
            item.codigo.toString().includes(term)
        );
        renderSelectorList(filtered);
    };
}

// Renderizar lista del selector
function renderSelectorList(data) {
    const list = document.getElementById('selectorList');
    
    if (data.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <p>No hay registros activos disponibles</p>
            </div>
        `;
    } else {
        list.innerHTML = data.map(item => `
            <div class="selector-item" onclick="selectItem(${item.codigo})">
                <div class="selector-item-title">${item.nombre}</div>
                <div class="selector-item-subtitle">Código: ${item.codigo}</div>
            </div>
        `).join('');
    }
}

// Seleccionar item
function selectItem(codigo) {
    let selectedItem = null;
    
    switch(currentSelectorType) {
        case 'pasajero':
            selectedItem = pasajeros.find(p => p.codigo === codigo);
            if (selectedItem) {
                currentBoleto.pasajero = selectedItem.codigo;
                currentBoleto.pasajeroNombre = selectedItem.nombre;
                document.getElementById('pasajero').value = selectedItem.codigo;
                document.getElementById('pasajeroNombre').value = selectedItem.nombre;
            }
            break;
        case 'destino':
            selectedItem = destinos.find(d => d.codigo === codigo);
            if (selectedItem) {
                currentBoleto.destino = selectedItem.codigo;
                currentBoleto.destinoNombre = selectedItem.nombre;
                document.getElementById('destino').value = selectedItem.codigo;
                document.getElementById('destinoNombre').value = selectedItem.nombre;
            }
            break;
        case 'cajero':
            selectedItem = cajeros.find(c => c.codigo === codigo);
            if (selectedItem) {
                currentBoleto.cajero = selectedItem.codigo;
                currentBoleto.cajeroNombre = selectedItem.nombre;
                document.getElementById('cajero').value = selectedItem.codigo;
                document.getElementById('cajeroNombre').value = selectedItem.nombre;
            }
            break;
    }
    
    closeSelectorModal();
}

// Cerrar selector modal
function closeSelectorModal() {
    const modal = document.getElementById('selectorModal');
    modal.classList.remove('active');
    currentSelectorType = null;
}

// Formatear fecha
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long',day: 'numeric' };
const date = new Date(dateString + 'T00:00:00');
return date.toLocaleDateString('es-ES', options);
}
// Funciones auxiliares
function getStatusClass(status) {
switch(status) {
case 'A': return 'status-active';
case 'I': return 'status-inactive';
case '*': return 'status-deleted';
default: return '';
}
}
function getStatusLabel(status) {
switch(status) {
case 'A': return 'Activo';
case 'I': return 'Inactivo';
case '*': return 'Eliminado';
default: return '';
}
}