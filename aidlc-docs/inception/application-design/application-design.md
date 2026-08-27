# Application Design — FamilyFinance (Consolidado)

Este documento consolida `components.md`, `component-methods.md`, `services.md` y `component-dependency.md`. Es un diseño de **alto nivel y agnóstico de tecnología**: la lógica de negocio detallada se define en Functional Design (Construction, por unidad) y el stack tecnológico concreto en NFR Requirements (Construction, por unidad).

## Decisiones de Arquitectura (aprobadas en `application-design-plan.md`)

| Decisión | Elegido | Razón |
|---|---|---|
| Límites de componentes | Igual a la secuencia de unidades de `execution-plan.md` | Trazabilidad directa a `requirements.md` |
| Estilo arquitectónico | **Monolito modular** | Proyecto individual/pequeño (confirmado en Resiliencia); un solo desplegable, módulos internos bien separados; divisible en microservicios más adelante si el producto escala |
| Estilo de API | **REST + JSON** | Simplicidad, estándar, suficiente para las necesidades actuales |
| Orquestación entre componentes | **Llamadas directas síncronas** | Consistente con monolito modular; evita la complejidad de mensajería/eventos para el tamaño actual del proyecto |
| Patrón de capas | **Controlador → Servicio → Repositorio** | Simple, ampliamente entendido, encaja con Functional Design definiendo la lógica de negocio en la capa de Servicio |

**Nota de multi-tenencia**: el monolito modular sirve igual para que se suscriban varias familias — la capacidad multi-tenant es una decisión del modelo de datos y la capa de autorización (cada dato pertenece a un `grupoFamiliarId`), no del estilo de despliegue.

## Componentes (resumen — ver `components.md` para detalle completo)

1. **Identidad y Autenticación** — Login con Google, sesión, perfil. Sin dependencias salientes.
2. **Grupos Familiares** — Crear/unirse a grupo, invitaciones, roles, y resolución del `grupoFamiliarId` activo (base del aislamiento multi-tenant).
3. **Núcleo Financiero** — Gastos, Presupuesto, Panel de Familia (aporte por miembro).
4. **Hogar** — Alacena, Lista de Compras, Recetario, Calendario/Menú.
5. **Insights** — Segmentación de Productos, Asistente (basado en datos reales, sin llamadas a IA externa).
6. **Frontend Web** — Interfaz responsive, consumidora de la API REST, base visual heredada del prototipo actual.

## Restricción Transversal de Seguridad (SECURITY-08)

Todo request pasa primero por el **Middleware de Autorización**, que resuelve `usuarioId` (vía Identidad) y `grupoFamiliarId` (vía Grupos Familiares) a partir de la sesión — nunca de un parámetro que el cliente controle — antes de llegar a cualquier componente de negocio. Ningún componente (Núcleo Financiero, Hogar, Insights) confía en un `grupoFamiliarId` recibido directamente del cliente.

## Servicios de Orquestación (resumen — ver `services.md` para detalle completo)

- **Middleware de Autorización** (transversal): valida sesión + resuelve grupo activo antes de cada request.
- **Onboarding**: dirige al usuario a crear/unirse a un grupo si no tiene ninguno tras el login.
- **Registro de Gasto con Actualización de Presupuesto**: mantiene sincronizados Gastos y Presupuesto dentro de Núcleo Financiero.
- **Generación de Lista de Compras desde el Menú**: dentro de Hogar, combina Calendario + Recetario → Lista de Compras.
- **Asistente**: en Insights, lee (solo lectura) Núcleo Financiero y Hogar del mismo grupo para componer respuestas.

## Dependencias entre Componentes (resumen — ver `component-dependency.md` para el diagrama completo)

- Identidad y Autenticación: base del sistema, sin dependencias salientes.
- Grupos Familiares: depende de Identidad; todos los demás componentes de negocio dependen de él (vía Middleware) para el aislamiento multi-tenant.
- Núcleo Financiero y Hogar: reciben el `grupoFamiliarId` ya resuelto, no llaman directamente a Grupos Familiares.
- Insights: depende de Núcleo Financiero y Hogar (solo lectura).
- Frontend Web: depende de todos vía REST; ningún componente backend depende del frontend.

## Validación de Completitud y Consistencia

- [x] Los 6 componentes cubren los 11 requisitos funcionales de `requirements.md` (ver mapeo en `components.md` y trazabilidad ya establecida en `stories.md`).
- [x] Las 20 historias de usuario (`stories.md`) son soportadas por al menos un método de algún componente (ver `component-methods.md`, columna "Propósito" con referencias a US-XX).
- [x] La restricción de seguridad SECURITY-08 está reflejada explícitamente en el diseño (Middleware de Autorización), no solo mencionada.
- [x] La secuencia de dependencias (Identidad → Grupos Familiares → Núcleo Financiero/Hogar → Insights) es coherente con la secuencia de unidades ya propuesta en `execution-plan.md`.
- [x] Ningún componente tiene una dependencia circular.
