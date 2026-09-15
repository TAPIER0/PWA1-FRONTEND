# TeaLearning — Frontend (PWA1-FRONTEND)

Plataforma web de apoyo pedagógico adaptativo orientada a estudiantes diagnosticados con **Autismo Nivel 1 (Trastorno del Espectro Autista - TEA Nivel 1)**, desarrollada en el marco del **Proyecto de Aula y Proyecto de Grado / PGC** para la **Universidad de Cundinamarca (UDEC) — Periodo 2026-II**.

---

## 📌 Descripción del Proyecto

**TeaLearning** es una solución tecnológica inclusiva diseñada para mitigar las barreras de aprendizaje, la sobrecarga sensorial y la ansiedad ante cambios de rutina que experimentan estudiantes con condición del espectro autista Nivel 1 (previamente denominado Asperger).

El sistema implementa interfaces accesibles con **perfiles sensoriales dinámicos y personalizables**, estructuración de **rutinas visuales secuenciales y predecibles**, y módulos especializados para **estudiantes**, **acudientes** y **administradores**.

---

## 🧠 Principios de Accesibilidad y Diseño para TEA Nivel 1

El frontend fue diseñado siguiendo pautas de accesibilidad **WCAG 2.1 (Nivel AA/AAA)** y recomendaciones clínicas y pedagógicas para la neurodiversidad:

1. **Previsibilidad y Estructura**:
   - Rutinas visuales paso a paso con temporizadores claros y avisos preventivos para reducir la ansiedad de transición.
   - Indicadores visuales de progreso (completadas vs. pendientes).

2. **Paletas Sensoriales No Saturadas**:
   - Cuatro paletas de colores armónicas y de baja estimulación visual:
     - **Verde / Pastel Suave** (`#2F6E5C` / `#F4F6F5`): Fomenta la concentración y relajación.
     - **Neutro / Calmante** (`#55605A` / `#F6F7F6`): Minimiza cualquier distracción cromática.
     - **Lavanda Suave** (`#5B4E8C` / `#F5F3F7`): Ideal para reducción de sobrecarga sensorial.
     - **Arena Cálida** (`#9C7A4C` / `#FBF6EF`): Ambiente cálido y confortable.
   - Modo de **Alto Contraste** para baja visión o necesidades visuales específicas.

3. **Tipografía Adaptativa**:
   - Tipografía principal: **Atkinson Hyperlegible** (diseñada por el *Braille Institute* para maximizar la diferenciación de caracteres).
   - Tipografía alternativa: **OpenDyslexic** para estudiantes con rasgos de dislexia o dificultad en decodificación lectora.
   - Escala de tamaño ajustable (Pequeño, Normal, Grande, Muy Grande) y opción de mayor espaciado entre letras (*letter-spacing*).

4. **Control Sensorial del Entorno**:
   - Reducción total de animaciones y transiciones mediante clases dedicadas y respeto estricto a la directiva del sistema `prefers-reduced-motion`.
   - Soporte de síntesis de voz (*Text-to-Speech*) mediante la Web Speech API para lectura auditiva de instrucciones.
   - Conmutador para silenciar/activar avisos auditivos.
   - Modos de temporizador flexibles (estándar, extendido o sin temporizador) con advertencias anticipadas.

5. **Navegación Intuitiva y Sin Frustración**:
   - Enfoque de teclado de alto contraste (`:focus-visible`) en todos los controles interactivos.
   - Textos claros, libres de ambigüedades, metáforas complejas o lenguaje figurado.

---

## 🖥️ Módulos e Interfaces

| Archivo | Módulo | Descripción |
| :--- | :--- | :--- |
| **`login.html`** | **Inicio de Sesión** | Pantalla de ingreso con validaciones en tiempo real, conmutador de visibilidad de contraseña, y panel superior de ajustes sensoriales disponible antes de iniciar sesión. |
| **`Interfaz_Estudiante.html`** | **Portal del Estudiante ("Mi rutina de hoy")** | Interfaz limpia y minimalista. Muestra el saludo personalizado, barra de avance, lista secuencial de actividades pedagógicas con soporte de lectura por voz y temporizadores. |
| **`Interfaz_Acudiente.html`** | **Portal del Acudiente** | Panel de control para padres/tutores. Permite personalizar en tiempo real la paleta de colores, tipografía, audio, reducción de movimiento y temporizadores con vista previa interactiva antes de guardar en el servidor. |
| **`Interfaz_Admin.html`** | **Portal de Administración** | Gestión integral de usuarios (estudiantes, acudientes, docentes, administradores), búsqueda en tiempo real, filtros por rol y estado, paginación, creación y edición de roles conectados a la base de datos. |

---

## 🛠️ Tecnologías y Arquitectura

- **Frontend**:
  - **HTML5 Semántico**: Estructura accesible con atributos ARIA (`aria-live`, `aria-pressed`, etc.).
  - **CSS3 Moderno**: Tokens mediante variables CSS (`--primary`, `--bg`, `--surface`, `--font-scale`), flexbox y layouts adaptativos.
  - **JavaScript Vanilla (ES6+)**: Programación asíncrona (`async/await`), Fetch API y Web Speech API, sin dependencias pesadas de frameworks para garantizar un rendimiento óptimo en cualquier dispositivo.

- **Capa de Comunicación (`api-client.js`)**:
  - Centraliza las peticiones HTTP a la API REST.
  - Gestión de autenticación con tokens **JWT** (`tea_token`), Refresh Tokens y datos de usuario en `localStorage`.
  - Control de acceso basado en roles (**RBAC**): `requireAuth(['Estudiante'])`, `requireAuth(['Acudiente', 'Administrador'])`, etc.
  - Manejo de redirección automática por rol (`redirectToRoleHome`).
  - Interceptor de errores `401 Unauthorized` con expiración de sesión segura.

- **Servidor de Desarrollo (`server.js`)**:
  - Servidor ligero implementado con el módulo nativo `http` de **Node.js** en el puerto `5500`.
  - Soporte de tipos MIME (`.html`, `.js`, `.css`, `.json`, `.svg`, etc.) y cabeceras CORS.

- **Backend Relacionado (Externo)**:
  - API REST en **.NET 9** (`http://localhost:5264/api`).
  - Base de datos relacional **Microsoft SQL Server**.

---

## 📁 Estructura del Repositorio

```text
PWA1-FRONTEND/
├── .gitignore               # Exclusiones de control de versiones
├── README.md                # Documentación principal del proyecto
├── api-client.js            # Cliente HTTP, autenticación JWT y control de roles
├── server.js                # Servidor HTTP local en Node.js (puerto 5500)
├── login.html               # Vista de autenticación con pre-ajustes sensoriales
├── Interfaz_Estudiante.html # Vista del estudiante (rutina visual y seguimiento)
├── Interfaz_Acudiente.html  # Vista del acudiente (configuración sensorial)
└── Interfaz_Admin.html      # Vista del administrador (gestión de usuarios)
```

---

## 🚀 Puesta en Marcha

### Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 16 o superior) instalado en el sistema, **o** cualquier servidor de archivos estáticos (Live Server en VS Code, `python -m http.server`, etc.).
- *(Opcional)* Backend de TeaLearning en **.NET 9** ejecutándose en `http://localhost:5264`. Si el backend no está activo, las interfaces cuentan con mecanismos de contingencia (datos locales de respaldo) para pruebas de maquetación y diseño visual.

### Pasos de Ejecución

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/TAPIER0/PWA1-FRONTEND.git
   cd PWA1-FRONTEND
   ```

2. **Iniciar el servidor local con Node.js:**
   ```bash
   node server.js
   ```

3. **Abrir en el navegador:**
   Ingresa a:
   ```text
   http://127.0.0.1:5500/login.html
   ```
   *(o `http://localhost:5500`)*

---

## 🔌 Endpoints de la API Consumidos

| Módulo | Método | Endpoint | Propósito |
| :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Iniciar sesión y obtener token JWT con claims de rol |
| **Auth** | `POST` | `/api/auth/register` | Registro de nuevos usuarios desde el panel de administración |
| **Usuarios** | `GET` | `/api/users` | Listado general de usuarios registrados |
| **Usuarios** | `PUT` | `/api/users/{id}/roles` | Actualización de roles de un usuario |
| **Estudiante** | `GET` | `/api/students/me/profile` | Perfil del estudiante autenticado |
| **Estudiante** | `GET` | `/api/students/me/daily-routine` | Rutina de actividades asignadas para el día |
| **Sensorial** | `GET` | `/api/students/{id}/sensory-preferences` | Obtener las preferencias sensoriales configuradas |
| **Sensorial** | `PUT` | `/api/students/{id}/sensory-preferences` | Guardar/actualizar las preferencias sensoriales |

---

## 👥 Roles del Sistema

- **Estudiante**: Acceso exclusivo a `Interfaz_Estudiante.html` con personalizaciones sensoriales activas.
- **Acudiente**: Acceso a `Interfaz_Acudiente.html` para supervisar y ajustar perfiles sensoriales de los estudiantes a su cargo.
- **Administrador**: Acceso a `Interfaz_Admin.html` y gestión general del sistema.
- **Docente**: Rol pedagógico para asignación de rutinas y actividades.

---

## 🎓 Información Institucional

- **Institución**: Universidad de Cundinamarca (UDEC)
- **Periodo Académico**: 2026-II
- **Modalidad**: Proyecto de Aula / PGC (Proyecto de Grado de Carrera)
- **Área**: Ingeniería de Sistemas / Software Inclusivo y Accesibilidad Web
