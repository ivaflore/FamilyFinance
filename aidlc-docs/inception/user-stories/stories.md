# Historias de Usuario — FamilyFinance

**Enfoque**: Híbrido — Épicas por área funcional (alineadas a los RF de `requirements.md`), con las épicas de Autenticación y Grupos Familiares ordenadas como journey de onboarding (Pregunta 2 = E).
**Formato**: "Como [persona], quiero [funcionalidad], para [beneficio]" + criterios de aceptación Given/When/Then (Pregunta 3 = A), con casos borde y de error incluidos (Pregunta 4 = A).
**Criterio de éxito de este ciclo** (Pregunta 5 = A): una familia completa el ciclo registro → crear grupo → invitar miembros → registrar y ver gastos compartidos, sin fricción.
**Registro**: exclusivamente con cuenta de Google (Pregunta 6 = A) — ver US-01.

Todas las historias cumplen criterio **INVEST** (Independientes, Negociables, Valiosas, Estimables, Pequeñas, Testeables).

---

## Épica A — Autenticación y Onboarding (RF-01)

### US-01: Iniciar sesión con cuenta de Google
**Como** Usuario Recién Registrado, **quiero** iniciar sesión con mi cuenta de Google, **para** acceder a FamilyFinance sin crear ni recordar otra contraseña.

- Given que no tengo cuenta en FamilyFinance, When elijo "Continuar con Google" y autentico exitosamente, Then se crea mi perfil (nombre, correo, foto) y quedo autenticado.
- Given que ya tengo cuenta, When inicio sesión con la misma cuenta de Google, Then accedo directamente sin duplicar mi perfil.
- Given que cancelo el flujo de Google o este falla, When vuelvo a la app, Then veo un mensaje de error genérico (sin stack traces ni detalles internos — SECURITY-09) y puedo reintentar.
- Given que mi sesión expiró, When intento realizar cualquier acción, Then se me exige reautenticarme antes de continuar (SECURITY-12).

### US-02: Ver estado "sin grupo" tras el primer login
**Como** Usuario Recién Registrado, **quiero** ver claramente que aún no pertenezco a ningún grupo familiar, **para** saber que debo crear uno o unirme a uno antes de usar el resto de la app.

- Given que inicio sesión por primera vez sin grupos, When llego a la app, Then veo una pantalla de bienvenida con dos opciones: "Crear grupo familiar" y "Unirme con invitación", en vez del dashboard financiero.
- Given que ya tengo al menos un grupo, When inicio sesión, Then voy directo al dashboard de ese grupo (o al último usado si tengo varios).

---

## Épica B — Grupos Familiares (RF-02)

### US-03: Crear un grupo familiar
**Como** Usuario Recién Registrado, **quiero** crear un grupo familiar, **para** empezar a llevar las finanzas de mi familia y convertirme en su Administrador.

- Given que estoy en la pantalla de onboarding, When creo un grupo indicando un nombre válido, Then el grupo se crea, quedo como Administrador, y se genera un link/código de invitación único.
- Given que el nombre del grupo está vacío, When intento crear el grupo, Then el sistema lo rechaza y me pide un nombre (SECURITY-05, validación de entrada).

### US-04: Invitar miembros al grupo
**Como** Administrador de Grupo Familiar, **quiero** invitar a otras personas por correo o link, **para** que puedan unirse a mi grupo y ver/registrar las finanzas familiares juntos.

- Given que soy Administrador, When ingreso el correo de un invitado y confirmo, Then se crea una invitación pendiente y se le notifica.
- Given que el correo ya pertenece al grupo, When intento invitarlo de nuevo, Then el sistema me avisa que ya es miembro, sin crear una invitación duplicada.
- Given que genero un link de invitación general, When alguien lo abre, Then ve la opción de unirse al grupo tras autenticarse con Google (US-01).

### US-05: Aceptar una invitación a un grupo
**Como** Invitado, **quiero** aceptar una invitación a un grupo familiar, **para** empezar a ver y registrar las finanzas de esa familia.

- Given que tengo un link/código de invitación válido y no vencido, When lo abro y me autentico con Google, Then quedo agregado al grupo como Miembro y veo su dashboard.
- Given que el link ya fue usado o expiró, When intento usarlo, Then el sistema me informa que ya no es válido y me sugiere pedir uno nuevo al Administrador.
- Given que ya pertenezco a ese grupo, When abro el link de invitación otra vez, Then el sistema me lleva directo al grupo, sin duplicar mi membresía.

### US-06: Aislamiento estricto de datos entre grupos
**Como** Miembro de Grupo Familiar, **quiero** tener la certeza de que ningún otro grupo puede ver mis datos financieros, **para** confiar en la privacidad de la app.

- Given que pertenezco solo al Grupo A, When intento acceder (por URL directa o cualquier otro medio) a datos del Grupo B, Then el sistema deniega el acceso sin exponer ningún dato del Grupo B (SECURITY-08, autorización a nivel de objeto).
- Given que se necesita soporte técnico sobre mi cuenta, When alguien del equipo accede a mis datos, Then esa acción queda registrada con identidad, timestamp y grupo consultado (SECURITY-03/14).

### US-07: Roles dentro del grupo (Administrador vs. Miembro)
**Como** Administrador de Grupo Familiar, **quiero** ser el único que puede invitar o remover miembros, **para** mantener el control de quién ve las finanzas de mi familia.

- Given que soy Miembro (no Administrador), When intento invitar o remover a alguien, Then el sistema me lo impide y esas opciones ni siquiera se muestran en mi interfaz (autorización a nivel de función, SECURITY-08).
- Given que soy Administrador, When remuevo a un Miembro, Then esa persona pierde acceso al grupo de inmediato y deja de ver sus datos financieros.

---

## Épica C — Gastos Compartidos (RF-03)

### US-08: Registrar un gasto visible para todo el grupo
**Como** Miembro de Grupo Familiar, **quiero** registrar un gasto, **para** que todos los miembros de mi familia lo vean reflejado en el historial y el presupuesto.

- Given que pertenezco a un grupo, When registro un gasto (descripción, monto, categoría), Then aparece en el historial del grupo con mi nombre, y el presupuesto de esa categoría se actualiza para todos.
- Given que otro miembro registra un gasto, When yo vuelvo a abrir la pantalla de Gastos, Then veo su gasto reflejado.
- Given que ingreso un monto no numérico, vacío o negativo, When intento guardar, Then el sistema rechaza el gasto con un mensaje claro (SECURITY-05).

### US-09: Ver historial de gastos del grupo
**Como** Miembro de Grupo Familiar, **quiero** ver el historial completo de gastos de mi familia (no solo los míos), **para** entender en qué se está gastando el dinero del hogar.

- Given que mi grupo tiene gastos registrados por varios miembros, When abro "Gastos", Then veo todos los gastos del grupo con quién los registró, del más reciente al más antiguo.

---

## Épica D — Presupuesto (RF-04)

### US-10: Definir presupuesto mensual por categoría
**Como** Administrador de Grupo Familiar, **quiero** definir cuánto presupuesto asignar a cada categoría, **para** controlar el gasto familiar mensual.

- Given que soy Administrador, When defino un monto de presupuesto para una categoría, Then ese monto queda disponible para todos los miembros al ver el resumen.
- Given que soy Miembro (no Administrador), When intento editar el presupuesto, Then el sistema me lo impide.

### US-11: Ver el estado del presupuesto en tiempo real
**Como** Miembro de Grupo Familiar, **quiero** ver cuánto llevamos gastado y cuánto queda disponible por categoría, **para** decidir si puedo hacer una compra sin excedernos.

- Given que hay gastos registrados en una categoría, When abro "Presupuesto", Then veo el monto gastado, el disponible, y una alerta visual si la categoría está sobrepasada.

---

## Épica E — Alacena Compartida (RF-05)

### US-12: Ver y actualizar la alacena del grupo
**Como** Miembro de Grupo Familiar, **quiero** ver y actualizar el inventario de la alacena de mi familia, **para** saber qué productos tenemos y cuáles están por acabarse.

- Given que un miembro agrega un producto a la alacena, When otro miembro abre "Alacena", Then ve el producto recién agregado.
- Given que un producto está marcado "por agotarse", When cualquier miembro abre el dashboard, Then ve la alerta correspondiente.

---

## Épica F — Lista de Compras Compartida (RF-06)

### US-13: Compartir la lista de compras entre miembros
**Como** Miembro de Grupo Familiar, **quiero** que la lista de compras se actualice para todos cuando alguien marca un ítem como comprado, **para** evitar comprar cosas duplicadas.

- Given que estoy en el supermercado con la lista abierta, When otro miembro marca un ítem como comprado, Then yo veo ese ítem marcado (al volver a esa pantalla, como mínimo).
- Given que marco un ítem como comprado dos veces seguidas, When reviso la lista, Then el estado final es el mismo que si lo hubiera marcado una sola vez (idempotencia — ver NFR-02).

### US-14: Generar la lista de compras desde el menú planificado
**Como** Miembro de Grupo Familiar, **quiero** generar la lista de compras a partir del menú del mes, **para** no armarla manualmente ingrediente por ingrediente.

- Given que el grupo tiene comidas planificadas en el calendario, When genero la lista desde el menú, Then se agregan los ingredientes faltantes sin duplicar los que ya estaban en la lista.

---

## Épica G — Recetario y Menú Mensual (RF-07)

### US-15: Mantener el recetario del grupo
**Como** Miembro de Grupo Familiar, **quiero** agregar y ver recetas propias de mi familia, **para** reutilizarlas en la planificación del menú.

- Given que agrego una receta nueva con nombre, ingredientes y pasos, When la guardo, Then queda visible para todos los miembros del grupo.

### US-16: Planificar el menú mensual compartido
**Como** Miembro de Grupo Familiar, **quiero** planificar el menú del mes asignando recetas a días específicos, **para** que toda la familia sepa qué se cocinará.

- Given que asigno una receta a un día del calendario, When otro miembro abre "Menú del mes", Then ve esa receta planificada en ese día.

---

## Épica H — Segmentación de Productos (RF-08)

### US-17: Clasificar productos por segmento de ahorro
**Como** Miembro de Grupo Familiar, **quiero** clasificar mis productos habituales en esenciales, complementarios o prescindibles, **para** identificar oportunidades de ahorro como grupo.

- Given que reclasifico un producto de "esencial" a "prescindible", When cualquier miembro abre "Segmentación", Then ve el resumen de ahorro potencial actualizado.

---

## Épica I — Asistente (RF-09)

### US-18: Consultar al asistente sobre mis datos reales
**Como** Miembro de Grupo Familiar, **quiero** preguntarle al asistente sobre mis gastos, ahorro o recetas, **para** recibir sugerencias basadas en los datos reales de mi familia.

- Given que le pregunto al asistente sobre mis gastos, When responde, Then la respuesta refleja únicamente los datos de MI grupo (nunca de otro grupo — ligado a US-06).

---

## Épica J — Panel de Familia (RF-10)

### US-19: Ver el aporte de cada miembro
**Como** Miembro de Grupo Familiar, **quiero** ver cuánto gastó cada miembro y cuántas transacciones registró, **para** tener transparencia sobre el gasto familiar.

- Given que varios miembros registraron gastos este mes, When abro "Mi familia", Then veo el total y el conteo de transacciones por cada miembro, sumando exactamente el total general del grupo.

---

## Épica K — Disponibilidad Android (Web Responsive) (RF-11)

### US-20: Usar la app cómodamente desde un celular Android
**Como** Miembro de Grupo Familiar, **quiero** usar todas las funciones de FamilyFinance desde el navegador de mi celular Android, **para** registrar gastos al momento, por ejemplo en el supermercado.

- Given que abro la app desde Chrome en Android, When navego por cualquier sección (incluyendo formularios y modales), Then los elementos son legibles y usables sin necesidad de hacer zoom, con controles de tamaño adecuado para uso táctil.
- Given que estoy completando el formulario de "Registrar gasto" en un celular, When el teclado virtual aparece, Then el formulario sigue siendo usable (no queda tapado ni corta la vista del botón de guardar).

---

## Trazabilidad Resumen

| Épica | Requisito Funcional | Historias |
|---|---|---|
| A. Autenticación y Onboarding | RF-01 | US-01, US-02 |
| B. Grupos Familiares | RF-02 | US-03 a US-07 |
| C. Gastos Compartidos | RF-03 | US-08, US-09 |
| D. Presupuesto | RF-04 | US-10, US-11 |
| E. Alacena Compartida | RF-05 | US-12 |
| F. Lista de Compras Compartida | RF-06 | US-13, US-14 |
| G. Recetario y Menú Mensual | RF-07 | US-15, US-16 |
| H. Segmentación de Productos | RF-08 | US-17 |
| I. Asistente | RF-09 | US-18 |
| J. Panel de Familia | RF-10 | US-19 |
| K. Disponibilidad Android | RF-11 | US-20 |

**Total**: 20 historias en 11 épicas, cubriendo los 11 requisitos funcionales de `requirements.md`.
