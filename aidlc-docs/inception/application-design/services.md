# Servicios y Orquestación — FamilyFinance

Estilo de orquestación: llamadas directas síncronas dentro del monolito modular (Pregunta 4 = A). No hay bus de eventos ni mensajería en este ciclo.

---

## Servicio de Middleware de Autorización (transversal)

- **Responsabilidad**: Interceptar toda request al backend antes de que llegue a cualquier componente de negocio (Núcleo Financiero, Hogar, Insights).
- **Orquestación**:
  1. Llama a **Identidad y Autenticación** → `validarSesion(token)` para obtener el usuario.
  2. Llama a **Grupos Familiares** → `resolverGrupoActivo(usuarioId)` para obtener el `grupoFamiliarId`.
  3. Inyecta `usuarioId` y `grupoFamiliarId` en el contexto de la request antes de invocar el componente de negocio destino.
  4. Si no hay sesión válida o no hay grupo activo, corta la request (401/403) antes de llegar al componente de negocio.
- **Justificación**: Es la implementación concreta de la restricción SECURITY-08 (autorización a nivel de aplicación) — ningún componente de negocio confía en un `grupoFamiliarId` que venga directamente del cliente.

## Servicio de Onboarding

- **Responsabilidad**: Orquestar el flujo inmediatamente después del login (US-02).
- **Orquestación**:
  1. Tras `iniciarSesionConGoogle` (Identidad), llama a **Grupos Familiares** → `listarGruposDeUsuario(usuarioId)`.
  2. Si la lista está vacía, dirige al frontend a la pantalla de "Crear grupo / Unirme con invitación".
  3. Si no está vacía, dirige al dashboard del grupo activo.

## Servicio de Registro de Gasto con Actualización de Presupuesto

- **Responsabilidad**: Dentro de **Núcleo Financiero**, mantener sincronizados Gastos y Presupuesto (patrón ya validado en el prototipo: `addGasto()` actualiza `budgets`).
- **Orquestación**: `registrarGasto` internamente invoca la actualización del `Presupuesto` de la categoría correspondiente en la misma operación (transaccional — ambos cambios se confirman juntos o ninguno, ver NFR Design).

## Servicio de Generación de Lista de Compras desde el Menú

- **Responsabilidad**: Dentro de **Hogar**, orquestar Calendario + Recetario → Lista de Compras (US-14).
- **Orquestación**: `generarListaDesdeMenu` lee las comidas planificadas del Calendario del grupo, resuelve los ingredientes de cada Receta asociada, y agrega a la Lista de Compras solo los ingredientes que no estén ya presentes (evita duplicados — mismo patrón que el prototipo).

## Servicio de Asistente (Insights)

- **Responsabilidad**: Componer respuestas del asistente combinando datos de varios componentes, siempre acotado al grupo activo (US-18).
- **Orquestación**:
  1. Recibe `grupoFamiliarId` ya resuelto por el Middleware de Autorización (nunca lo determina por su cuenta).
  2. Según palabras clave de la pregunta, hace llamadas de **solo lectura** a Núcleo Financiero (`obtenerEstadoPresupuesto`, `listarGastos`) y/o Hogar (`listarAlacena`, `listarRecetas`) del mismo grupo.
  3. Compone la respuesta localmente (sin llamadas a servicios de IA externos, ver hallazgo remediado en `code-quality-assessment.md`).

## Mapa de Servicios → Componentes que Orquestan

| Servicio | Componentes que coordina |
|---|---|
| Middleware de Autorización | Identidad y Autenticación, Grupos Familiares (antepuesto a todos los demás) |
| Onboarding | Identidad y Autenticación → Grupos Familiares |
| Registro de Gasto con Presupuesto | Núcleo Financiero (interno) |
| Generación de Lista desde Menú | Hogar (interno) |
| Asistente | Insights → Núcleo Financiero (lectura) + Hogar (lectura) |
