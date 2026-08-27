# Functional Design + NFR (condensado) — Unidad 6: Frontend Web

## Stack Elegido

**Vite + TypeScript, sin framework de UI pesado (sin React/Vue)** — DOM manipulado directamente, reutilizando casi textualmente el sistema de diseño CSS del prototipo (`index.html`: paleta de colores, tipografía, layout de paneles). Razón: mantiene la simplicidad que ya funcionaba en el prototipo (que era 100% vanilla), agrega tipado y un dev-server moderno sin la curva de aprendizaje ni el peso de un framework de componentes, adecuado para un desarrollador trabajando solo.

## Pantallas / Flujos

| Pantalla | Endpoints que consume | Historias |
|---|---|---|
| Login | `POST /api/auth/google` | US-01 |
| Onboarding (sin grupo) | `GET /api/me`, `POST /api/groups`, `POST /api/invitations/:token/accept` | US-02, US-03, US-05 |
| Dashboard | `GET /api/groups/:id/gastos`, `/presupuesto`, alacena (conteo) | Resumen general |
| Gastos | `GET/POST /api/groups/:id/gastos` | US-08, US-09 |
| Presupuesto | `GET/PUT /api/groups/:id/presupuesto` | US-10, US-11 |
| Alacena | `GET/POST /api/groups/:id/alacena` | US-12 |
| Compras | `GET/POST/PATCH /api/groups/:id/compras`, `POST .../generar-desde-menu` | US-13, US-14 |
| Recetario | `GET/POST /api/groups/:id/recetas` | US-15 |
| Calendario | `GET/POST /api/groups/:id/calendario` | US-16 |
| Segmentación | `GET/POST /api/groups/:id/segmentacion` | US-17 |
| Asistente | `POST /api/groups/:id/asistente` | US-18 |
| Familia | `GET /api/groups/:id/miembros`, `/miembros/aportes`, `POST /api/groups/:id/invite` | US-04, US-06, US-07, US-19 |

## Manejo de Estado

- Estado de sesión (usuario + grupo activo) en un módulo `state.ts` en memoria, hidratado al cargar la app desde `GET /api/me` (la cookie de sesión ya viaja automáticamente por ser mismo origen — sin necesidad de guardar tokens en `localStorage`).
- Cada pantalla hace `fetch` directo a su endpoint al activarse (sin caché global ni store complejo) — consistente con la simplicidad del resto del stack.

## Validación de Formularios

- Validación básica en cliente (campos requeridos, montos positivos) **solo como UX** — la validación real y bloqueante ocurre siempre en el backend (SECURITY-05), el cliente nunca es la única línea de defensa.

## Responsive / Android (RF-11, US-20)

- Mobile-first: mismo criterio del prototipo (breakpoint 768px, sidebar colapsable a nav inferior). Se prueba explícitamente en viewport de celular antes de dar la unidad por completa.

## Cumplimiento de Seguridad

- SECURITY-05: sanitización de cualquier texto ingresado por el usuario antes de insertarlo en el DOM (reemplaza el patrón de `innerHTML` sin escapar detectado en el prototipo original — se usa una función `escapeHtml()` centralizada en todos los puntos donde se interpola texto de usuario).
