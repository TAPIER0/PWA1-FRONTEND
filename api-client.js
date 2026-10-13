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
    try {
      localStorage.removeItem('tea_token');
      localStorage.removeItem('tea_refresh_token');
      localStorage.removeItem('tea_user');
      sessionStorage.clear();
    } catch (e) {}
  },

  logout() {
    this.clearSession();
    window.location.replace('login.html');
  },

  requireAuth(allowedRoles = []) {
    // Escuchar eventos de restauración de historial (bfcache / Back-Forward Cache)
    if (!window._teaPageShowListenerAttached) {
      window._teaPageShowListenerAttached = true;
      window.addEventListener('pageshow', (event) => {
        if (event.persisted || !this.getToken() || !this.getUser()) {
          if (!this.getToken() || !this.getUser()) {
            window.location.replace('login.html');
          }
        }
      });
    }

    const token = this.getToken();
    const user = this.getUser();

    if (!token || !user) {
      window.location.replace('login.html');
      return false;
    }

    if (allowedRoles.length > 0) {
      const roles = user.roles || [];
      const hasRole = roles.some(r => allowedRoles.includes(r));
      if (!hasRole) {
        window.location.replace('error.html?code=403&roles=' + encodeURIComponent(roles.join(',')));
        return false;
      }
    }

    return true;
  },

  redirectToRoleHome(user) {
    const roles = (user && user.roles) ? user.roles : [];
    if (roles.includes('Estudiante')) {
      window.location.replace('Interfaz_Estudiante.html');
    } else if (roles.includes('Acudiente')) {
      window.location.replace('Interfaz_Acudiente.html');
    } else if (roles.includes('Docente') || roles.includes('Profesor')) {
      window.location.replace('Interfaz_Docente.html');
    } else if (roles.includes('Administrador')) {
      window.location.replace('Interfaz_Admin.html');
    } else {
      window.location.replace('login.html');
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
        window.location.replace('login.html');
        throw new Error('Sesión expirada o no autorizada.');
      }

      if (response.status === 204) {
        return { ok: true, status: 204, data: { success: true } };
      }

      const text = await response.text();
      let json = null;
      if (text && text.trim().length > 0) {
        try {
          json = JSON.parse(text);
        } catch (e) {
          json = { success: response.ok, message: text };
        }
      } else {
        json = { success: response.ok };
      }

      return { ok: response.ok, status: response.status, data: json };
    } catch (err) {
      console.error(`[API Error] Error en llamada a ${url}:`, err);
      throw err;
    }
  },

  async getStudents() {
    const res = await this.request('/students');
    return res.data;
  }
};
