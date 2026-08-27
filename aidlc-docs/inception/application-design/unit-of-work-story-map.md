# Mapa de Historias a Unidades de Trabajo — FamilyFinance

| Historia | Título | Unidad |
|---|---|---|
| US-01 | Iniciar sesión con cuenta de Google | 1. Identidad y Autenticación |
| US-02 | Ver estado "sin grupo" tras el primer login | 2. Grupos Familiares *(depende de que la Unidad 1 esté completa)* |
| US-03 | Crear un grupo familiar | 2. Grupos Familiares |
| US-04 | Invitar miembros al grupo | 2. Grupos Familiares |
| US-05 | Aceptar una invitación a un grupo | 2. Grupos Familiares |
| US-06 | Aislamiento estricto de datos entre grupos | 2. Grupos Familiares *(transversal — validado también en Unidades 3, 4 y 5 al consumir el `grupoFamiliarId` que resuelve)* |
| US-07 | Roles dentro del grupo (Administrador vs. Miembro) | 2. Grupos Familiares |
| US-08 | Registrar un gasto visible para todo el grupo | 3. Núcleo Financiero |
| US-09 | Ver historial de gastos del grupo | 3. Núcleo Financiero |
| US-10 | Definir presupuesto mensual por categoría | 3. Núcleo Financiero |
| US-11 | Ver el estado del presupuesto en tiempo real | 3. Núcleo Financiero |
| US-12 | Ver y actualizar la alacena del grupo | 4. Hogar |
| US-13 | Compartir la lista de compras entre miembros | 4. Hogar |
| US-14 | Generar la lista de compras desde el menú planificado | 4. Hogar |
| US-15 | Mantener el recetario del grupo | 4. Hogar |
| US-16 | Planificar el menú mensual compartido | 4. Hogar |
| US-17 | Clasificar productos por segmento de ahorro | 5. Insights |
| US-18 | Consultar al asistente sobre mis datos reales | 5. Insights *(lee de las Unidades 3 y 4)* |
| US-19 | Ver el aporte de cada miembro | 3. Núcleo Financiero |
| US-20 | Usar la app cómodamente desde un celular Android | 6. Frontend Web |

## Verificación de Cobertura

- **Total de historias**: 20 (US-01 a US-20).
- **Todas asignadas**: Sí — cada historia tiene exactamente una unidad "dueña" (donde se implementa su lógica de negocio principal), aunque varias requieran que la interfaz correspondiente exista también en la Unidad 6 (Frontend Web) para ser usables de punta a punta.
- **Distribución**: Unidad 1 → 1 historia · Unidad 2 → 6 historias · Unidad 3 → 5 historias · Unidad 4 → 5 historias · Unidad 5 → 2 historias · Unidad 6 → 1 historia (propia) + interfaz transversal de las otras 19.
