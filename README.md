# Sendero / TeaLearning — Frontend (PWA1-FRONTEND)

Plataforma web de apoyo pedagógico adaptativo orientada a estudiantes diagnosticados con **Autismo Nivel 1 (Trastorno del Espectro Autista - TEA Nivel 1)**, desarrollada en el marco del **Proyecto de Aula y Proyecto de Grado / PGC** para la **Universidad de Cundinamarca (UDEC) — Periodo 2026-II**.

---

## 📌 Visión General y Estado del Proyecto

**Sendero (TeaLearning)** es un ecosistema tecnológico inclusivo creado para estructurar rutinas pedagógicas predecibles, reducir la sobrecarga sensorial, mitigar la ansiedad ante transiciones de actividad y proporcionar herramientas analíticas, de seguimiento cualitativo y de vinculación a docentes y familias.

El proyecto ha completado exitosamente las metas de los **Sprints 1, 2, 3 y 4** (55 puntos de historia implementados), consolidando:
- Arquitectura web desacoplada en Vanilla HTML5/CSS3/JavaScript (ES6+) con servidor Node.js y consumo de API REST en **.NET 9** con **Microsoft SQL Server**.
- Diseño accesible estricto bajo directrices **WCAG 2.1 (Niveles AA/AAA)** con relaciones de contraste reforzadas y semántica ARIA completa.
- Parametrización pedagógica híbrida (relacional + JSON dinámico `ConfigJson`).
- Telemetría de ejecución cronometrada y tablero analítico cognitivo agregado con alertas tempranas.
- Bitácora pedagógica compartida, calificaciones formativas (1.0 - 5.0) y consulta paginada de observaciones para familias (**HU-012**).
- Gamificación personal libre de competencia y sin elementos de presión.
- **Hardening de seguridad, integridad referencial y rendimiento**: gestión de excepciones bajo el estándar **RFC 7807 (ProblemDetails)** e índices compuestos en base de datos.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SENDERO FRONTEND                                     │
│                                                                                         │
│  [ Landing General ] ──> [ Login Adaptativo ] ──> [ Control RBAC & BFCache Protection ] │
│  (Interfaz_General)       (login)                             │                         │
│                                                               │                         │
│         ┌─────────────────────┬───────────────────────┬───────┴───────────────┐         │
│         ▼                     ▼                       ▼                       ▼         │
│   [Estudiante]           [Acudiente]              [Docente]                [Admin]      │
│  Rutina Visual           Perfil Sensorial        Actividades &           Catálogo,      │
│  Telemetría HU-006       Progreso HU-009         Asignación HU-004       Módulos &      │
│  Logros HU-011           Observaciones HU-012    Analítica HU-008        Hardening      │
│                          Notas Docente HU-010    Bitácora HU-010         HU-001/007     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
      REST API (.NET 9) + SQL Server + RFC 7807 ProblemDetails (http://localhost:5264)
```

---

## 📋 Matriz de Requerimientos y Product Backlog

### 🟢 SPRINT 1: Cimientos de Arquitectura, Autenticación RBAC y Perfil Sensorial (15 pts)

| Historia de Usuario | Pts | Módulo / Funcionalidad | Descripción e Implementación Frontend |
| :--- | :---: | :--- | :--- |
| **HU-001** | 5 | **Gestión de Usuarios y Roles (RBAC)** | Autenticación y registro con `UserManager<ApplicationUser>` y `RoleManager<IdentityRole>`. Endpoints: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/refresh-token`, `GET /api/users` y `PUT /api/users/{id}/roles`. Implementado en [`login.html`](login.html) e [`Interfaz_Admin.html`](Interfaz_Admin.html). |
| **HU-002** | 5 | **Rutina Visual de Actividades** | Visualización cronológica y secuencial de la jornada (`GET /api/students/me/daily-routine`). Actividades ordenadas estrictamente por su `OrdenSecuencial` con estados (`Pendiente`, `EnProgreso`, `Completada`). Implementado en [`Interfaz_Estudiante.html`](Interfaz_Estudiante.html). |
| **HU-003** | 5 | **Configuración Sensorial Adaptativa** | Configuración de la entidad `SensoryPreference` (`GET` y `PUT /api/students/{id}/sensory-preferences`): paleta cromática, tipografía legible/dislexia, escala tipográfica (1-4), audio/TTS, reducción de movimiento y temporizadores. Implementado en [`Interfaz_Acudiente.html`](Interfaz_Acudiente.html) con propagación dinámica a la vista del estudiante. |

---

### 🚀 SPRINT 2: Gestión Pedagógica, Módulos y Ejecución de Actividades (22 pts)

| Historia de Usuario | Pts | Módulo / Funcionalidad | Descripción e Implementación Frontend |
| :--- | :---: | :--- | :--- |
| **HU-004** | 8 | **Creación y Parametrización de Actividades** | Panel docente para parametrizar actividades (`POST, PUT, DELETE /api/activities`). **Modelo híbrido**: metadatos relacionales (`Titulo`, `Descripcion`, `TipoActividad`, `ObjetivoPedagogico`, `ModuloId`) combinados con la columna **`ConfigJson`** (`NVARCHAR(MAX)`) para secuencias y parejas. Incluye un **detector de lenguaje figurado/metafórico** en tiempo real. Implementado en [`Interfaz_Docente.html`](Interfaz_Docente.html). |
| **HU-005** | 3 | **Asignación de Actividades** | Asignación directa e individual o en lote (`POST /api/assignments`), definiendo `fechaInicio`, `fechaLimite`, `ordenSecuencial` y `prioridad`. Gestión integrada en [`Interfaz_Docente.html`](Interfaz_Docente.html). |
| **HU-006** | 8 | **Ejecución y Registro de Intentos** | Flujo completo de ejecución: inicio de actividad (`POST /api/activities/{assignmentId}/start`), renderizado dinámico según `ConfigJson` y envío de **telemetría de rendimiento** al completar (`POST /api/activities/{assignmentId}/submit`): `tiempoRespuestaSegundos` (cronometrado), `cantidadIntentosFallidos`, `cantidadAciertos` y `completadaExitosamente`. Implementado en [`Interfaz_Estudiante.html`](Interfaz_Estudiante.html). |
| **HU-007** | 3 | **Configuración de Módulos Temáticos** | CRUD administrativo de Categorías y Módulos de aprendizaje (`GET, POST, PUT, DELETE /api/categories` y `/api/modules`). Incluye control de integridad referencial (bloqueo de eliminación ante dependencias vinculadas). Implementado en [`Interfaz_Admin.html`](Interfaz_Admin.html). |

---

### 📊 SPRINT 3: Analítica Cognitiva, Monitoreo y Bitácora Pedagógica (16 pts)

| Historia de Usuario | Pts | Módulo / Funcionalidad | Descripción e Implementación Frontend |
| :--- | :---: | :--- | :--- |
| **HU-008** | 5 | **Panel Analítico del Docente** | Tablero analítico con métricas agregadas por estudiante y por aula (`GET /api/analytics/teacher/students/{id}/summary` y `GET /api/analytics/teacher/classes/{classId}`): cálculo de tasa de aciertos global, promedio de tiempo de respuesta por tipo de actividad, curva de intentos y evolución semanal. Visualización en gráficos SVG accesibles, sparklines y sistema de alerta temprana ("Necesita apoyo" si tasa < 60%). Implementado en [`Interfaz_Docente.html`](Interfaz_Docente.html). |
| **HU-009** | 5 | **Monitoreo del Acudiente** | Vista de progreso y consolidado (`GET /api/guardian/students/{studentId}/progress`): actividades completadas vs. pendientes, porcentaje de avance, tiempo invertido y evolución semanal. Incluye historial paginado (`/activity-history`) con badges no punitivos ("Lo logró", "Necesitó varios intentos", "Sin terminar") y recomendaciones prácticas para casa. Implementado en [`Interfaz_Acudiente.html`](Interfaz_Acudiente.html). |
| **HU-010** | 3 | **Bitácora Pedagógica y Calificaciones** | CRUD de notas cualitativas del docente sobre el estudiante (`POST, GET /api/students/{id}/pedagogical-notes`, con edición/eliminación). Clasificación por tipo (`Avance`, `Recomendación`, `Observación`, `Aspecto a reforzar`), área y visibilidad al acudiente (`VisibleAcudiente = true`). Pestaña de calificaciones (escala 1.0 - 5.0 con nota aprobatoria 3.0 vía `PUT /assignments/{id}/grade`). Consulta en tiempo real por el acudiente en [`Interfaz_Acudiente.html`](Interfaz_Acudiente.html). |
| **HU-011** | 3 | **Visualización de Logros del Estudiante** | Vista personal de hitos y módulos concluidos (`GET /api/students/me/achievements`). **Gamificación ética no competitiva**: sin rankings, sin puntos, sin comparaciones con compañeros, sin rachas ni penalizaciones. Incluye función de auditoría automatizada en consola `validarSinElementosCompetitivos()` y soporte TTS. Implementado en [`Interfaz_Estudiante.html`](Interfaz_Estudiante.html). |

---

### 🛡️ SPRINT 4: Observaciones Paginadas, Hardening y Optimización (2 pts + Calidad)

| Historia de Usuario / Tarea | Pts | Módulo / Funcionalidad | Descripción e Implementación Frontend |
| :--- | :---: | :--- | :--- |
| **HU-012** | 2 | **Consulta de Observaciones por Acudientes** | Endpoint optimizado de lectura cronológica y filtrado de observaciones docentes con soporte de paginación (`GET /api/guardian/students/{id}/observations?pageSize=50`). Permite consultar colecciones paginadas de forma eficiente con fallback ordenado a `/pedagogical-notes` y `/log-entries`. Tarjetas con fecha, tipo, área formativa, descripción y recomendaciones para el hogar. Implementado en [`Interfaz_Acudiente.html`](Interfaz_Acudiente.html). |
| **Hardening Admin** | — | **Seguridad & Gestión de Usuarios** | Fortalecimiento del panel administrativo en [`Interfaz_Admin.html`](Interfaz_Admin.html): edición habilitada de correo electrónico, actualización de estado activo/inactivo (`PUT /api/users/{id}`) y vinculación relacional persistente de estudiantes a acudientes mediante `PUT /api/users/{id}/students`. |
| **RFC 7807 ProblemDetails** | — | **Manejo Estandarizado de Errores** | Soporte e integración en [`api-client.js`](api-client.js) y las vistas para procesar respuestas de error en el estándar **RFC 7807 (`application/problem+json`)**, extrayendo de forma segura campos como `title`, `detail`, `status` y diccionarios de `errors` de validación. |
| **Optimización SQL** | — | **Índices Compuestos de Base de Datos** | Creación y soporte para índices de alto rendimiento en Microsoft SQL Server sobre `BitacoraNotas` (`(StudentProfileId, Fecha DESC, CreatedAt DESC) INCLUDE (VisibleAcudiente)`), `Assignments` y `ExecutionAttempts` para acelerar las consultas analíticas de docentes y acudientes. |
| **Recuperación de Contraseña** | — | **Restablecimiento por Correo + Acudiente** | Flujo dual de recuperación: (1) por correo electrónico (`POST /api/auth/forgot-password` y `/api/auth/reset-password`) mediante [`forgot-password.html`](forgot-password.html) y [`reset-password.html`](reset-password.html) para `Administrador`, `Docente` y `Acudiente` (leyendo el token desde el fragmento `#` de la URL y limpiando el historial); (2) desde la plataforma (`POST /api/guardian/students/{studentId}/reset-password`) en la vista **"Contraseña del estudiante"** de [`Interfaz_Acudiente.html`](Interfaz_Acudiente.html), exclusivo para el acudiente titular del estudiante. |

---

## 🧠 Principios de Neurodiversidad y Accesibilidad (TEA Nivel 1)

1. **Previsibilidad y Reducción de Ansiedad**:
   - Secuencia visual paso a paso de actividades del día.
   - Temporizadores preventivos con alertas auditivas y visuales configurables ("Esta actividad cambiará en X segundos") o modo "sin temporizador" para evitar ansiedad por velocidad.
2. **Estimulación Visual Equilibrada y Paletas Sensoriales (WCAG 2.1 AA/AAA)**:
   - **Verde / Pastel Suave** (`#2F6E5C` / `#F4F6F5`): Foco, tranquilidad y concentración.
   - **Neutro Calmante** (`#55605A` / `#F6F7F6`): Cero interferencias cromáticas.
   - **Lavanda Suave** (`#5B4E8C` / `#F5F3F7`): Relajación sensorial.
   - **Arena Cálida** (`#705324` / `#FBF6EF`): Contraste reforzado a $\ge 4.5:1$ sobre fondo claro.
   - **Modo Alto Contraste** conforme a directrices de baja visión.
3. **Semántica de Controles y Accesibilidad de Formularios**:
   - Asociación explícita entre etiquetas e interactivos mediante atributos `for`, `id`, `aria-label` y `aria-describedby` en todos los interruptores sensoriales.
4. **Legibilidad y Decodificación Tipográfica**:
   - **Atkinson Hyperlegible** (Braille Institute) por defecto, diferenciando caracteres homólogos (ej. `I`, `l`, `1`).
   - Soporte para **OpenDyslexic**.
   - Ajustes de escala de fuente (Pequeño, Normal, Grande, Muy Grande) y espaciado de letras aumentado (*letter-spacing*).
5. **Claridad Pragmática del Lenguaje**:
   - Detector heurístico en el panel docente que alerta sobre modismos o lenguaje figurado (ej. *"a toda máquina"*, *"pan comido"*), sugiriendo instrucciones literales y directas.
6. **Gamificación Positiva y No Competitiva (Ética para TEA)**:
   - Medición centrada en el propio camino y progreso individual.
   - Prohibición estricta de tablas de clasificación, rankings, rachas (*streaks*), puntajes comparativos o penalizaciones.
7. **Control de Errores y Navegación Segura**:
   - Pantalla de contingencia amigable [`error.html`](error.html) que atiende errores 404, 403, 401, 500 y desconexión sin generar frustración, reconduciendo al usuario a su panel.
   - Compensación automática de altura de la cabecera fija (`--nav-h`) en el desplazamiento de anclajes.

---

## 🖥️ Módulos e Interfaces del Frontend

### 1. `Interfaz_General.html` — Portal Institucional "Sendero"
- **Propósito**: Puerta de entrada pública orientada a familias, docentes y directivos.
- **Diseño**: Inspirado en interfaces modernas de alto rendimiento tecnológico (estilo NVIDIA/Apple), carrusel interactivo por categorías temáticas, tipografía optimizada (16px a 18px), arte vectorial original y acceso rápido al inicio de sesión.
- **Ruta por defecto**: Servida como raíz `/` en `server.js`.

### 2. `login.html`, `forgot-password.html` y `reset-password.html` — Inicio de Sesión y Recuperación Adaptativa
- **Propósito**: Acceso centralizado con validación en tiempo real y pre-ajustes sensoriales (contraste y escala tipográfica utilizables antes de ingresar credenciales, compartidos mediante `recovery.css` y `recovery.js`).
- **Seguridad**: Autenticación JWT (`POST /api/auth/login`), conmutador de visibilidad de contraseña, protección de historial (BFCache / popstate) y redirección automática según el rol asignado.
- **Recuperación de contraseña**: Enlace `¿Olvidaste tu contraseña?` hacia `forgot-password.html` (para `Administrador`, `Docente` y `Acudiente`, con aviso informativo para estudiantes) y confirmación en `reset-password.html` leyendo `#email=...&token=...` desde `window.location.hash` y limpiando inmediatamente la URL con `history.replaceState`.

### 3. `Interfaz_Estudiante.html` — Portal del Estudiante ("Mi rutina de hoy" & "Mis logros")
- **Sección Rutina Diaria (HU-002, HU-006)**: Secuencia visual estructurada, barra de progreso interactiva, renderizado del ejercicio basado en `ConfigJson` (secuencia lógica o emparejamiento visual), aviso sonoro/visual de transición y telemetría de ejecución (`/start` y `/submit`).
- **Sección Mis Logros (HU-011)**: Camino visual personal de módulos concluidos, actividades terminadas y logros acumulados, completamente desprovisto de mecánicas competitivas y con soporte de lectura por voz.

### 4. `Interfaz_Docente.html` — Centro de Gestión y Analítica Pedagógica
- **Vista Actividades (HU-004, HU-005)**: Editor visual interactivo de ejercicios con previsualización en vivo, detector de expresiones metafóricas y asignación individual o grupal con prioridad y orden secuencial.
- **Vista Desempeño (HU-008)**: Tablero de métricas con filtros de periodo (4, 8, 12 semanas), gráficos SVG reactivos (tasa de aciertos con promedio de aula, tiempos de respuesta, cantidad de intentos), tabla con *sparklines* y alertas automáticas de apoyo pedagógico.
- **Vista Bitácora (HU-010)**: Registro cronológico de notas cualitativas con control de visibilidad al acudiente, filtros por área/tipo y panel de calificaciones por actividad en escala de 1.0 a 5.0 (nota aprobatoria 3.0).

### 5. `Interfaz_Acudiente.html` — Portal del Acudiente
- **Vista Preferencias Sensoriales (HU-003)**: Calibración en tiempo real de paletas cromáticas, tipografía, volumen, TTS, reducción de movimiento y temporizadores con vista previa interactiva sincronizada con el backend.
- **Vista Progreso (HU-009)**: Indicadores de cumplimiento global, tiempo total invertido, evolución semanal, historial cronológico de actividades con resultados claros ("Lo logró", "Necesitó varios intentos", "Sin terminar") y consejos prácticos para el hogar.
- **Vista Notas del Docente (HU-010, HU-012)**: Consulta paginada y filtrada cronológicamente de las observaciones docentes y recomendaciones pedagógicas compartidas para cada estudiante a cargo (`/guardian/students/{id}/observations`).
- **Vista Contraseña del Estudiante**: Permite al acudiente titular restablecer directamente la contraseña de su estudiante vinculado (`POST /api/guardian/students/{studentId}/reset-password`) con validación de política de contraseña en vivo (mín. 6 caracteres y 1 número).

### 6. `Interfaz_Admin.html` — Panel de Administración Global
- **Usuarios & Hardening (HU-001, Sprint 4)**: Creación y edición de cuentas (nombres, apellidos, correo editable, estado activo/inactivo), asignación de roles y vinculación persistente de estudiantes a cargo para el rol Acudiente (`PUT /api/users/{id}/students`).
- **Categorías y Módulos Temáticos (HU-007)**: Gestión del catálogo pedagógico con ordenación secuencial, selector de colores identificadores y validaciones de eliminación protegida.

### 7. `error.html` / `404.html` — Centro de Manejo Accesible de Errores
- Tratamiento visual no invasivo de códigos HTTP `404 Not Found`, `403 Forbidden`, `401 Unauthorized`, `500 Server Error` y modo fuera de línea (`offline`), con botón contextual que redirige automáticamente al usuario autenticado hacia su panel principal según sus roles almacenados en sesión.

---

## 🔌 Matriz de Endpoints Consumidos

```text
Backend Base URL: http://localhost:5264/api
```

| Módulo | Método | Endpoint | Historia | Descripción |
| :--- | :---: | :--- | :---: | :--- |
| **Auth** | `POST` | `/auth/login` | HU-001 | Autenticación y expedición de tokens JWT |
| **Auth** | `POST` | `/auth/register` | HU-001 | Registro de nuevos usuarios desde administración |
| **Auth** | `POST` | `/auth/forgot-password` | Sprint 4 | Solicitud de correo de restablecimiento (`Administrador`, `Docente`, `Acudiente`) |
| **Auth** | `POST` | `/auth/reset-password` | Sprint 4 | Confirmación de cambio de contraseña con token Base64Url |
| **Usuarios** | `GET` | `/users` | HU-001 | Obtención de usuarios y roles registrados |
| **Usuarios** | `PUT` | `/users/{id}` | Sprint 4 | Actualización completa de datos y estado de usuario |
| **Usuarios** | `PUT` | `/users/{id}/roles` | HU-001 | Modificación de roles asignados a un usuario |
| **Vínculo Acudiente**| `PUT` | `/users/{id}/students` | Sprint 4 | Vinculación relacional de estudiantes a un acudiente |
| **Categorías** | `GET, POST, PUT, DELETE` | `/categories` | HU-007 | CRUD de categorías de aprendizaje |
| **Módulos** | `GET, POST, PUT, DELETE` | `/modules` | HU-007 | CRUD de módulos temáticos |
| **Actividades**| `GET, POST, PUT, DELETE` | `/activities` | HU-004 | CRUD de actividades con metadata y `ConfigJson` |
| **Asignaciones**| `GET, POST` | `/assignments` | HU-005 | Asignaciones de actividades a estudiantes |
| **Ejecución** | `POST` | `/activities/{id}/start` | HU-006 | Notificación de inicio de actividad |
| **Ejecución** | `POST` | `/activities/{id}/submit` | HU-006 | Envío de telemetría de intento y tiempo |
| **Estudiante** | `GET` | `/students/me/profile` | HU-001 | Perfil del estudiante en sesión |
| **Estudiante** | `GET` | `/students/me/daily-routine`| HU-002 | Rutina secuencial del día |
| **Sensorial** | `GET, PUT` | `/students/{id}/sensory-preferences` | HU-003 | Consulta y actualización de preferencias sensoriales |
| **Analítica Aula** | `GET` | `/analytics/teacher/classes/{classId}` | HU-008 | Métricas de rendimiento consolidadas del aula |
| **Analítica Estudiante**| `GET` | `/analytics/teacher/students/{id}/summary` | HU-008 | Resumen analítico individual (aciertos, tiempos, evolución) |
| **Progreso Acudiente** | `GET` | `/guardian/students/{id}/progress` | HU-009 | Resumen de avance para el acudiente |
| **Historial Acudiente** | `GET` | `/guardian/students/{id}/activity-history` | HU-009 | Historial detallado y paginado de actividades |
| **Observaciones Acudiente** | `GET` | `/guardian/students/{id}/observations` | HU-012 | Consulta paginada y filtrada de observaciones para familias |
| **Seguridad Acudiente** | `POST` | `/guardian/students/{id}/reset-password` | Sprint 4 | Restablecimiento de contraseña de estudiante por su acudiente titular |
| **Bitácora** | `GET, POST` | `/students/{id}/pedagogical-notes` | HU-010 | Consulta y registro de observaciones pedagógicas |
| **Bitácora Edición** | `PUT, DELETE`| `/log-entries/{id}` | HU-010 | Edición y eliminación de notas del docente |
| **Calificaciones** | `GET` | `/students/{id}/grades` | HU-010 | Listado de actividades y notas asignadas |
| **Calificaciones** | `PUT` | `/assignments/{id}/grade` | HU-010 | Upsert de calificación (1.0 a 5.0) y retroalimentación |
| **Logros Estudiante** | `GET` | `/students/me/achievements` | HU-011 | Módulos concluidos e hitos alcanzados (gamificación no competitiva) |

---

## 🧱 Modelo de Datos Híbrido (`ConfigJson`)

Para permitir que el docente cree dinámicamente ejercicios de **Secuencia Lógica** o **Emparejamiento Visual** sin alterar el esquema relacional en SQL Server, el frontend serializa estructuras JSON estandarizadas en la columna `ConfigJson` de la tabla `Actividades`:

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
├── .gitignore                  # Exclusiones de control de versiones Git
├── README.md                   # Documentación técnica completa (Sprints 1, 2, 3 y 4)
├── api-client.js               # Cliente HTTP centralizado, RBAC, JWT, BFCache, ProblemDetails RFC 7807
├── recovery.css                # Hoja de estilos compartida para flujo de recuperación de contraseña (WCAG AA/AAA)
├── recovery.js                 # Utilidades de preferencias pre-login, toggles y validación para recuperación
├── server.js                   # Servidor HTTP en Node.js (puerto 5500) con fallback a error.html y no-cache
├── error.html                  # Pantalla accesible de gestión de errores (404, 403, 401, 500, offline)
├── 404.html                    # Redirección espejo a error.html para hosts estáticos
├── Interfaz_General.html       # Landing page institucional "Sendero" optimizada (ruta '/')
├── login.html                  # Login adaptativo con pre-ajustes sensoriales y protección bfcache
├── forgot-password.html        # Solicitud de enlace de restablecimiento de contraseña por correo
├── reset-password.html         # Confirmación de nueva contraseña desde enlace de correo (#email&token)
├── Interfaz_Estudiante.html    # Portal del Estudiante: Rutina (HU-002, 006) y Logros éticos (HU-011)
├── Interfaz_Docente.html       # Portal Docente: Actividades (HU-004, 005), Desempeño (HU-008), Bitácora (HU-010)
├── Interfaz_Acudiente.html     # Portal Acudiente: Sensorial (HU-003), Progreso (HU-009), Observaciones (HU-012) y Contraseña del estudiante
└── Interfaz_Admin.html         # Portal Administrador: Usuarios, Módulos/Categorías y Hardening (HU-001, 007)
```

---

## 🚀 Guía de Instalación y Ejecución

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 16 o superior).
- *(Opcional)* Backend de TeaLearning en **.NET 9** (`http://localhost:5264`) conectado a SQL Server. *(Todas las vistas frontend integran datos de contingencia/demostración para operar de forma autónoma en modo pruebas y evaluación de diseño).*

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
   - **Inicio de Sesión:** [http://127.0.0.1:5500/login.html](http://127.0.0.1:5500/login.html)

---

## 👥 Flujo de Roles y Redirección en `api-client.js`

Al autenticarse en `login.html`, el cliente extrae los roles del token/payload y realiza la redirección automática:

- **Estudiante** $\rightarrow$ `Interfaz_Estudiante.html`
- **Acudiente** $\rightarrow$ `Interfaz_Acudiente.html`
- **Docente / Profesor** $\rightarrow$ `Interfaz_Docente.html`
- **Administrador** $\rightarrow$ `Interfaz_Admin.html`

Cada interfaz cuenta con guardas de autenticación mediante `ApiClient.requireAuth(['RolPermitido'])`, impidiendo el acceso a usuarios sin el rol correspondiente (redirigiendo a `error.html?code=403`) o con sesión expirada (`login.html`).

---

## 🎓 Información Institucional

- **Institución**: Universidad de Cundinamarca (UDEC)
- **Periodo Académico**: 2026-II
- **Modalidad**: Proyecto de Aula y Proyecto de Grado / PGC
- **Línea de Investigación**: Ingeniería de Software, Sistemas Inclusivos y Accesibilidad Web
