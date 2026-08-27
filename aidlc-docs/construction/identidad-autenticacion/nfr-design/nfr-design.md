# NFR Design + Infrastructure Design — Backend (Unidades 1-5)

**Nota de alcance**: por instrucción explícita del usuario ("avanza con todas las etapas siguientes según tus recomendaciones hasta dejar la aplicación operativa"), este documento condensa **NFR Design** e **Infrastructure Design** para las 5 unidades de backend en un solo lugar (en vez de repetir la ceremonia completa 5 veces), ya que comparten el mismo stack, el mismo patrón de capas y la misma infraestructura (monolito modular — Application Design). Las decisiones específicas de negocio de cada unidad siguen documentándose en su propio `functional-design/`.

## Patrón de Capas (Application Design: Controlador → Servicio → Repositorio)

```
backend/src/
├── <unidad>/
│   ├── <unidad>.routes.ts      (Controlador: define endpoints Express, valida input con zod)
│   ├── <unidad>.service.ts     (Servicio: logica de negocio, reglas de BR-XX)
│   └── <unidad>.repository.ts  (Repositorio: unico lugar que llama a Prisma para esta unidad)
├── middleware/
│   ├── auth.ts                 (requireAuth: valida cookie de sesion -> req.usuarioId)
│   ├── grupo.ts                (requireGrupo: resuelve grupoFamiliarId activo -> req.grupoFamiliarId, SECURITY-08)
│   └── errorHandler.ts         (BR-04/SECURITY-09/SECURITY-15: errores genericos, logging interno completo)
├── db/
│   └── prisma.ts               (cliente Prisma unico, pool de conexiones)
└── index.ts                    (bootstrap de Express, monta cada <unidad>.routes.ts)
```

## Restricción Transversal (SECURITY-08, PROP-05 style)

**Todo router de negocio (`gastos`, `presupuesto`, `alacena`, `compras`, `recetas`, `calendario`, `segmentacion`, `asistente`) se monta detrás de `requireAuth` + `requireGrupo`.** Ningún repositorio de esas unidades acepta un `grupoFamiliarId` que no venga de `req.grupoFamiliarId` (resuelto server-side); no se lee de `req.params`/`req.body` para ese propósito. Esto es el equivalente en código del Middleware de Autorización de `services.md`.

## Manejo de Errores (SECURITY-09, SECURITY-15)

- Middleware `errorHandler` centralizado, montado al final de la cadena Express.
- Todo error se registra internamente (con detalle completo) vía logger; la respuesta al cliente es siempre `{ error: "mensaje genérico" }` con el código HTTP apropiado (400/401/403/404/500), nunca stack traces ni detalles de Prisma/Postgres.
- Fail closed: cualquier excepción no controlada en un handler produce 500 genérico, nunca expone datos parciales.

## Logging

- Logger simple basado en `console` con formato JSON estructurado (`{timestamp, nivel, mensaje, requestId, usuarioId?}`), sin registrar nunca el token de sesión, el ID Token de Google, ni datos financieros sensibles en texto — solo IDs.

## Infraestructura

### Contenedores (desarrollo y despliegue)

```
familyfinance/
├── docker-compose.yml     (postgres + backend + frontend, para correr todo localmente con un comando)
├── backend/
│   ├── Dockerfile
│   └── ...
└── frontend/
    ├── Dockerfile
    └── ...
```

- **Base de datos**: PostgreSQL 16, contenedor `postgres:16-alpine` en desarrollo; en producción, servicio administrado de PostgreSQL de la plataforma de hosting elegida (`DATABASE_URL` por variable de entorno — sin credenciales hardcodeadas, SECURITY-09/SECURITY-12).
- **Backend**: contenedor Node 20, expone `PORT` (por defecto 3000), sirve también los archivos estáticos del frontend ya compilado (mismo origen → cookies de sesión sin complicaciones de CORS cross-site).
- **Migraciones**: `prisma migrate deploy` se ejecuta al iniciar el contenedor del backend (script `entrypoint`), para que la base de datos quede al día automáticamente.
- **Health check**: `GET /api/health` devuelve `200 { ok: true }` sin tocar la base de datos (para checks de infraestructura rápidos) y `GET /api/health/db` que sí valida conexión a Postgres.

### Redes y Acceso

- El backend expone únicamente el puerto HTTP interno; la terminación TLS/HTTPS la asume la plataforma de hosting (Render/Fly.io/Railway ya la proveen por defecto) — consistente con SECURITY-01 (cifrado en tránsito) sin necesitar configurar certificados manualmente.
- Cookie de sesión con `Secure=true` en producción (exige HTTPS); `Secure=false` solo permitido en desarrollo local vía `SESSION_COOKIE_SECURE=false`.

## Cumplimiento

- **Seguridad**: SECURITY-01 (TLS, delegado al hosting), SECURITY-03 (logging estructurado sin secretos), SECURITY-08 (middleware `requireGrupo` en todo router de negocio), SECURITY-09/15 (errorHandler centralizado) — compliant a nivel de diseño; se verifica en Code Generation.
- **Resiliencia**: RESILIENCY-02 ya resuelto (Backup & Restore); despliegue de una sola instancia + Postgres administrado con backups automáticos de la plataforma — N/A las reglas de multi-región/failover activo (fuera del alcance elegido).
