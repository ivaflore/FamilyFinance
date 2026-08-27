# Plan de Functional Design — Unidad 1: Identidad y Autenticación

## Contexto de la Unidad
- **Responsabilidad**: Login exclusivo con Google OAuth, emisión/validación de sesión, perfil de usuario (`unit-of-work.md`).
- **Historias cubiertas**: US-01 (`unit-of-work-story-map.md`).
- **Dependencias**: Ninguna — es la primera unidad.

## Checklist de Ejecución

- [ ] Confirmar duración/política de sesión (Pregunta 1)
- [ ] Confirmar manejo de revocación de acceso en Google (Pregunta 2)
- [ ] Confirmar identificador único de usuario (Pregunta 3)
- [ ] Generar `aidlc-docs/construction/identidad-autenticacion/functional-design/business-logic-model.md` (incluye sección obligatoria "Propiedades Testeables" por PBT-01)
- [ ] Generar `aidlc-docs/construction/identidad-autenticacion/functional-design/business-rules.md`
- [ ] Generar `aidlc-docs/construction/identidad-autenticacion/functional-design/domain-entities.md`

**Nota**: Esta unidad no incluye frontend propio (el Frontend Web es la Unidad 6), por lo que no aplica `frontend-components.md`.

---

## Decisiones ya Tomadas (no son preguntas abiertas)

- **Manejo de errores** (SECURITY-09, bloqueante): los errores de autenticación mostrados al usuario son genéricos, sin exponer detalles internos (stack traces, mensajes de proveedor, etc.).
- **Validación de sesión server-side en cada request** (SECURITY-12, bloqueante): ya establecido en `component-methods.md` (`validarSesion`).
- **Registro exclusivo con Google** (RF-01 / Pregunta 6 de `story-generation-plan.md`): no hay alternativa de correo/contraseña en este ciclo.

## Preguntas de Diseño Funcional

### Pregunta 1: Duración y Política de Sesión
¿Cuánto tiempo debe durar una sesión antes de requerir reautenticación?

A) Corta (≈1 hora) — más segura, pero más fricción para una app de uso frecuente en el celular

B) Media (≈24 horas), con renovación silenciosa mientras haya actividad — balance entre seguridad y comodidad, **recomendado** para una app de uso diario/semanal como esta

C) Larga (≈30 días, con renovación automática mientras haya actividad) — mínima fricción, pero mayor ventana de riesgo si el dispositivo se pierde o es robado

X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Pregunta 2: Revocación de Acceso en Google / Eliminación de Cuenta de Google
¿Qué debe pasar si un usuario revoca el acceso de FamilyFinance desde su cuenta de Google, o elimina su cuenta de Google?

A) La próxima vez que se use un token inválido, se le pide reautenticarse; su perfil, sus grupos familiares y todos sus datos financieros se conservan intactos — solo pierde la sesión activa — **recomendado**, no hay razón de negocio para borrar datos financieros de la familia por un problema de autenticación de una sola persona

B) Se elimina automáticamente su perfil y su membresía a los grupos familiares

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Pregunta 3: Identificador Único de Usuario
Si Google reporta un identificador de cuenta distinto para el mismo correo (caso raro: cuenta de Google eliminada y recreada con el mismo correo), ¿cómo lo tratamos?

A) Se trata como un usuario nuevo — el identificador único real es el ID de cuenta de Google (`sub` del token), no el correo — **recomendado**, es la práctica estándar de OpenID Connect y evita que alguien "recupere" el acceso a una cuenta ajena simplemente registrando el mismo correo en Google

B) Se intenta fusionar automáticamente con el perfil anterior que tenía el mismo correo

X) Other (please describe after [Answer]: tag below)

[Answer]: A
