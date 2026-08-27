# Code Generation + Build and Test — Resumen (condensado)

*Por instrucción explícita del usuario de avanzar directo a una aplicación operativa, Code Generation y Build and Test se documentan aquí de forma consolidada para las 6 unidades, en vez de repetir la ceremonia completa por unidad.*

## Código Generado

| Unidad | Ubicación | Contenido |
|---|---|---|
| 1. Identidad y Autenticación | `backend/src/identidad/` | Login con Google, sesión opaca server-side, middleware `requireAuth` |
| 2. Grupos Familiares | `backend/src/grupos-familiares/` | Crear grupo, invitar, aceptar invitación, roles, middleware `requireGrupo`/`requireAdmin` |
| 3. Núcleo Financiero | `backend/src/nucleo-financiero/` | Gastos, presupuesto (derivado, no contador — BR-15), aporte por miembro |
| 4. Hogar | `backend/src/hogar/` | Alacena, lista de compras, recetario, calendario, generación de lista desde menú |
| 5. Insights | `backend/src/insights/` | Segmentación de productos, asistente local basado en reglas |
| 6. Frontend Web | `frontend/src/` | SPA en Vite+TypeScript, 12 pantallas, mismo sistema de diseño del prototipo |
| Transversal | `backend/src/middleware/`, `backend/src/db/`, `backend/src/lib/` | Middleware de autorización (SECURITY-08), manejo de errores (SECURITY-09/15), sesión |
| Esquema de datos | `backend/prisma/schema.prisma` | 10 modelos, todos con `grupoFamiliarId` para el aislamiento multi-tenant |

Cada unidad separa lógica pura testable (`*.logic.ts`) de acceso a datos (`*.repository.ts`) y orquestación (`*.service.ts`/`*.routes.ts`), siguiendo el patrón de capas de `nfr-design.md`.

## Pruebas

### Pruebas Basadas en Propiedades (PBT, extensión habilitada con enforcement completo)

18 propiedades identificadas en Functional Design; las siguientes están implementadas y **pasando** con `fast-check` (`backend/tests/*.logic.test.ts`, 13 pruebas en total incluyendo ejemplos de regresión — PBT-10):

- PROP-05, PROP-06 (Identidad): validez de sesión, expiración siempre posterior a la actividad.
- PROP-07 (Grupos): nunca queda un grupo sin administrador. BR-11 (invitaciones): revocada/expirada nunca es aceptable.
- PROP-11, PROP-12 (Núcleo Financiero): conservación de aportes, gastado nunca negativo.
- PROP-15 (Hogar): generar la lista desde el menú es idempotente, sin duplicados.
- PROP-18 (Insights): el resumen de segmentación conserva el total exacto.

**Resultado real de ejecución**: `13 pass, 0 fail` (ver comando `npm test` en `backend/`).

Las propiedades restantes (PROP-01 a 04, 08 a 10, 13, 14, 16, 17) dependen de estado en base de datos (unicidad, aislamiento multi-tenant entre grupos reales, idempotencia de invitaciones) — quedan documentadas como pruebas de integración a implementar contra una base de datos de pruebas, siguiendo el mismo patrón ya validado.

### Verificación end-to-end manual (contra PostgreSQL real)

Se levantó PostgreSQL 16 localmente, se aplicó la migración inicial (`prisma migrate dev`), se corrió el backend compilado y se ejercitó la API completa con una sesión válida (simulada directamente en base de datos, ya que el login real de Google requiere credenciales que esta sesión no posee):

- Crear grupo → queda como Administrador ✅
- Registrar gasto → presupuesto se actualiza automáticamente (BR-15, derivado de `SUM`) ✅
- Alacena, aportes por miembro, asistente (respuestas con datos reales) ✅
- **Aislamiento multi-tenant**: acceso a un grupo ajeno → `403` ✅; sin sesión → `401` ✅

Se levantó también el frontend (`vite dev`) contra el backend real y se verificó visualmente en navegador (Chromium headless): Dashboard, Gastos (con formulario funcional), Alacena, Asistente, y el diseño responsive en viewport de celular (390×844) — capturas de pantalla revisadas durante la sesión.

### Build

- `backend`: `tsc --noEmit` sin errores; `npm run build` genera `dist/` + cliente Prisma.
- `frontend`: `tsc --noEmit` sin errores; `npm run build` genera `dist/` (bundle de 28KB gzip: 7KB).

## Pendiente para un despliegue en producción real (fuera del alcance de esta sesión)

- Credenciales reales de Google OAuth (`GOOGLE_CLIENT_ID`) — el usuario debe crearlas en Google Cloud Console (ver `README.md`).
- Cuenta en la plataforma de hosting elegida (Render/Fly.io/Railway) para desplegar `docker-compose`/`Dockerfile`.
- Pruebas de integración contra base de datos para las propiedades PBT restantes.
- Revisión de las reglas SECURITY-01/02/04/06/07/10/13/14 que dependen de la infraestructura final de despliegue (headers HTTP, TLS, logging centralizado, SRI en CDNs) — la mayoría las provee por defecto la plataforma de hosting recomendada.
