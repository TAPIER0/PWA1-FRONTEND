// ============================================================================
// Sendero / TeaLearning — Utilidades compartidas de forgot-password / reset-password
// Las páginas son públicas (sin sesión), por eso usan fetch directo: ApiClient.request
// redirige a login ante un 401 y agrega el JWT, lo cual no aplica aquí.
// ============================================================================
const Recovery = {
  /** Panel "Ajustar la pantalla a tu comodidad" (tamaño de texto y contraste), igual que login.html. */
  initSettings() {
    const root = document.getElementById('root');
    const toggle = document.getElementById('settings-toggle');
    const body = document.getElementById('settings-body');
    const chevron = document.getElementById('chevron');

    toggle.addEventListener('click', () => {
      const isOpen = body.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      chevron.textContent = isOpen ? 'Ocultar ▴' : 'Mostrar ▾';
    });

    document.querySelectorAll('[data-scale]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-scale]').forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        document.documentElement.style.setProperty('--font-scale', btn.dataset.scale);
      });
    });

    document.querySelectorAll('.opt-btn[data-contrast]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.opt-btn[data-contrast]').forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        root.setAttribute('data-contrast', btn.dataset.contrast);
      });
    });
  },

  /** Botón Mostrar/Ocultar para un campo de contraseña. */
  bindPasswordToggle(button, input) {
    button.addEventListener('click', () => {
      const hidden = input.type === 'password';
      input.type = hidden ? 'text' : 'password';
      button.textContent = hidden ? 'Ocultar' : 'Mostrar';
      button.setAttribute('aria-pressed', String(hidden));
    });
  },

  /** Muestra un mensaje en una región .msg (tipo: error | ok | info) con lista opcional de detalles. */
  showMessage(el, type, text, details) {
    el.className = 'msg ' + type;
    el.textContent = text;
    if (details && details.length) {
      const ul = document.createElement('ul');
      details.forEach(d => { const li = document.createElement('li'); li.textContent = d; ul.appendChild(li); });
      el.appendChild(ul);
    }
    el.hidden = false;
  },

  hideMessage(el) {
    el.hidden = true;
    el.textContent = '';
  },

  /** POST JSON tolerante a respuestas sin cuerpo (por ejemplo el 429 del limitador de solicitudes). */
  async postJson(path, body) {
    const response = await fetch(`${ApiClient.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    let data = null;
    try { data = await response.json(); } catch (e) { /* sin cuerpo JSON */ }
    return { ok: response.ok, status: response.status, data };
  },

  /** Mensaje legible a partir de la respuesta del API (ApiResponse o ProblemDetails RFC 7807). */
  describeError(res) {
    if (res.status === 429) {
      return { text: 'Hiciste muchas solicitudes seguidas. Espera unos minutos e inténtalo de nuevo.', details: [] };
    }
    const d = res.data || {};
    const text = d.message || d.title || d.detail || 'No fue posible completar la solicitud. Inténtalo de nuevo.';
    const details = Array.isArray(d.errors) ? d.errors.filter(e => e && e !== text) : [];
    return { text, details };
  }
};
