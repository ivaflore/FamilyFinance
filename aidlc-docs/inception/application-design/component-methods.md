# Métodos de Componentes — FamilyFinance

Firmas de alto nivel (agnósticas de lenguaje). Las reglas de negocio detalladas de cada método se definirán en **Functional Design** (Construction, por unidad).

---

## Componente: Identidad y Autenticación

| Método | Entrada | Salida | Propósito |
|---|---|---|---|
| `iniciarSesionConGoogle` | `googleIdToken: string` | `Sesion { token, usuario }` | Verifica el token de Google, crea/recupera el perfil del usuario, emite una sesión propia. |
| `validarSesion` | `token: string` | `Usuario \| null` | Valida un token de sesión en cada request (SECURITY-12). |
| `cerrarSesion` | `token: string` | `void` | Invalida la sesión. |
| `obtenerPerfil` | `usuarioId: string` | `PerfilUsuario` | Devuelve nombre, correo, foto del usuario autenticado. |

## Componente: Grupos Familiares

| Método | Entrada | Salida | Propósito |
|---|---|---|---|
| `crearGrupo` | `usuarioId, nombreGrupo: string` | `GrupoFamiliar` | Crea un grupo y asigna al creador como Administrador (US-03). |
| `generarLinkInvitacion` | `grupoId, adminId: string` | `LinkInvitacion { token, expiracion }` | Genera un link de invitación general (US-04). |
| `invitarPorCorreo` | `grupoId, adminId, correoInvitado: string` | `Invitacion` | Crea una invitación dirigida a un correo específico (US-04). |
| `aceptarInvitacion` | `usuarioId, tokenInvitacion: string` | `Membresia` | Agrega al usuario como Miembro del grupo (US-05). |
| `removerMiembro` | `grupoId, adminId, miembroId: string` | `void` | Solo el Administrador puede ejecutarlo (US-07). |
| `listarMiembros` | `grupoId, solicitanteId: string` | `Membresia[]` | Lista miembros y roles del grupo. |
| `resolverGrupoActivo` | `usuarioId: string` | `grupoFamiliarId \| null` | Usado por el middleware de autorización (SECURITY-08) para determinar el grupo activo del usuario en cada request. |
| `listarGruposDeUsuario` | `usuarioId: string` | `GrupoFamiliar[]` | Para el caso de un usuario en varios grupos (fuera de alcance de este ciclo salvo que Application Design lo confirme necesario — ver Nota). |

**Nota**: `requirements.md` no fijó un límite de grupos por usuario. Se modela `listarGruposDeUsuario` devolviendo un arreglo (no un valor único) para no bloquear esa posibilidad futura, aunque el flujo de onboarding de este ciclo (US-02) asume que basta con resolver "el grupo activo".

## Componente: Núcleo Financiero

| Método | Entrada | Salida | Propósito |
|---|---|---|---|
| `registrarGasto` | `grupoId, usuarioId, gasto: {descripcion, monto, categoria}` | `Gasto` | Registra el gasto y actualiza el presupuesto de la categoría (US-08). |
| `listarGastos` | `grupoId, filtros?` | `Gasto[]` | Historial de gastos del grupo (US-09). |
| `definirPresupuesto` | `grupoId, adminId, categoria: string, monto: number` | `Presupuesto` | Solo Administrador (US-10). |
| `obtenerEstadoPresupuesto` | `grupoId: string` | `ResumenPresupuesto[]` | Gastado/disponible por categoría (US-11). |
| `obtenerAportePorMiembro` | `grupoId: string` | `AporteMiembro[]` | Monto y cantidad de transacciones por miembro (US-19). |

## Componente: Hogar

| Método | Entrada | Salida | Propósito |
|---|---|---|---|
| `agregarProductoAlacena` | `grupoId, usuarioId, producto` | `ProductoAlacena` | US-12. |
| `listarAlacena` | `grupoId: string` | `ProductoAlacena[]` | US-12. |
| `agregarItemCompra` | `grupoId, usuarioId, item` | `ItemCompra` | US-13. |
| `marcarItemComprado` | `grupoId, itemId, usuarioId: string` | `ItemCompra` | Idempotente (NFR-02) — marcar dos veces no duplica el efecto. |
| `generarListaDesdeMenu` | `grupoId: string` | `ItemCompra[]` | Orquestación interna: lee Calendario+Recetario y agrega a Lista de Compras sin duplicar (US-14). |
| `agregarReceta` | `grupoId, usuarioId, receta` | `Receta` | US-15. |
| `listarRecetas` | `grupoId, filtro?` | `Receta[]` | US-15. |
| `planificarComida` | `grupoId, usuarioId, dia, tipoComida, recetaId` | `PlanificacionDia` | US-16. |
| `obtenerCalendarioMes` | `grupoId, anio, mes` | `PlanificacionDia[]` | US-16. |

## Componente: Insights

| Método | Entrada | Salida | Propósito |
|---|---|---|---|
| `clasificarProducto` | `grupoId, usuarioId, productoId, segmento` | `ProductoSegmentado` | US-17. |
| `obtenerResumenSegmentacion` | `grupoId: string` | `ResumenSegmentacion` | Totales y ahorro potencial por segmento (US-17). |
| `consultarAsistente` | `grupoId, usuarioId, pregunta: string` | `RespuestaAsistente` | Compone la respuesta leyendo Núcleo Financiero y Hogar del mismo grupo únicamente (US-18, ligado a US-06). |

## Componente: Frontend Web

No expone métodos de backend — consume la API REST de los componentes anteriores. Sus "métodos" son las pantallas/flujos ya cubiertos por las historias de usuario (`stories.md`): Onboarding, Dashboard, Gastos, Presupuesto, Alacena, Compras, Recetario, Calendario, Segmentación, Asistente, Panel de Familia.
