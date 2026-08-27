# Functional Design (condensado) — Unidad 2: Grupos Familiares

*Condensado por instrucción explícita del usuario de avanzar directo a una app operativa. Sigue el mismo patrón que la Unidad 1, sin ronda adicional de preguntas — decisiones tomadas con criterio propio donde no había ambigüedad de negocio ya resuelta.*

## Entidades

- **GrupoFamiliar**: `id`, `nombre`, `fechaCreacion`.
- **Membresia**: `id`, `grupoFamiliarId`, `usuarioId`, `rol` (`Administrador` | `Miembro`), `fechaIngreso`.
- **Invitacion**: `id`, `grupoFamiliarId`, `tokenInvitacionHash`, `correoInvitado` (opcional — null si es link genérico), `estado` (`Pendiente`|`Aceptada`|`Expirada`|`Revocada`), `fechaCreacion`, `fechaExpiracion`, `creadaPorUsuarioId`.

## Reglas de Negocio

- **BR-08**: al crear un grupo, el creador queda automáticamente como su único `Administrador`.
- **BR-09**: solo un `Administrador` puede invitar, remover miembros o generar nuevos links de invitación (autorización a nivel de función, SECURITY-08).
- **BR-10**: una invitación expira a los 7 días de creada.
- **BR-11**: aceptar una invitación ya usada, revocada o expirada falla con un mensaje claro; si el usuario ya pertenece al grupo, aceptar de nuevo no duplica la membresía (idempotente).
- **BR-12**: un grupo nunca puede quedar sin ningún `Administrador` — remover al último administrador se rechaza (evita grupos huérfanos).
- **BR-13**: toda consulta de este y los demás componentes de negocio filtra siempre por el `grupoFamiliarId` resuelto server-side (middleware `requireGrupo`), nunca por un valor que venga del cliente (SECURITY-08).

## Flujos Clave

1. **Crear grupo** → crea `GrupoFamiliar` + `Membresia` (rol Administrador) en una sola transacción (BR-08).
2. **Invitar** (correo o link genérico) → crea `Invitacion` con token aleatorio (se guarda solo su hash, igual criterio que `Sesion`).
3. **Aceptar invitación** → valida estado/expiración → crea `Membresia` (rol Miembro) si no existe ya (BR-11).
4. **Remover miembro** → valida que quien remueve sea Administrador (BR-09) y que no sea el último Administrador si se remueve a sí mismo (BR-12).
5. **Resolver grupo activo** (`resolverGrupoActivo`) → usado por el middleware `requireGrupo` en cada request de las demás unidades.

## Propiedades Testeables (PBT-01)

| ID | Categoría | Propiedad |
|---|---|---|
| PROP-07 | Invariante | Todo `GrupoFamiliar` tiene al menos un `Administrador` en cualquier secuencia generada de altas/remociones de miembros (BR-12). |
| PROP-08 | Invariante (multi-tenant) | Para dos grupos A≠B generados con datos aleatorios, ninguna consulta con `grupoFamiliarId=A` devuelve filas de B — esta es la propiedad ancla del aislamiento multi-tenant de todo el sistema (US-06). |
| PROP-09 | Idempotencia | `aceptarInvitacion` aplicado dos veces por el mismo usuario sobre el mismo token válido no duplica la `Membresia`. |
| PROP-10 | Round-trip | Toda `Invitacion` recién creada, al resolverse por su token, devuelve el mismo `grupoFamiliarId` con el que fue creada. |
