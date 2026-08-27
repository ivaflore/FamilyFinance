# Reglas de Negocio — Unidad 1: Identidad y Autenticación

## BR-01: Unicidad de Usuario por Google Sub
Un `googleSub` corresponde a exactamente un `Usuario`. El correo **no** es la clave de unicidad: si Google reporta un `googleSub` distinto para un correo ya usado (caso raro — cuenta eliminada y recreada), se crea un `Usuario` nuevo e independiente, nunca se fusiona con el anterior.
*Fuente*: Pregunta 3 = A.

## BR-02: Duración y Renovación de Sesión
Una `Sesion` es válida por 24 horas desde su `fechaCreacion`. Cada request válido dentro de esa ventana actualiza `fechaUltimaActividad` y renueva silenciosamente `fechaExpiracion` (+24h desde la actividad). Sin actividad durante 24 horas, la sesión pasa a `Expirada` y se exige reautenticación.
*Fuente*: Pregunta 1 = B.

## BR-03: La Revocación en Google No Borra Datos de Negocio
Si la validación de un token de Google falla (token revocado, cuenta de Google eliminada, etc.), solo se invalida la `Sesion` activa. El `Usuario`, su membresía a grupos familiares y todos sus datos financieros permanecen intactos — la próxima vez que inicie sesión exitosamente, recupera acceso a todo tal como estaba.
*Fuente*: Pregunta 2 = A.

## BR-04: Mensajes de Error Genéricos
Cualquier fallo de autenticación (token de Google inválido, error de red, sesión expirada o invalidada) se comunica al usuario con un mensaje genérico y accionable ("No pudimos iniciar tu sesión, intenta de nuevo"), sin exponer causas técnicas, trazas ni detalles del proveedor.
*Fuente*: SECURITY-09 (bloqueante).

## BR-05: Invalidación Inmediata al Cerrar Sesión
Al cerrar sesión explícitamente, el `token` se marca `Invalidada` de inmediato (`fechaInvalidacion` = ahora) y ninguna request posterior con ese token debe considerarse válida, incluso si `fechaExpiracion` todavía no se cumplió.
*Fuente*: SECURITY-12 (bloqueante).

## BR-06: Sin Credenciales Propias
El sistema nunca almacena contraseñas ni credenciales propias del usuario. Toda autenticación se delega íntegramente a Google (RF-01) — no existe flujo de "recuperar contraseña" ni almacenamiento de secretos de usuario en esta unidad.
*Fuente*: RF-01 / Pregunta 6 de `story-generation-plan.md` = A (registro exclusivo con Google).

## BR-07: Validación Server-Side en Cada Request
Ninguna otra unidad (Grupos Familiares, Núcleo Financiero, Hogar, Insights) confía en un `usuarioId` que venga directamente del cliente. Todo request pasa por `validarSesion(token)` de esta unidad antes de continuar.
*Fuente*: SECURITY-12 (bloqueante); consistente con el Middleware de Autorización de `services.md` (Application Design).
