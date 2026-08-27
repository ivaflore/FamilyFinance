# Personas — FamilyFinance

Basadas en la Pregunta 1 del plan de historias (Answer: D — 4 personas/estados).

---

## Persona 1: Administrador de Grupo Familiar

- **Nombre de referencia**: María (basada en "María García", Administradora en el prototipo actual)
- **Rol en el sistema**: Creó un grupo familiar o lo administra; tiene permisos para invitar/remover miembros.
- **Objetivos**: Tener control y visibilidad total de las finanzas de su familia; invitar a su pareja/hijos para que todos vean lo mismo; asegurarse de que solo su familia acceda a esos datos.
- **Motivaciones**: Simplificar la gestión del presupuesto familiar, evitar hojas de cálculo o WhatsApp para coordinar gastos, tener un lugar único y confiable.
- **Frustraciones actuales** (con el prototipo): los datos no se comparten entre dispositivos, cualquiera "es" María porque no hay login real.
- **Contexto de uso**: Revisa la app varias veces por semana, principalmente desde el celular (Android), a veces desde notebook.
- **Nivel técnico**: Medio — usa apps bancarias y de compras, no es desarrolladora.

---

## Persona 2: Miembro de Grupo Familiar

- **Nombre de referencia**: Carlos / Ana (basados en los miembros no-administradores del prototipo actual)
- **Rol en el sistema**: Fue invitado a un grupo existente; puede registrar y ver datos financieros del grupo, pero no gestionar miembros.
- **Objetivos**: Registrar sus propios gastos rápidamente (idealmente desde el celular, en el momento de la compra), ver el estado del presupuesto familiar y la lista de compras compartida.
- **Motivaciones**: Sentirse parte de las decisiones financieras del hogar sin tener que preguntarle todo al Administrador; evitar comprar algo que ya compró otro miembro.
- **Frustraciones actuales**: Hoy no existe — todos "editan" los mismos datos de mentira sin usuarios reales.
- **Contexto de uso**: Uso esporádico pero frecuente, mayormente en movimiento (supermercado, camino a casa) — el uso en Android es crítico para esta persona (RF-11).
- **Nivel técnico**: Medio-bajo — necesita una interfaz simple y rápida, sin fricción.

---

## Persona 3: Usuario Recién Registrado (sin grupo aún)

- **Rol en el sistema**: Se autenticó con Google por primera vez pero todavía no creó ni se unió a un grupo familiar. Estado transitorio de onboarding.
- **Objetivos**: Entender rápidamente qué hacer a continuación — crear su propio grupo o unirse a uno existente.
- **Motivaciones**: Curiosidad por probar el producto (posible usuario que llegó por publicidad/recomendación) o alguien a quien le compartieron el link de la app pero aún no tiene invitación.
- **Frustraciones potenciales**: Si no queda claro qué hacer al entrar sin grupo, puede abandonar la app en el primer minuto — este es el momento más crítico de conversión del producto comercial.
- **Contexto de uso**: Primera sesión, cualquier dispositivo.
- **Nivel técnico**: Variable — el flujo debe ser autoexplicativo.

---

## Persona 4: Invitado (invitación pendiente de aceptar)

- **Rol en el sistema**: Recibió un link o código de invitación a un grupo familiar existente, pero todavía no se autenticó ni aceptó.
- **Objetivos**: Confirmar rápidamente que la invitación es legítima (viene de un familiar) y unirse sin fricción.
- **Motivaciones**: Confía en quien lo invitó (Administrador del grupo); quiere empezar a ver/usar los datos familiares cuanto antes.
- **Frustraciones potenciales**: Links de invitación vencidos o ya usados, o no quedar claro a qué grupo se está uniendo.
- **Contexto de uso**: Usualmente abre el link desde su celular (recibido por WhatsApp/correo).
- **Nivel técnico**: Variable — mismo estándar de simplicidad que el Usuario Recién Registrado.

---

## Mapa Personas → Épicas

| Persona | Épicas donde participa activamente |
|---|---|
| Administrador de Grupo Familiar | Autenticación y Onboarding, Grupos Familiares (crear/invitar/remover), Presupuesto (definir montos), y todas las épicas financieras como usuario regular |
| Miembro de Grupo Familiar | Todas las épicas financieras (Gastos, Presupuesto, Alacena, Compras, Recetario, Segmentación, Asistente, Panel de Familia, Android) |
| Usuario Recién Registrado | Autenticación y Onboarding, Grupos Familiares (crear grupo) |
| Invitado | Grupos Familiares (aceptar invitación) |
