// ===== AUTENTICACIÓN =====

// Verificar si el usuario está autenticado
function checkAuth() {
    const usuario = localStorage.getItem('usuarioActual');
    if (!usuario) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Cerrar sesión
function logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('usuarioActual');
        window.location.href = 'index.html';
    }
}