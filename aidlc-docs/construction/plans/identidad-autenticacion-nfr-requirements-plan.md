# Plan de NFR Requirements — Unidad 1: Identidad y Autenticación

**Nota importante**: las decisiones de lenguaje/framework de backend, base de datos y proveedor de hosting que se tomen aquí aplican a **todo el backend** (monolito modular — Application Design), no solo a esta unidad. Las Unidades 2 a 5 (Grupos Familiares, Núcleo Financiero, Hogar, Insights) **heredarán** estas decisiones sin volver a preguntarlas, salvo que surja una necesidad específica de esa unidad. La Unidad 6 (Frontend Web) hará su propia elección de stack de frontend cuando le corresponda.

## Checklist de Ejecución

- [ ] Confirmar lenguaje y framework de backend (Pregunta 1)
- [ ] Confirmar motor de base de datos (Pregunta 2)
- [ ] Confirmar mecanismo de sesión (Pregunta 3)
- [ ] Confirmar proveedor de hosting/infraestructura (Pregunta 4)
- [ ] Confirmar expectativa de escala inicial (Pregunta 5)
- [ ] Generar `aidlc-docs/construction/identidad-autenticacion/nfr-requirements/nfr-requirements.md`
- [ ] Generar `aidlc-docs/construction/identidad-autenticacion/nfr-requirements/tech-stack-decisions.md`

---

## NFRs ya Definidos por Decisiones Previas (no son preguntas abiertas)

- **Disponibilidad / DR**: RTO/RPO en horas, estrategia Backup & Restore, despliegue en una sola región (RESILIENCY-02, decidido en Requirements Analysis).
- **Seguridad**: 15 reglas de Security Baseline aplican como restricciones bloqueantes (ver `security-baseline.md`); en esta unidad ya se tradujeron a BR-04 (errores genéricos, SECURITY-09) y BR-05/BR-07 (gestión de sesión, SECURITY-12).
- **Rendimiento** (supuesto por defecto, sin necesidad de pregunta): tiempos de respuesta objetivo <500ms percentil 95 para operaciones CRUD típicas (login, validar sesión) — estándar razonable para una app web/móvil de este tipo, sin requisitos de rendimiento extremos declarados por el usuario.

## Preguntas de NFR y Selección de Stack Tecnológico

### Pregunta 1: Lenguaje y Framework de Backend
¿Qué lenguaje/framework usamos para todo el backend (las 5 unidades de negocio)?

A) **Node.js + TypeScript** (ej. NestJS o Express) — **recomendado**: ecosistema grande, el tipado de TypeScript ayuda a mantener consistencia en un monolito modular con varios dominios, buen soporte de librerías para Google OAuth, productivo para un desarrollador trabajando solo

B) **Python + FastAPI** — también muy productivo, tipado con Pydantic, buena opción si tienes más experiencia previa en Python

C) **Java/Kotlin + Spring Boot** — ecosistema maduro y muy usado para monolitos modulares grandes, pero más verboso/pesado de configurar para iterar rápido como proyecto individual

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Pregunta 2: Motor de Base de Datos
¿Qué motor de base de datos usamos?

A) **PostgreSQL** (relacional) — **recomendado**: los datos tienen relaciones e integridad importantes (aislamiento multi-tenant por `grupoFamiliarId`, relaciones Usuario–Sesión–Membresía–Gasto, etc.); un motor relacional con *foreign keys* y *constraints* es la opción más segura para reforzar esas reglas a nivel de base de datos, no solo de aplicación

B) **NoSQL orientada a documentos** (ej. MongoDB, DynamoDB) — más flexible ante cambios de esquema, pero obliga a implementar el aislamiento multi-tenant "a mano", sin ayuda de constraints relacionales

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Pregunta 3: Mecanismo de Sesión
¿Cómo implementamos la `Sesion` definida en Functional Design?

A) **Tokens de sesión opacos, con estado server-side** (guardados en base de datos o caché) — **recomendado**: permite invalidación inmediata al cerrar sesión (BR-05) sin necesidad de listas de revocación, más alineado con SECURITY-12 que un JWT autocontenido

B) **JWT autocontenido** (sin estado en el servidor) — valida más rápido sin ir a la base de datos, pero para cumplir BR-05/SECURITY-12 (invalidación inmediata) igual necesitaría una lista de revocación, lo que anula buena parte de la ventaja de no tener estado

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Pregunta 4: Proveedor de Hosting / Infraestructura
¿Dónde se despliega el backend?

A) **AWS** — ecosistema con el que está alineado este propio framework (AI-DLC menciona CDK, Lambda, etc.); buena opción si más adelante quieres usar infraestructura como código con CDK

B) **Plataforma administrada más simple** (ej. Render, Fly.io, Railway) — **recomendado** para un proyecto individual en etapa de validación: menor curva de configuración inicial, menor costo operativo, base de datos administrada incluida, sin sacrificar la posibilidad de migrar a AWS más adelante si el producto crece

C) Otro proveedor cloud (Azure, GCP) — indícalo en Other

X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Pregunta 5: Expectativa de Escala Inicial
¿Qué escala esperamos en los primeros meses, para dimensionar sin sobre-invertir?

A) Decenas de familias (etapa de validación/beta) — **recomendado** como supuesto de partida, dado que es un producto nuevo sin usuarios todavía

B) Cientos o miles de familias desde el lanzamiento (ya existe un canal de distribución o lista de espera grande)

X) Other (please describe after [Answer]: tag below)

[Answer]: A
