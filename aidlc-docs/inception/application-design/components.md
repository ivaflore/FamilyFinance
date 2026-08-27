# Componentes de la Aplicación — FamilyFinance

Diseño agnóstico de tecnología (Pregunta 1 = A: límites de componentes iguales a la secuencia de unidades ya acordada). El stack tecnológico concreto se decide en NFR Requirements (Construction).

---

## Componente 1: Identidad y Autenticación

- **Propósito**: Autenticar usuarios exclusivamente vía Google OAuth (RF-01), emitir y validar sesiones, y mantener el perfil básico del usuario.
- **Responsabilidades**:
  - Verificar el token de Google recibido del frontend y crear/recuperar el perfil del usuario.
  - Emitir y validar tokens de sesión propios de la aplicación.
  - Invalidar sesiones al cerrar sesión o al expirar (SECURITY-12).
- **Interfaz**: Expone operaciones de autenticación y consulta de perfil (ver `component-methods.md`).
- **No es responsable de**: saber a qué grupo(s) familiar(es) pertenece el usuario (eso es de Grupos Familiares).

## Componente 2: Grupos Familiares

- **Propósito**: Gestionar la creación de grupos familiares, la membresía, los roles y las invitaciones, y ser la fuente de verdad del aislamiento multi-tenant (RF-02).
- **Responsabilidades**:
  - Crear grupos y asignar al creador como Administrador.
  - Emitir y validar invitaciones (por correo o link), con expiración.
  - Mantener la membresía y el rol (Administrador/Miembro) de cada usuario en cada grupo.
  - Resolver, para cada request, a qué `grupoFamiliarId` pertenece el usuario autenticado (base de la restricción SECURITY-08).
- **Interfaz**: Expone operaciones de grupo, invitación y membresía.
- **Restricción transversal**: Este componente es la autoridad de la que dependen TODOS los demás componentes de negocio para resolver el `grupoFamiliarId` activo antes de leer o escribir cualquier dato.

## Componente 3: Núcleo Financiero

- **Propósito**: Gastos, presupuesto y panel de aportes por miembro (RF-03, RF-04, RF-10).
- **Responsabilidades**:
  - Registrar gastos asociados a un grupo y a un miembro.
  - Mantener el presupuesto por categoría del grupo y su estado (gastado/disponible).
  - Actualizar automáticamente el presupuesto de la categoría correspondiente al registrar un gasto (patrón ya validado en el prototipo).
  - Calcular el aporte (monto y cantidad de transacciones) de cada miembro del grupo.
- **Interfaz**: Expone operaciones de gasto y presupuesto.

## Componente 4: Hogar

- **Propósito**: Alacena, lista de compras, recetario y calendario/menú mensual (RF-05, RF-06, RF-07).
- **Responsabilidades**:
  - Mantener el inventario de alacena del grupo, con alerta de "por agotarse".
  - Mantener la lista de compras compartida del grupo (agregar, marcar como comprado).
  - Mantener el recetario del grupo.
  - Mantener la planificación del menú mensual (recetas asignadas a días/tipo de comida).
  - Generar la lista de compras a partir del menú planificado (orquestación interna, ver `services.md`).
- **Interfaz**: Expone operaciones de alacena, compras, recetario y calendario.

## Componente 5: Insights

- **Propósito**: Segmentación de productos y asistente de ahorro/recetas basado en datos reales (RF-08, RF-09).
- **Responsabilidades**:
  - Clasificar productos habituales del grupo en 1ª categoría / 2ª categoría / Prescindible, y calcular ahorro potencial.
  - Responder preguntas del usuario (recetas, ahorro, presupuesto, alacena) usando datos reales del grupo, sin llamadas a servicios de IA externos (heredado del hallazgo de seguridad ya remediado en el prototipo — ver `code-quality-assessment.md`).
- **Interfaz**: Expone operaciones de segmentación y consulta al asistente.
- **Dependencias de lectura**: Consulta (solo lectura) datos de Núcleo Financiero y Hogar para componer sus respuestas.

## Componente 6: Frontend Web

- **Propósito**: Interfaz de usuario responsive (RF-11), consumidora de la API REST expuesta por el backend.
- **Responsabilidades**:
  - Presentar el flujo de onboarding (login, crear/unirse a grupo).
  - Presentar cada área funcional (Dashboard, Gastos, Presupuesto, Alacena, Compras, Recetario, Calendario, Segmentación, Asistente, Panel de Familia).
  - Conservar el sistema de diseño visual del prototipo actual (`index.html`: paleta de colores, tipografía, estructura de paneles) como base de marca — ver `aidlc-docs/inception/reverse-engineering/code-structure.md`.
  - Ser completamente usable desde el navegador de un dispositivo Android (mobile-first).
- **Interfaz**: Consume la API REST de los demás componentes; no expone una API propia (es la capa de presentación).
