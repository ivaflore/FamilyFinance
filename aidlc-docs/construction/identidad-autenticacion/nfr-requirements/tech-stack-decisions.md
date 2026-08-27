# Decisiones de Stack Tecnológico — Backend FamilyFinance

**Alcance**: estas decisiones aplican a **todo el backend** (Unidades 1-5). Se documentan aquí (Unidad 1, primera en construirse) y se heredan sin volver a decidirlas.

| Decisión | Elegido | Razón |
|---|---|---|
| Lenguaje / Runtime | **Node.js 20 LTS + TypeScript** | Tipado fuerte para consistencia en un monolito modular multi-dominio; ecosistema maduro para OAuth y APIs REST; productivo para un desarrollador solo. |
| Framework HTTP | **Express** | Simple, ampliamente documentado, suficiente para un monolito modular sin necesitar las convenciones adicionales de NestJS en esta etapa. |
| ORM / Acceso a datos | **Prisma** | Migraciones versionadas, cliente tipado (reduce errores de acceso a datos entre unidades), buena velocidad de desarrollo para un proyecto individual. |
| Base de Datos | **PostgreSQL 16** | Relacional, con *foreign keys* y *constraints* que refuerzan el aislamiento multi-tenant (`grupoFamiliarId`) a nivel de base de datos, no solo de aplicación. |
| Autenticación | **Google Identity Services (Sign In With Google)**, verificación de ID Token server-side con `google-auth-library` | Login exclusivo con Google (RF-01); no requiere gestionar contraseñas propias (BR-06). |
| Sesión | **Tokens opaques, hash almacenado en PostgreSQL**, entregados como cookie `httpOnly; Secure; SameSite=Lax` | Invalidación inmediata al cerrar sesión (BR-05/SECURITY-12); el hash (no el token en claro) se guarda en base de datos, consistente con buenas prácticas de gestión de credenciales. |
| Hosting (objetivo, a confirmar por el usuario al desplegar) | **Plataforma administrada simple** (Render/Fly.io/Railway) sobre AWS directo | Menor fricción para un proyecto individual en validación; PostgreSQL administrado incluido; migrable a AWS más adelante sin cambios de código (Prisma + variables de entorno). |
| Testing | **Node.js test runner (`node:test`) + `fast-check`** para pruebas basadas en propiedades (PBT-09) | `fast-check` es el framework recomendado para JS/TS en `property-based-testing.md`; se integra con el test runner nativo sin dependencias adicionales de framework de pruebas. |
| Escala de diseño | Decenas de familias en los primeros meses | Sin necesidad de arquitectura de alta escala desde el día uno; el monolito modular en una instancia pequeña + Postgres administrado es suficiente. |

## Variables de Entorno Requeridas (backend)

```
DATABASE_URL=postgresql://usuario:password@host:5432/familyfinance
GOOGLE_CLIENT_ID=<Client ID de Google Cloud Console, tipo "Web application">
SESSION_COOKIE_SECURE=true   # false solo en desarrollo local sin HTTPS
PORT=3000
```

**Nota importante para el usuario**: `GOOGLE_CLIENT_ID` debe crearse en [Google Cloud Console](https://console.cloud.google.com/) (APIs & Services → Credentials → OAuth Client ID → Web application), agregando el dominio donde se sirva el frontend a los orígenes autorizados. Esta sesión no tiene acceso a tu cuenta de Google Cloud — el código queda listo para conectarse en cuanto proveas ese valor.
