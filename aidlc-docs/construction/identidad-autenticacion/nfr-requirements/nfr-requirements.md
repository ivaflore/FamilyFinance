# NFR Requirements — Unidad 1: Identidad y Autenticación

## Escalabilidad
Decenas de familias en los primeros meses (etapa de validación). Una sola instancia del backend monolito + PostgreSQL administrado es suficiente; sin necesidad de auto-escalado horizontal en este ciclo.

## Rendimiento
<500ms percentil 95 para `iniciarSesionConGoogle` (excluyendo la latencia de verificación contra los servidores de Google) y `validarSesion`.

## Disponibilidad
RTO/RPO en horas, Backup & Restore, una sola región (RESILIENCY-02, ya decidido). Suficiente para esta etapa: no se requiere multi-región ni failover automático.

## Seguridad (Security Baseline — bloqueante)
- SECURITY-01: PostgreSQL con conexión TLS habilitada; cifrado en reposo provisto por el hosting administrado.
- SECURITY-09: mensajes de error genéricos (BR-04).
- SECURITY-12: sesión con expiración server-side, invalidación en logout, cookie `httpOnly/Secure/SameSite` (BR-02, BR-05, ver `tech-stack-decisions.md`).
- SECURITY-05: validación de tipo/formato del ID Token de Google antes de procesarlo (`google-auth-library` ya realiza la verificación criptográfica y de audiencia).

## Confiabilidad
Toda llamada a Google (verificación del ID Token) tiene manejo explícito de error con reintento simple (no reintento automático agresivo, para no exponerse a rate limiting de Google) y falla cerrado (BR-04: sin sesión válida ante cualquier error).

## Mantenibilidad
TypeScript con tipado estricto; Prisma como única vía de acceso a datos (sin SQL embebido disperso); estructura de carpetas por unidad (`backend/identidad/`), consistente con `unit-of-work.md`.

## Usabilidad
El flujo de login debe completarse en un solo toque desde el celular (botón "Continuar con Google" de Google Identity Services), sin formularios adicionales.
