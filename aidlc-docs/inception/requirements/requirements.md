# Documento de Requisitos — FamilyFinance (Producto Comercial Multi-Tenant)

## Resumen de Análisis de Intención

- **Solicitud del usuario**: "Quiero que esta aplicación sea funcional, que la pueda comercializar y que quede disponible para que cualquier persona se pueda registrar y asociar el grupo familiar para poder hacer una comunidad donde puedan registrar y llevar sus finanzas personales." Ampliada luego con: registro vía cuenta de Google, trabajo de seguridad, y disponibilidad en Android (priorizando web responsive para este ciclo).
- **Tipo de Solicitud**: Migración / Mejora Mayor — se reconstruye la arquitectura (de SPA cliente-only a producto SaaS con backend, base de datos y autenticación), reutilizando el diseño visual/UX del prototipo actual como referencia (no se parte de cero en la experiencia de usuario, sí en la arquitectura técnica).
- **Estimación de Alcance**: Sistema completo (`System-wide`) — nuevo backend, base de datos, autenticación, modelo de datos multi-tenant, y reconstrucción del frontend.
- **Estimación de Complejidad**: Compleja — múltiples interesados (familias/usuarios finales), aislamiento de datos multi-tenant, autenticación de terceros (Google), y tres extensiones de calidad habilitadas con cumplimiento obligatorio (Seguridad, Pruebas basadas en propiedades, Resiliencia).
- **Profundidad de Requisitos Aplicada**: **Comprehensive** (detallada, con trazabilidad a las respuestas del usuario), por tratarse de un proyecto complejo, de alto riesgo (datos financieros personales de múltiples familias) y con múltiples extensiones de calidad bloqueantes activas.

---

## Contexto: De Prototipo a Producto

El prototipo actual (`index.html`, documentado en `aidlc-docs/inception/reverse-engineering/`) es una demo funcional de un solo archivo, sin backend, para una única familia ficticia ("Familia García"), con datos guardados solo en el navegador local. El objetivo de este ciclo es convertirlo en un **producto SaaS multi-tenant real**: cualquier persona se registra, crea o se une a un grupo familiar, y cada grupo administra sus propias finanzas de forma aislada del resto.

**Decisión de arquitectura** (Aclaración 2 = C): el equipo técnico decide la arquitectura más adecuada para el objetivo comercial. La arquitectura de un solo archivo estático **no es viable** para autenticación, multi-tenancy y datos compartidos entre dispositivos — se requiere una reconstrucción con frontend y backend separados, base de datos, y autenticación real. El diseño visual actual (paleta de colores, tipografía, estructura de paneles) se conserva como referencia de UX.

---

## Requisitos Funcionales

### RF-01: Registro y Autenticación de Usuarios
- El sistema DEBE permitir que cualquier persona se registre e inicie sesión usando su **cuenta de Google (OAuth 2.0 / OpenID Connect)**.
- El sistema DEBE crear un perfil de usuario la primera vez que alguien inicia sesión (nombre, correo, foto de perfil desde Google).
- *Fuente*: Pregunta 3 (respuesta Other) — "generar el módulo de registro con la cuenta de google".

### RF-02: Creación y Gestión de Grupos Familiares
- Un usuario autenticado DEBE poder **crear un grupo familiar nuevo**, quedando automáticamente como su **Administrador**.
- El Administrador DEBE poder **invitar a otros usuarios** al grupo por correo electrónico o link de invitación.
- Cada grupo familiar DEBE tener sus datos financieros **completamente aislados** de los demás grupos (sin acceso cruzado entre familias, ni siquiera de forma anónima/agregada).
- *Fuente*: Aclaración 3 = A. Nota de alcance: la palabra "comunidad" de la solicitud original se interpreta como **el grupo familiar mismo** (una comunidad privada de sus miembros) — **no** se incluye en este ciclo una funcionalidad de comunidad pública compartida entre distintas familias (esa opción, B, no fue seleccionada).
- Roles dentro del grupo: **Administrador** (gestiona miembros, ve todo) y **Miembro** (registra/ve datos del grupo) — formalizando los roles que ya existían visualmente en el prototipo (`Administradora`, `Miembro`).

### RF-03: Gestión de Gastos (multi-usuario, por grupo)
- Cada miembro del grupo DEBE poder registrar gastos (descripción, monto, categoría) que sean visibles para **todos los miembros del mismo grupo**, no solo en su propio dispositivo.
- El sistema DEBE mostrar quién de la familia registró cada gasto (ya existente en el prototipo, ahora respaldado por usuarios reales en vez de nombres fijos).
- El historial de gastos y el gasto total del mes DEBEN reflejar los datos combinados de todos los miembros del grupo.

### RF-04: Presupuesto por Categoría (por grupo)
- El grupo familiar DEBE poder definir un presupuesto mensual por categoría (supermercado, servicios, transporte, salud, entretenimiento, etc.).
- El sistema DEBE calcular automáticamente cuánto se ha gastado y cuánto queda disponible por categoría, a partir de los gastos registrados por cualquier miembro del grupo.

### RF-05: Alacena Compartida
- Todos los miembros del grupo DEBEN ver y actualizar el mismo inventario de alacena (no una copia local por dispositivo como hoy).
- El sistema DEBE alertar cuándo un producto está por agotarse.

### RF-06: Lista de Compras Compartida
- Todos los miembros del grupo DEBEN ver y marcar como comprados los mismos ítems de la lista de compras, en tiempo casi real (que un cambio hecho por un miembro sea visible para los demás).
- El sistema DEBE poder generar la lista de compras automáticamente a partir del menú planificado en el calendario del grupo.

### RF-07: Recetario y Menú Mensual (por grupo)
- El grupo DEBE poder mantener su propio recetario (recetas propias y/o una base compartida de recetas de referencia).
- El grupo DEBE poder planificar el menú del mes (almuerzo/cena/desayuno por día), visible para todos sus miembros.

### RF-08: Segmentación de Productos (por grupo)
- El grupo DEBE poder clasificar sus productos habituales en 1ª categoría (esencial), 2ª categoría (complementario) o Prescindible, para identificar oportunidades de ahorro, igual que en el prototipo actual pero persistido por grupo.

### RF-09: Asistente de Ahorro y Recetas
- El sistema DEBE mantener un asistente que responda preguntas sobre gastos, ahorro, alacena y recetas usando los datos reales del grupo familiar del usuario que consulta.
- **Restricción de seguridad heredada**: si en el futuro el asistente pasa a usar un LLM real en vez de lógica local, la integración DEBE hacerse a través del backend (nunca exponiendo API keys en el cliente) — ver hallazgo ya remediado en `code-quality-assessment.md`.

### RF-10: Panel de Familia / Miembros
- El grupo DEBE poder ver cuánto gastó cada miembro y cuántas transacciones registró cada uno, igual que en el prototipo actual pero con usuarios reales y roles reales (Administrador/Miembro) en vez de datos fijos.

### RF-11: Disponibilidad en Android — Web Responsive (prioridad de este ciclo)
- El producto DEBE ser completamente usable desde el navegador de un teléfono Android (diseño responsive, sin necesidad de instalar nada).
- **Fuera de alcance de este ciclo** (quedan documentados como roadmap futuro, Aclaración 1 = D):
  - Progresive Web App (PWA) instalable con ícono en el launcher de Android.
  - App nativa/multiplataforma publicada en Google Play Store.
- *Fuente*: Aclaración 1-bis = C.

---

## Requisitos No Funcionales

### NFR-01: Seguridad (Extensión Security Baseline — HABILITADA, cumplimiento bloqueante)
El proyecto activó la extensión de Seguridad con enforcement completo (Pregunta 4 = A). Todas las reglas SECURITY-01 a SECURITY-15 de `.aidlc-rule-details/extensions/security/baseline/security-baseline.md` aplican como restricciones bloqueantes en las siguientes etapas (Application Design, NFR Requirements/Design, Code Generation). Las más relevantes para este proyecto, dado su perfil (multi-tenant, datos financieros personales, auth de terceros):
- **SECURITY-08 (Control de acceso a nivel de aplicación)**: cada request a datos de un grupo familiar DEBE verificar que el usuario pertenece a ese grupo (autorización a nivel de objeto) — es el control más crítico dado el aislamiento estricto entre familias exigido en RF-02.
- **SECURITY-12 (Autenticación y gestión de credenciales)**: al usar Google OAuth, no se gestionan contraseñas propias, pero sí sesiones/tokens — validación server-side, expiración, invalidación al cerrar sesión, cookies `Secure`/`HttpOnly`/`SameSite`.
- **SECURITY-01 (Cifrado en tránsito y reposo)**: toda base de datos y comunicación DEBE ir cifrada (TLS 1.2+, cifrado en reposo).
- **SECURITY-04 (Headers de seguridad HTTP)**: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy en todas las respuestas HTML.
- **SECURITY-05 (Validación de entrada)**: reemplaza el patrón actual de `innerHTML` sin sanitizar (hallazgo de `code-quality-assessment.md`) por sanitización/escape real de todo texto ingresado por usuarios (descripciones de gasto, nombres de producto/receta, etc.).
- **SECURITY-13 (Integridad de CDN)**: los recursos externos (Google Fonts, íconos) DEBEN usar Subresource Integrity si se siguen sirviendo desde CDN.
- El resto de las reglas (SECURITY-02, 03, 06, 07, 09, 10, 11, 14, 15) se evaluarán como compliant/non-compliant/N/A en cada etapa aplicable, según el diseño técnico que se defina en Application Design / NFR Design.

### NFR-02: Pruebas Basadas en Propiedades (Extensión Property-Based Testing — HABILITADA, enforcement completo)
El proyecto activó PBT con enforcement completo (Pregunta 5 = A, no "Parcial"). Aplica desde Functional Design (identificación de propiedades) hasta Code Generation y Build & Test, según `.aidlc-rule-details/extensions/testing/property-based/property-based-testing.md`. Ejemplos de propiedades de negocio ya identificables en este dominio (a confirmar/ampliar en Functional Design por unidad):
- **Invariante de presupuesto**: el gasto acumulado de una categoría nunca debe quedar en un estado inconsistente con la suma de sus transacciones (`sum(gastos_categoria) == budget.spent`).
- **Invariante de aislamiento multi-tenant**: ninguna consulta de datos de un grupo familiar debe poder devolver datos de otro grupo, para cualquier combinación de usuario/grupo generada aleatoriamente.
- **Round-trip de serialización**: los datos de un grupo (gastos, alacena, presupuesto, etc.) que se guardan y luego se leen desde la base de datos deben ser equivalentes al valor original.
- **Idempotencia**: marcar un ítem de la lista de compras como "comprado" dos veces seguidas no debe duplicar ni alterar el resultado.

### NFR-03: Resiliencia (Extensión Resiliency Baseline — HABILITADA, guía de diseño)
El proyecto activó el baseline de resiliencia (Pregunta 6 = A), con las siguientes decisiones ya tomadas por el usuario (obligatorias en esta etapa según `resiliency-baseline.md`):
- **RTO/RPO y estrategia de DR (RESILIENCY-02)**: **Backup & Restore**, RTO/RPO en horas, menor costo — carga de trabajo clasificada como **no crítica** para efectos de recuperación ante desastres. Esta decisión DEBE propagarse a Application Design, NFR Requirements/Design e Infrastructure Design.
- **Gestión de cambios (RESILIENCY-03)**: **no aplica todavía** — proyecto individual/pequeño, sin proceso formal de cambios por ahora. Se puede revisar más adelante si el equipo crece.
- Las demás decisiones de la extensión (CI/CD y despliegue, mecanismo de rollback, estilo de despliegue, topología regional, proceso de respuesta a incidentes, enfoque de pruebas de resiliencia) se preguntarán más adelante, en las etapas de **NFR Design** e **Infrastructure Design**, según lo indica la propia extensión (`resiliency-baseline.md`, tabla "User Decision Points").

### NFR-04: Multi-tenencia y Aislamiento de Datos
- El sistema DEBE garantizar aislamiento estricto de datos entre grupos familiares a nivel de aplicación y, cuando la arquitectura de datos lo permita, a nivel de almacenamiento.
- El sistema DEBE soportar que un mismo usuario pertenezca únicamente a los grupos a los que fue invitado o que creó (sin límite explícito de cantidad de grupos definido en este ciclo — a confirmar en Application Design si se requiere restricción).

### NFR-05: Disponibilidad y Sincronización
- Los datos de un grupo familiar DEBEN estar disponibles y sincronizados entre los dispositivos de sus miembros (a diferencia del prototipo actual, que usa `localStorage` local por navegador).
- Nivel de disponibilidad acorde a NFR-03 (carga no crítica, RTO/RPO en horas) — no se requiere alta disponibilidad multi-región en este ciclo.

### NFR-06: Usabilidad y Compatibilidad
- La interfaz DEBE ser completamente responsive y usable desde el navegador de un dispositivo Android (RF-11), conservando el sistema de diseño visual (colores, tipografía, iconografía) del prototipo actual como base de marca.
- El idioma principal del producto es español (Chile), consistente con el prototipo actual.

### NFR-07: Calidad de Código y Mantenibilidad
- A diferencia del prototipo actual (sin pruebas, sin linting, sin build), el nuevo sistema DEBE incorporar pruebas automatizadas (unitarias + basadas en propiedades por NFR-02), control de dependencias versionado, y un pipeline de build/verificación — el detalle técnico se definirá en NFR Requirements/Design durante Construction.

---

## Fuera de Alcance (este ciclo)

- App nativa Android publicada en Google Play Store (Aclaración 1 = D/roadmap, priorizado para un ciclo futuro).
- Progressive Web App (PWA) instalable (mismo roadmap futuro).
- Comunidad pública/compartida entre distintas familias (Aclaración 3 — no se seleccionó la opción B).
- Definición de CI/CD, mecanismo de rollback, estilo de despliegue, topología multi-región, proceso de respuesta a incidentes, y enfoque de pruebas de resiliencia — diferidos a NFR Design / Infrastructure Design / Operations según `resiliency-baseline.md`.

---

## Resumen de Requisitos Clave

- **Producto**: SaaS multi-tenant de finanzas familiares, reemplazando el prototipo de un solo archivo.
- **Autenticación**: Google OAuth, sin gestión de contraseñas propias.
- **Multi-tenencia**: grupos familiares aislados entre sí, cada uno con sus propios datos financieros compartidos entre sus miembros.
- **Plataforma de este ciclo**: web responsive (mobile-first, compatible con Android); PWA y app nativa quedan en el roadmap.
- **Calidad obligatoria**: Seguridad (15 reglas bloqueantes), Pruebas Basadas en Propiedades (enforcement completo), y Resiliencia (guía de diseño, con RTO/RPO en horas vía Backup & Restore y sin proceso formal de gestión de cambios por ahora).
- **Diseño**: se conserva el sistema visual del prototipo (`index.html`) como referencia de marca/UX.
