# Sendero / TeaLearning — Frontend (PWA1-FRONTEND)

Plataforma web de apoyo pedagógico adaptativo orientada a estudiantes diagnosticados con **Autismo Nivel 1 (Trastorno del Espectro Autista - TEA Nivel 1)**, desarrollada en el marco del **Proyecto de Aula y Proyecto de Grado / PGC** para la **Universidad de Cundinamarca (UDEC) — Periodo 2026-II**.

---

## 📌 Visión General y Estado del Proyecto

**Sendero (TeaLearning)** es un ecosistema tecnológico inclusivo creado para estructurar rutinas pedagógicas predecibles, reducir la sobrecarga sensorial y mitigar la ansiedad ante transiciones de actividad en estudiantes con TEA Nivel 1.

El proyecto ha completado exitosamente las metas de los **Sprints 1 y 2**, integrando arquitectura desacoplada, diseño accesible bajo estándares **WCAG 2.1 (AA/AAA)**, parametrización pedagógica con modelos de datos híbridos (JSON dinámico en SQL Server) y telemetría de ejecución en tiempo real.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SENDERO FRONTEND                                │
│                                                                             │
│  [ Landing General ] ──> [ Login Adaptativo ] ──> [ Control de Roles RBAC ] │
│  (Interfaz_General)       (login_Rework)                  │                 │
│                                                           │                 │
│         ┌───────────────────┬───────────────────┬─────────┴─────────┐       │
│         ▼                   ▼                   ▼                   ▼       │
│   [Estudiante]         [Acudiente]          [Docente]         [Admin]       │
│  Rutina Visual &    Perfil Sensorial &    Actividades &     Catálogo &      │
│  Telemetría HU-006     Preview HU-003    Asignación HU-004  Módulos HU-007  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                         REST API (.NET 9) + SQL Server
```

---

## 📋 Matriz de Requerimientos y Product Backlog

### 🟢 SPRINT 1: Cimientos de Arquitectura, Autenticación RBAC y Perfil Sensorial

| Historia de Usuario | Pts | Módulo / Funcionalidad | Descripción e Implementación Frontend |
| :--- | :---: | :--- | :--- |
| **HU-001** | 5 | **Gestión de Usuarios y Roles (RBAC)** | Autenticación y registro con `UserManager<ApplicationUser>` y `RoleManager<IdentityRole>`. Endpoints: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/refresh-token`, `GET /api/users` y `PUT /api/users/{id}/roles`. Implementado en [`login_Rework.html`](login_Rework.html) y [`Interfaz_Admin2.html`](Interfaz_Admin2.html). |
| **HU-002** | 5 | **Rutina Visual de Actividades** | Visualización cronológica y estructurada de la jornada (`GET /api/students/me/daily-routine`). Actividades ordenadas estrictamente por su `OrdenSecuencial` con estados (`Pendiente`, `EnProgreso`, `Completada`). Implementado en [`Interfaz_Estudiante.html`](Interfaz_Estudiante.html). |
| **HU-003** | 5 | **Configuración Sensorial Adaptativa** | Configuración de la entidad `SensoryPreference` (`GET` y `PUT /api/students/{id}/sensory-preferences`): paleta cromática, tipografía legible/dislexia, escala tipográfica (1-4), audio/TTS, reducción de movimiento y temporizadores. Implementado en [`Interfaz_Acudiente.html`](Interfaz_Acudiente.html) con propagación dinámica a la vista del estudiante. |

---

### 🚀 SPRINT 2: Gestión Pedagógica, Módulos y Ejecución de Actividades

| Historia de Usuario | Pts | Módulo / Funcionalidad | Descripción e Implementación Frontend |
| :--- | :---: | :--- | :--- |
| **HU-007** | 3 | **Configuración de Módulos Temáticos** | CRUD administrativo de Categorías y Módulos de aprendizaje (`GET, POST, PUT, DELETE /api/categories` y `/api/modules`). Incluye control de integridad referencial (bloqueo de eliminación si existen dependencias vinculadas) y ordenación pedagógica. Implementado en [`Interfaz_Admin2.html`](Interfaz_Admin2.html). |
| **HU-004** | 8 | **Creación y Parametrización de Actividades** | Panel docente para crear actividades (`POST, PUT, DELETE /api/activities`). **Modelo de datos híbrido**: metadatos relacionales (`Titulo`, `Descripcion`, `TipoActividad`, `ObjetivoPedagogico`, `ModuloId`) combinados con la columna dinámica **`ConfigJson`** (`NVARCHAR(MAX)`) para almacenar secuencias lógicas o pares de emparejamiento sin modificar el esquema relacional. Incluye un **detector de lenguaje figurado/metafórico** en tiempo real para preservar literalidad cognitiva. Implementado en [`Interfaz_Docente.html`](Interfaz_Docente.html). |
| **HU-005** | 3 | **Asignación de Actividades** | Asignación directa e individual o en lote (`POST /api/assignments`), definiendo `fechaInicio`, `fechaLimite`, `ordenSecuencial` y `prioridad`. Gestión integrada en el modal de guardado de actividades en [`Interfaz_Docente.html`](Interfaz_Docente.html). |
| **HU-006** | 8 | **Ejecución y Registro de Intentos** | Flujo completo de ejecución del estudiante: inicio de actividad (`POST /api/activities/{assignmentId}/start`), renderizado del ejercicio basado en `ConfigJson` y envío de **telemetría de rendimiento** al completar (`POST /api/activities/{assignmentId}/submit`): `tiempoRespuestaSegundos` (cronometrado), `cantidadIntentosFallidos`, `cantidadAciertos` y `completadaExitosamente`. Implementado en [`Interfaz_Estudiante.html`](Interfaz_Estudiante.html). |

---

## 🧠 Principios de Neurodiversidad y Accesibilidad (TEA Nivel 1)

1. **Previsibilidad y Reducción de Ansiedad**:
   - Secuencia visual paso a paso de actividades del día.
   - Temporizadores preventivos con alertas auditivas y visuales configurables ("Esta actividad cambiará en X segundos") o modo "sin temporizador" para evitar la ansiedad por competencia.
2. **Estimulación Visual Equilibrada y Paletas Sensoriales**:
   - **Verde / Pastel Suave** (`#2F6E5C` / `#F4F6F5`): Foco, tranquilidad y concentración.
   - **Neutro Calmante** (`#55605A` / `#F6F7F6`): Cero interferencias cromáticas.
   - **Lavanda Suave** (`#5B4E8C` / `#F5F3F7`): Relajación sensorial.
   - **Arena Cálida** (`#9C7A4C` / `#FBF6EF`): Calidez y confort.
   - **Modo Alto Contraste** conforme a directrices WCAG.
3. **Legibilidad y Decodificación Tipográfica**:
   - **Atkinson Hyperlegible** (Braille Institute) por defecto, diferenciando caracteres homólogos (ej. `I`, `l`, `1`).
   - Soporte para **OpenDyslexic**.
   - Ajustes de escala de fuente (Pequeño, Normal, Grande, Muy Grande) y espaciado de letras aumentado (*letter-spacing*).
4. **Claridad Pragmática del Lenguaje**:
   - Detector heurístico en el panel docente que alerta sobre modismos o lenguaje figurado (ej. *"a toda máquina"*, *"pan comido"*, *"en un abrir y cerrar de ojos"*), sugiriendo instrucciones literales y directas.
5. **Síntesis de Voz y Control Auditivo**:
   - Lectura de instrucciones mediante síntesis de voz (*Web Speech API*).
   - Interruptor global accesible para silenciar o activar estímulos sonoros.
6. **Movimiento y Enfoque Controlado**:
   - Respeta de forma estricta la directiva del sistema operativo `prefers-reduced-motion`.
   - Anillos de foco visibles (`:focus-visible`) para navegación 100% asistida por teclado.

---

## 🖥️ Módulos e Interfaces del Frontend

### 1. `Interfaz_General.html` — Portal General "Sendero"
- **Propósito**: Landing page pública orientada a la comunidad educativa, familias y docentes.
- **Diseño**: Estilo de vanguardia tecnológica (inspirado en NVIDIA/Apple), con carrusel interactivo por categorías, menú adaptativo, gráficos vectoriales originales y enlace directo a la plataforma. No requiere inicio de sesión.
- **Ruta por defecto**: Servida como raíz `/` en `server.js`.

### 2. `login_Rework.html` / `login.html` — Inicio de Sesión Adaptativo
- **Propósito**: Acceso centralizado con validación en tiempo real y pre-ajustes sensoriales (contraste y escala tipográfica utilizables antes de ingresar credenciales).
- **Seguridad**: Autenticación JWT (`POST /api/auth/login`), conmutador de visibilidad de contraseña y redirección dinámica según el rol del usuario autenticado.

### 3. `Interfaz_Estudiante.html` — Portal del Estudiante ("Mi rutina de hoy")
- **Propósito**: Interfaz de baja carga cognitiva para la ejecución de la rutina pedagógica diaria (HU-002, HU-006).
- **Funcionalidades**:
  - Saludo amigable y fecha contextualizada.
  - Barra de progreso diaria (porcentaje y contador de actividades).
  - Rutina secuencial paso a paso con renderizado dinámico del `ConfigJson` (secuencias lógicas o emparejamiento visual).
  - Notificación de inicio de actividad (`/start`) y telemetría de respuesta al enviar (`/submit`).
  - Lector por voz (*Text-to-Speech*) y temporizadores adaptables.

### 4. `Interfaz_Docente.html` — Gestión Pedagógica de Actividades
- **Propósito**: Creación, configuración y asignación de ejercicios interactivos para estudiantes con TEA (HU-004, HU-005).
- **Funcionalidades**:
  - Tabla de actividades con filtros por tipo (`Secuencia Lógica` o `Emparejamiento Visual`) y búsqueda.
  - Editor visual e interactivo de pasos/parejas con previsualización en vivo.
  - Asistente de lenguaje no figurado: advierte al docente si usa metáforas.
  - Asignación individual o múltiple a estudiantes con control de `ordenSecuencial` y `prioridad`.
  - Serialización automática en `ConfigJson` y consumo de endpoints `/api/activities` y `/api/assignments`.

### 5. `Interfaz_Acudiente.html` — Preferencias Sensoriales del Estudiante
- **Propósito**: Ajuste y calibración del entorno sensorial de cada estudiante a cargo (HU-003).
- **Funcionalidades**:
  - Selección de estudiante asignado.
  - Personalización en tiempo real con previsualizador interactivo: paletas cromáticas, tipografía, escala, audio/TTS, reducción de movimiento y temporizadores.
  - Guardado asíncrono hacia el backend (`PUT /api/students/{id}/sensory-preferences`).

### 6. `Interfaz_Admin2.html` — Administración y Catálogo Pedagógico
- **Propósito**: Panel administrativo global (HU-001, HU-007).
- **Funcionalidades**:
  - **Usuarios**: Gestión completa de cuentas (Estudiantes, Acudientes, Docentes, Administradores), filtros por rol y estado, asignación de roles (`/api/users/{id}/roles`) y registro (`/api/auth/register`).
  - **Categorías de Aprendizaje**: CRUD completo con paleta de color identificador y ordenación.
  - **Módulos Temáticos**: CRUD completo vinculado a categorías, contador de actividades y validaciones de eliminación protegida.

---

## 🔌 Matriz de Endpoints Consumidos

```text
Backend Base URL: http://localhost:5264/api
```

| Módulo | Método | Endpoint | Historia de Usuario | Descripción |
| :--- | :---: | :--- | :---: | :--- |
| **Auth** | `POST` | `/auth/login` | HU-001 | Autenticación y expedición de tokens JWT |
| **Auth** | `POST` | `/auth/register` | HU-001 | Registro de nuevos usuarios desde administración |
| **Usuarios** | `GET` | `/users` | HU-001 | Obtención de usuarios y roles registrados |
| **Usuarios** | `PUT` | `/users/{id}/roles` | HU-001 | Modificación de roles asignados a un usuario |
| **Categorías** | `GET` | `/categories` | HU-007 | Listado de categorías de aprendizaje |
| **Categorías** | `POST` | `/categories` | HU-007 | Creación de nueva categoría |
| **Categorías** | `PUT` | `/categories/{id}` | HU-007 | Edición de categoría |
| **Categorías** | `DELETE` | `/categories/{id}` | HU-007 | Eliminación protegida de categoría |
| **Módulos** | `GET` | `/modules?onlyActive={bool}` | HU-007 | Listado de módulos temáticos |
| **Módulos** | `POST` | `/modules` | HU-007 | Creación de módulo temático |
| **Módulos** | `PUT` | `/modules/{id}` | HU-007 | Edición de módulo temático |
| **Módulos** | `DELETE` | `/modules/{id}` | HU-007 | Eliminación de módulo temático |
| **Actividades**| `GET` | `/activities` | HU-004 | Catálogo de actividades docentes |
| **Actividades**| `POST` | `/activities` | HU-004 | Creación de actividad con metadata y `ConfigJson` |
| **Actividades**| `PUT` | `/activities/{id}` | HU-004 | Actualización de actividad y `ConfigJson` |
| **Actividades**| `DELETE`| `/activities/{id}` | HU-004 | Eliminación de actividad |
| **Asignaciones**| `GET` | `/assignments` | HU-005 | Asignaciones de actividades a estudiantes |
| **Asignaciones**| `POST`| `/assignments` | HU-005 | Asignación con orden secuencial y prioridad |
| **Ejecución** | `POST` | `/activities/{id}/start` | HU-006 | Notificación de inicio de actividad |
| **Ejecución** | `POST` | `/activities/{id}/submit` | HU-006 | Envío de telemetría de intento y tiempo |
| **Estudiante** | `GET` | `/students/me/profile` | HU-001 | Perfil del estudiante en sesión |
| **Estudiante** | `GET` | `/students/me/daily-routine`| HU-002 | Rutina secuencial del día |
| **Sensorial** | `GET` | `/students/{id}/sensory-preferences` | HU-003 | Consulta de preferencias sensoriales |
| **Sensorial** | `PUT` | `/students/{id}/sensory-preferences` | HU-003 | Actualización de preferencias sensoriales |

---

## 🧱 Modelo de Datos Híbrido (`ConfigJson`)

Para permitir que el docente cree dinámicamente ejercicios de **Secuencia Lógica** o **Emparejamiento Visual** sin alterar el esquema relacional en SQL Server, el frontend genera y parsea estructuras JSON estandarizadas en la columna `ConfigJson` de la tabla `Actividades`:

#### Estructura para Secuencia Lógica:
```json
{
  "steps": [
    { "id": 1, "order": 1, "label": "Lavar las manos con jabón", "icon": "higiene" },
    { "id": 2, "order": 2, "label": "Secar con toalla limpia", "icon": "higiene" },
    { "id": 3, "order": 3, "label": "Sentarse a comer", "icon": "comida" }
  ],
  "pasos": [
    "Lavar las manos con jabón",
    "Secar con toalla limpia",
    "Sentarse a comer"
  ]
}
```

#### Estructura para Emparejamiento Visual:
```json
{
  "pairs": [
    { "id": 1, "leftLabel": "Feliz", "leftIcon": "emocion", "rightLabel": "Sonrisa", "rightIcon": "simbolo" },
    { "id": 2, "leftLabel": "Triste", "leftIcon": "emocion", "rightLabel": "Lágrima", "rightIcon": "simbolo" }
  ],
  "pares": [
    { "emocion": "Feliz", "pareja": "Sonrisa" },
    { "emocion": "Triste", "pareja": "Lágrima" }
  ]
}
```

---

## 📁 Estructura del Repositorio

```text
PWA1-FRONTEND/
├── .gitignore                  # Reglas de exclusión de Git
├── README.md                   # Documentación técnica completa (Sprint 1 + Sprint 2)
├── api-client.js               # Cliente HTTP unificado, gestión de JWT y roles RBAC
├── server.js                   # Servidor HTTP nativo en Node.js (puerto 5500)
├── Interfaz_General.html       # Landing page institucional "Sendero" (ruta '/')
├── login_Rework.html           # Login con micro-interacciones y pre-ajustes sensoriales
├── login.html                  # Copia de respaldo / compatibilidad de login
├── Interfaz_Estudiante.html    # Portal del Estudiante: rutina visual y telemetría (HU-002, HU-006)
├── Interfaz_Docente.html       # Portal del Docente: actividades y asignaciones (HU-004, HU-005)
├── Interfaz_Acudiente.html     # Portal del Acudiente: configuración sensorial (HU-003)
├── Interfaz_Admin2.html        # Portal del Administrador: usuarios, módulos y categorías (HU-001, HU-007)
└── Interfaz_Admin.html         # Versión previa del portal de administración
```

---

## 🚀 Guía de Instalación y Ejecución

### Prerrequisitos
- [Node.js](https://nodejs.org/) v16 o superior (para ejecutar el servidor ligero local).
- Opcional: Backend de TeaLearning en **.NET 9** (`http://localhost:5264`) conectado a SQL Server. *(Todas las vistas frontend cuentan con fallback y datos en memoria para operar de forma autónoma en modo demostración si el backend no está iniciado).*

### Pasos

1. **Clonar el proyecto:**
   ```bash
   git clone https://github.com/TAPIER0/PWA1-FRONTEND.git
   cd PWA1-FRONTEND
   ```

2. **Iniciar el servidor local de desarrollo:**
   ```bash
   node server.js
   ```

3. **Acceder a la aplicación:**
   - **Portal General (Landing Sendero):** [http://127.0.0.1:5500/](http://127.0.0.1:5500/)
   - **Inicio de Sesión:** [http://127.0.0.1:5500/login_Rework.html](http://127.0.0.1:5500/login_Rework.html)

---

## 👥 Flujo de Roles y Redirección en `api-client.js`

Al autenticarse en `login_Rework.html`, el cliente extrae los roles del token/payload y realiza la redirección automática:

- **Estudiante** $\rightarrow$ `Interfaz_Estudiante.html`
- **Acudiente** $\rightarrow$ `Interfaz_Acudiente.html`
- **Docente / Profesor** $\rightarrow$ `Interfaz_Docente.html`
- **Administrador** $\rightarrow$ `Interfaz_Admin2.html`

Cada interfaz cuenta con guardas de autenticación mediante `ApiClient.requireAuth(['RolPermitido'])`, impidiendo el acceso a usuarios sin el rol correspondiente o con sesión expirada.

---

## 🎓 Información Institucional

- **Institución**: Universidad de Cundinamarca (UDEC)
- **Periodo Académico**: 2026-II
- **Modalidad**: Proyecto de Aula y Proyecto de Grado / PGC
- **Línea de Investigación**: Ingeniería de Software, Sistemas Inclusivos y Accesibilidad Web
