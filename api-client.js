// ============================================================================
// TeaLearning - Cliente de Conexión a la API (.NET 9)
// ============================================================================

const API_BASE_URL = 'http://localhost:5264/api';

const ApiClient = {
  baseUrl: API_BASE_URL,

  getToken() {
    return localStorage.getItem('tea_token');
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('tea_user') || 'null');
    } catch (e) {
      return null;
    }
  },

  saveSession(authData) {
    if (authData.token) localStorage.setItem('tea_token', authData.token);
    if (authData.refreshToken) localStorage.setItem('tea_refresh_token', authData.refreshToken);
    if (authData.user) localStorage.setItem('tea_user', JSON.stringify(authData.user));
  },

  clearSession() {
    localStorage.removeItem('tea_token');
    localStorage.removeItem('tea_refresh_token');
    localStorage.removeItem('tea_user');
  },

  logout() {
    this.clearSession();
    window.location.href = 'login_Rework.html';
  },

  requireAuth(allowedRoles = []) {
    const token = this.getToken();
    const user = this.getUser();

    if (!token || !user) {
      window.location.href = 'login_Rework.html';
      return false;
    }

    if (allowedRoles.length > 0) {
      const roles = user.roles || [];
      const hasRole = roles.some(r => allowedRoles.includes(r));
      if (!hasRole) {
        alert(`No tienes permisos para acceder a esta sección con el rol "${roles.join(', ')}".`);
        this.redirectToRoleHome(user);
        return false;
      }
    }

    return true;
  },

  redirectToRoleHome(user) {
    const roles = (user && user.roles) ? user.roles : [];
    if (roles.includes('Estudiante')) {
      window.location.href = 'Interfaz_Estudiante.html';
    } else if (roles.includes('Acudiente')) {
      window.location.href = 'Interfaz_Acudiente.html';
    } else if (roles.includes('Docente') || roles.includes('Profesor')) {
      window.location.href = 'Interfaz_Docente.html';
    } else if (roles.includes('Administrador')) {
      window.location.href = 'Interfaz_Admin2.html';
    } else {
      window.location.href = 'login_Rework.html';
    }
  },

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions = {
      ...options,
      headers
    };

    if (fetchOptions.body && typeof fetchOptions.body === 'object' && !(fetchOptions.body instanceof FormData)) {
      fetchOptions.body = JSON.stringify(fetchOptions.body);
    }

    try {
      const response = await fetch(url, fetchOptions);

      if (response.status === 401) {
        this.clearSession();
        window.location.href = 'login_Rework.html';
        throw new Error('Sesión expirada o no autorizada.');
      }

      const json = await response.json();
      return { ok: response.ok, status: response.status, data: json };
    } catch (err) {
      console.error(`[API Error] Error en llamada a ${url}:`, err);
      throw err;
    }
  }
};
