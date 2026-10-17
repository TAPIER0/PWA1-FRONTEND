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

  _refreshPromise: null,

  getRefreshToken() {
    return localStorage.getItem('tea_refresh_token');
  },

  async tryRefreshToken() {
    if (this._refreshPromise) {
      return this._refreshPromise;
    }

    const accessToken = this.getToken();
    const refreshToken = this.getRefreshToken();
    if (!accessToken || !refreshToken) {
      return false;
    }

    this._refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, refreshToken })
        });
        if (!res.ok) return false;
        const payload = await res.json();
        const authData = payload && payload.data ? payload.data : null;
        if (authData && authData.token) {
          this.saveSession(authData);
          return true;
        }
        return false;
      } catch (e) {
        return false;
      } finally {
        this._refreshPromise = null;
      }
    })();

    return this._refreshPromise;
  },

  async request(endpoint, options = {}, _isRetry = false) {
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

    if (fetchOptions.body instanceof FormData) {
      delete headers['Content-Type'];
    } else if (fetchOptions.body && typeof fetchOptions.body === 'object') {
      fetchOptions.body = JSON.stringify(fetchOptions.body);
    }

    try {
      const response = await fetch(url, fetchOptions);

      if (response.status === 401) {
        const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/refresh-token');
        if (!_isRetry && !isAuthEndpoint && await this.tryRefreshToken()) {
          return this.request(endpoint, options, true);
        }
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

  resolveAvatarUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('/uploads/avatars/')) {
      const base = this.baseUrl.replace(/\/api\/?$/, '');
      return `${base}${trimmed}`;
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          return parsed.href;
        }
      } catch (e) {
        return '';
      }
    }
    const base = this.baseUrl.replace(/\/api\/?$/, '');
    return `${base}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await this.request('/users/me/avatar', {
      method: 'POST',
      body: formData
    });
    if (res.ok && res.data && res.data.data) {
      this.saveSession({ user: res.data.data });
    }
    return res;
  },

  async removeAvatar() {
    const res = await this.request('/users/me/avatar', {
      method: 'DELETE'
    });
    if (res.ok) {
      const user = this.getUser();
      if (user) {
        user.avatarUrl = null;
        this.saveSession({ user });
      }
    }
    return res;
  },

  async getMe() {
    try {
      const res = await this.request('/users/me');
      if (res.ok && res.data && res.data.data) {
        this.saveSession({ user: res.data.data });
      }
      return res;
    } catch (e) {
      return null;
    }
  },

  renderAvatar(container, avatarUrl) {
    if (!container) return;
    container.innerHTML = '';
    if (avatarUrl) {
      container.style.overflow = 'hidden';
      const img = document.createElement('img');
      img.src = this.resolveAvatarUrl(avatarUrl);
      img.alt = 'Foto de perfil';
      img.className = 'tea-avatar-img';
      container.appendChild(img);
    } else {
      container.style.overflow = '';
    }
  },

  initAvatarFeature(options = {}) {
    const triggerSelector = options.triggerSelector || '.brand-mark, .avatar';
    const shape = options.shape || 'rounded'; // 'circle' | 'rounded'
    const extraSelectors = options.extraSelectors || ['.admin-avatar'];

    // Inyectar estilos necesarios una sola vez
    if (!document.getElementById('tea-avatar-styles')) {
      const style = document.createElement('style');
      style.id = 'tea-avatar-styles';
      style.textContent = `
        .tea-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: inherit;
        }
        .tea-avatar-clickable {
          cursor: pointer !important;
          position: relative !important;
          overflow: hidden !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .tea-avatar-clickable:hover {
          transform: scale(1.06) !important;
          box-shadow: 0 0 0 2px var(--primary, #0D7A5F) !important;
        }
        .tea-avatar-clickable:focus-visible {
          outline: 3px solid var(--primary, #0D7A5F) !important;
          outline-offset: 2px !important;
        }
        .tea-avatar-modal-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(32, 38, 35, 0.55);
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 99999;
          backdrop-filter: blur(2px);
        }
        .tea-avatar-modal-overlay.open {
          display: flex;
        }
        .tea-avatar-modal-card {
          background: var(--surface, #ffffff);
          border: 1px solid var(--border, #e2e8f0);
          border-radius: var(--radius, 16px);
          max-width: 420px;
          width: 100%;
          padding: 26px 24px;
          box-shadow: 0 16px 36px rgba(0,0,0,0.2);
          text-align: center;
          animation: teaModalPop 0.2s ease-out;
        }
        @keyframes teaModalPop {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .tea-avatar-preview {
          width: 100px;
          height: 100px;
          margin: 16px auto 18px;
          background: var(--primary, #0D7A5F);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--surface, #fff);
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }
        .tea-avatar-preview.circle {
          border-radius: 50%;
        }
        .tea-avatar-preview.rounded {
          border-radius: 20px;
        }
        .tea-avatar-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 14px;
        }
        .tea-avatar-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 18px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 14.5px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: background 0.15s, opacity 0.15s;
          font-family: inherit;
        }
        .tea-avatar-btn-primary {
          background: var(--primary, #0D7A5F);
          color: #ffffff;
        }
        .tea-avatar-btn-primary:hover {
          opacity: 0.92;
        }
        .tea-avatar-btn-danger {
          background: #fff0f0;
          color: #dc2626;
          border-color: #fecaca;
        }
        .tea-avatar-btn-danger:hover {
          background: #fee2e2;
        }
        .tea-avatar-btn-ghost {
          background: transparent;
          color: var(--text-muted, #64748b);
          border-color: var(--border, #e2e8f0);
        }
        .tea-avatar-btn-ghost:hover {
          background: var(--bg, #f8fafc);
        }
        .tea-avatar-msg {
          font-size: 13.5px;
          margin-top: 10px;
          min-height: 20px;
          font-weight: 600;
        }
        .tea-avatar-msg.success { color: #16a34a; }
        .tea-avatar-msg.error { color: #dc2626; }
        .tea-avatar-msg.info { color: #2563eb; }
      `;
      document.head.appendChild(style);
    }

    const triggers = document.querySelectorAll(triggerSelector);
    const extraEls = extraSelectors.flatMap(sel => Array.from(document.querySelectorAll(sel)));

    // Modal DOM
    let modalOverlay = document.getElementById('tea-avatar-modal');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = 'tea-avatar-modal';
      modalOverlay.className = 'tea-avatar-modal-overlay';
      modalOverlay.setAttribute('role', 'dialog');
      modalOverlay.setAttribute('aria-modal', 'true');
      modalOverlay.setAttribute('aria-labelledby', 'tea-avatar-title');

      modalOverlay.innerHTML = `
        <div class="tea-avatar-modal-card">
          <h2 id="tea-avatar-title" style="margin:0 0 6px 0; font-size:19px;">Personalizar foto de perfil</h2>
          <p style="margin:0; font-size:13.5px; color:var(--text-muted, #64748b);">
            Haz visible tu foto en tu espacio de aprendizaje.
          </p>

          <div class="tea-avatar-preview ${shape === 'circle' ? 'circle' : 'rounded'}" id="tea-avatar-preview-box"></div>

          <input type="file" id="tea-avatar-file-input" accept="image/png, image/jpeg, image/webp, image/gif" style="display:none;" />

          <div class="tea-avatar-actions">
            <button type="button" class="tea-avatar-btn tea-avatar-btn-primary" id="tea-avatar-btn-choose">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>Subir nueva foto</span>
            </button>
            <button type="button" class="tea-avatar-btn tea-avatar-btn-danger" id="tea-avatar-btn-remove" style="display:none;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              <span>Quitar foto actual</span>
            </button>
            <button type="button" class="tea-avatar-btn tea-avatar-btn-ghost" id="tea-avatar-btn-close">
              Cerrar
            </button>
          </div>

          <div class="tea-avatar-msg" id="tea-avatar-msg"></div>
        </div>
      `;
      document.body.appendChild(modalOverlay);
    }

    const previewBox = document.getElementById('tea-avatar-preview-box');
    const fileInput = document.getElementById('tea-avatar-file-input');
    const btnChoose = document.getElementById('tea-avatar-btn-choose');
    const btnRemove = document.getElementById('tea-avatar-btn-remove');
    const btnClose = document.getElementById('tea-avatar-btn-close');
    const msgEl = document.getElementById('tea-avatar-msg');

    const updateAllAvatars = (url) => {
      triggers.forEach(el => ApiClient.renderAvatar(el, url));
      extraEls.forEach(el => ApiClient.renderAvatar(el, url));
      ApiClient.renderAvatar(previewBox, url);
      btnRemove.style.display = url ? 'inline-flex' : 'none';
    };

    const showMsg = (text, type = 'info') => {
      msgEl.textContent = text;
      msgEl.className = `tea-avatar-msg ${type}`;
    };

    const openModal = () => {
      const user = ApiClient.getUser();
      const currentUrl = user ? user.avatarUrl : null;
      updateAllAvatars(currentUrl);
      showMsg('');
      modalOverlay.classList.add('open');
      btnChoose.focus();
    };

    const closeModal = () => {
      modalOverlay.classList.remove('open');
      fileInput.value = '';
    };

    const allClickable = [...triggers, ...extraEls];
    allClickable.forEach(el => {
      el.removeAttribute('aria-hidden');
      el.classList.add('tea-avatar-clickable');
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', 'Cambiar foto de perfil');
      el.setAttribute('title', 'Haz clic para personalizar tu foto de perfil');
      el.addEventListener('click', openModal);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal();
        }
      });
    });

    btnChoose.addEventListener('click', () => fileInput.click());
    btnClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
    });

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;

      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type.toLowerCase())) {
        showMsg('Formato no permitido. Usa JPG, PNG, WebP o GIF.', 'error');
        fileInput.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showMsg('La imagen supera el límite máximo de 5 MB.', 'error');
        fileInput.value = '';
        return;
      }

      btnChoose.disabled = true;
      btnRemove.disabled = true;
      showMsg('Subiendo foto de perfil...', 'info');

      try {
        const res = await ApiClient.uploadAvatar(file);
        if (res.ok && res.data && res.data.success) {
          const updatedUser = res.data.data;
          updateAllAvatars(updatedUser.avatarUrl);
          showMsg('¡Foto de perfil actualizada con éxito!', 'success');
          setTimeout(() => closeModal(), 1100);
        } else {
          showMsg((res.data && res.data.message) || 'No se pudo subir la foto.', 'error');
        }
      } catch (err) {
        showMsg(err.message || 'Error de conexión al subir la imagen.', 'error');
      } finally {
        btnChoose.disabled = false;
        btnRemove.disabled = false;
        fileInput.value = '';
      }
    });

    btnRemove.addEventListener('click', async () => {
      btnChoose.disabled = true;
      btnRemove.disabled = true;
      showMsg('Eliminando foto de perfil...', 'info');

      try {
        const res = await ApiClient.removeAvatar();
        if (res.ok && res.data && res.data.success) {
          updateAllAvatars(null);
          showMsg('Se restauró el distintivo por defecto.', 'success');
          setTimeout(() => closeModal(), 900);
        } else {
          showMsg((res.data && res.data.message) || 'No se pudo eliminar la foto.', 'error');
        }
      } catch (err) {
        showMsg(err.message || 'Error de conexión al eliminar la foto.', 'error');
      } finally {
        btnChoose.disabled = false;
        btnRemove.disabled = false;
      }
    });

    // Renderizar avatar inicial si existe en sesión
    const initialUser = ApiClient.getUser();
    if (initialUser && initialUser.avatarUrl) {
      updateAllAvatars(initialUser.avatarUrl);
    }

    // Sincronizar en segundo plano con el servidor
    ApiClient.getMe().then(res => {
      if (res && res.data && res.data.data) {
        updateAllAvatars(res.data.data.avatarUrl);
      }
    });
  },

  async getStudents() {
    const res = await this.request('/students');
    return res.data;
  },

  async resetStudentPassword(studentId, newPassword, confirmPassword) {
    return await this.request(`/guardian/students/${encodeURIComponent(studentId)}/reset-password`, {
      method: 'POST',
      body: { newPassword, confirmPassword }
    });
  }
};
