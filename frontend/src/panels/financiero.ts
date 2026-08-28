import { api, escapeHtml, fmt } from '../api';
import { grupoActivo } from '../state';

interface Gasto { id: string; descripcion: string; monto: number; categoria: string; fecha: string; miembro: string }
interface EstadoCategoria { categoria: string; montoAsignado: number; gastado: number; disponible: number }
interface Ingreso { id: string; descripcion: string; monto: number; fecha: string; miembro: string }
interface GastoRecurrente { id: string; descripcion: string; monto: number; categoria: string; diaDelMes: number; activo: boolean }

const CATEGORIAS = [
  'Vivienda',
  'Servicios Básicos',
  'Alimentación Central',
  'Transporte Diario',
  'Salud y Seguros',
  'Educación o Deudas',
  'Salidas y Ocio',
  'Suscripciones Digitales',
  'Cuidado Personal',
  'Ropa y Calzado',
  'Gastos Hormiga',
  'Tecnología y Hogar',
  'Fondo de Emergencia',
  'Inversión o Metas',
];

export async function renderDashboard() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  content.innerHTML = `<div class="card"><div class="card-title">Cargando…</div></div>`;

  // Antes de mostrar el resumen, se asegura de que los gastos fijos del mes
  // (arriendo, luz, etc.) ya estén generados — es idempotente, así que no
  // importa cuál miembro de la familia entre primero a la app cada mes.
  await api.post(`/groups/${grupo!.id}/gastos-recurrentes/generar`, {});

  const [estado, gastos, ingresos] = await Promise.all([
    api.get<EstadoCategoria[]>(`/groups/${grupo!.id}/presupuesto`),
    api.get<Gasto[]>(`/groups/${grupo!.id}/gastos`),
    api.get<Ingreso[]>(`/groups/${grupo!.id}/ingresos`),
  ]);
  const totalIngresos = ingresos.reduce((a, i) => a + i.monto, 0);

  // Gasto real total del grupo (BR-15: siempre derivado de los gastos reales,
  // no de la suma de "gastado" por categoría — así una categoría sin
  // presupuesto asignado no queda fuera del total).
  const totalGasto = gastos.reduce((a, g) => a + g.monto, 0);
  const totalPresupuesto = estado.reduce((a, e) => a + e.montoAsignado, 0);
  const disponible = totalPresupuesto - totalGasto;

  // Proyección: al ritmo de gasto diario promedio de lo que va del mes, ¿en
  // cuánto vamos a terminar? (BR: puramente informativo, no persiste nada).
  const hoy = new Date();
  const diaActual = hoy.getDate();
  const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const proyeccion = (totalGasto / diaActual) * diasEnMes;
  const sobrePresupuesto = totalPresupuesto > 0 && proyeccion > totalPresupuesto;
  const porcentajeGastado = totalPresupuesto > 0 ? Math.round((totalGasto / totalPresupuesto) * 100) : 0;
  const miembrosActivos = new Set(gastos.map((g) => g.miembro)).size;

  content.innerHTML = `
    <div class="g4">
      <div class="metric">
        <div class="m-label">Gasto del mes</div>
        <div class="m-val">${fmt(totalGasto)}</div>
        ${totalPresupuesto > 0 ? `<div class="m-sub ${porcentajeGastado > 100 ? 'm-bad' : ''}">${porcentajeGastado}% del presupuesto</div>` : `<div class="m-sub">Sin presupuesto definido</div>`}
      </div>
      <div class="metric">
        <div class="m-label">Presupuesto disponible</div>
        <div class="m-val ${disponible < 0 ? 'm-bad' : ''}">${fmt(Math.max(0, disponible))}</div>
        <div class="m-sub">de ${fmt(totalPresupuesto)} totales</div>
      </div>
      <div class="metric">
        <div class="m-label">Proyección fin de mes</div>
        <div class="m-val">${fmt(proyeccion)}</div>
        ${
          totalPresupuesto > 0
            ? `<div class="m-sub ${sobrePresupuesto ? 'm-bad' : 'm-good'}">${sobrePresupuesto ? `↑ $${Math.round(proyeccion - totalPresupuesto).toLocaleString('es-CL')} sobre presupuesto` : 'dentro del presupuesto'}</div>`
            : `<div class="m-sub">día ${diaActual} de ${diasEnMes}</div>`
        }
      </div>
      <div class="metric">
        <div class="m-label">Transacciones</div>
        <div class="m-val">${gastos.length}</div>
        <div class="m-sub">${miembrosActivos ? `por ${miembrosActivos} miembro(s)` : 'este mes'}</div>
      </div>
    </div>
    <div class="g2">
      <div class="metric">
        <div class="m-label">Ingresos del mes</div>
        <div class="m-val m-good">${fmt(totalIngresos)}</div>
        <div class="m-sub">${ingresos.length} registro(s) — ver "Ingresos"</div>
      </div>
      <div class="metric">
        <div class="m-label">Balance neto</div>
        <div class="m-val ${totalIngresos - totalGasto < 0 ? 'm-bad' : 'm-good'}">${fmt(totalIngresos - totalGasto)}</div>
        <div class="m-sub">ingresos − gastos del mes</div>
      </div>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title">Gastos por categoría</div></div>
      <div id="dash-bars"></div>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title">Últimas transacciones</div></div>
      <table class="tbl"><tbody id="dash-gastos"></tbody></table>
    </div>`;

  const maxGastado = Math.max(...estado.map((e) => e.gastado), 1);
  document.getElementById('dash-bars')!.innerHTML =
    estado.length === 0
      ? `<div style="font-size:12px;color:var(--text-3)">Aún no has definido presupuestos. Ve a "Presupuesto" para empezar.</div>`
      : estado
          .map((e) => {
            const sobre = e.montoAsignado > 0 && e.gastado > e.montoAsignado;
            const pct = e.montoAsignado > 0 ? Math.round((e.gastado / e.montoAsignado) * 100) : null;
            return `<div class="bar-row">
              <div class="bar-lbl">${escapeHtml(e.categoria)}</div>
              <div class="bar-track"><div class="bar-fill" style="width:${Math.round((e.gastado / maxGastado) * 100)}%;background:${sobre ? 'var(--coral)' : 'var(--teal)'}"></div></div>
              <div class="bar-val">${fmt(e.gastado)}${pct !== null ? ` <span style="color:${sobre ? 'var(--coral)' : 'var(--text-3)'}">(${pct}%)</span>` : ''}</div>
            </div>`;
          })
          .join('');

  document.getElementById('dash-gastos')!.innerHTML = gastos.length
    ? gastos
        .slice(0, 6)
        .map(
          (g) => `<tr><td><div style="font-size:12px;font-weight:600">${escapeHtml(g.descripcion)}</div><div style="font-size:10px;color:var(--text-3)">${escapeHtml(g.miembro)}</div></td><td style="text-align:right;color:var(--coral);font-weight:600">${fmt(g.monto)}</td></tr>`,
        )
        .join('')
    : `<tr><td style="color:var(--text-3);font-size:12px">Todavía no hay gastos registrados.</td></tr>`;
}

export async function renderGastos() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  const esAdmin = grupo!.rol === 'Administrador';
  content.innerHTML = `
    <div class="card">
      <div class="card-hd">
        <div class="card-title">Gastos fijos del mes</div>
        <span class="card-sub">Arriendo, luz, colegio… se generan solos cada mes</span>
      </div>
      <div id="recurrentes-list"></div>
      ${
        esAdmin
          ? `<div style="display:grid;grid-template-columns:1.3fr 1fr 1fr 0.7fr auto;gap:8px;align-items:end;margin-top:10px">
              <div><label class="form-label">Descripción</label><input type="text" id="gr-desc" placeholder="ej: Arriendo" /></div>
              <div><label class="form-label">Monto ($)</label><input type="number" id="gr-monto" placeholder="0" /></div>
              <div><label class="form-label">Categoría</label>
                <select id="gr-cat">${CATEGORIAS.map((c) => `<option value="${c}">${c}</option>`).join('')}</select>
              </div>
              <div><label class="form-label">Día del mes</label><input type="number" id="gr-dia" placeholder="5" min="1" max="28" /></div>
              <button class="btn btn-primary" id="gr-add"><i class="ti ti-plus"></i> Agregar</button>
            </div>`
          : ''
      }
    </div>
    <div class="card">
      <div class="card-hd">
        <div class="card-title">Registrar nuevo gasto</div>
        <button class="btn btn-sm" id="g-scan"><i class="ti ti-camera"></i> Escanear boleta</button>
        <input type="file" id="g-scan-input" accept="image/*" capture="environment" style="display:none" />
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;align-items:end">
        <div><label class="form-label">Descripción</label><input type="text" id="g-desc" placeholder="ej: Jumbo" /></div>
        <div><label class="form-label">Monto ($)</label><input type="number" id="g-monto" placeholder="0" /></div>
        <div><label class="form-label">Categoría</label>
          <select id="g-cat">${CATEGORIAS.map((c) => `<option value="${c}">${c}</option>`).join('')}</select>
        </div>
        <button class="btn btn-primary" id="g-add"><i class="ti ti-plus"></i> Agregar</button>
      </div>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title">Historial de gastos</div></div>
      <table class="tbl">
        <thead><tr><th>Descripción</th><th>Categoría</th><th>Miembro</th><th style="text-align:right">Monto</th>${esAdmin ? '<th></th>' : ''}</tr></thead>
        <tbody id="gastos-tbody"></tbody>
      </table>
    </div>
    <div id="scan-modal"></div>
    <div id="gasto-modal"></div>`;

  function abrirEdicionGasto(g: Gasto) {
    document.getElementById('gasto-modal')!.innerHTML = `
      <div class="modal-overlay" id="gm-overlay">
        <div class="modal">
          <div class="modal-title">Editar gasto</div>
          <div class="form-row"><label class="form-label">Descripción</label><input type="text" id="gm-desc" value="${escapeHtml(g.descripcion)}" /></div>
          <div class="form-row"><label class="form-label">Monto ($)</label><input type="number" id="gm-monto" value="${g.monto}" /></div>
          <div class="form-row"><label class="form-label">Categoría</label>
            <select id="gm-cat">${CATEGORIAS.map((c) => `<option value="${c}" ${c === g.categoria ? 'selected' : ''}>${c}</option>`).join('')}</select>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" id="gm-save" style="flex:1">Guardar</button>
            <button class="btn" id="gm-cancel">Cancelar</button>
          </div>
        </div>
      </div>`;
    const close = () => (document.getElementById('gasto-modal')!.innerHTML = '');
    document.getElementById('gm-overlay')!.addEventListener('click', (e) => e.target === e.currentTarget && close());
    document.getElementById('gm-cancel')!.addEventListener('click', close);
    document.getElementById('gm-save')!.addEventListener('click', async () => {
      const descripcion = (document.getElementById('gm-desc') as HTMLInputElement).value.trim();
      const monto = Number((document.getElementById('gm-monto') as HTMLInputElement).value);
      const categoria = (document.getElementById('gm-cat') as HTMLSelectElement).value;
      if (!descripcion || !(monto > 0)) return;
      try {
        await api.put(`/groups/${grupo!.id}/gastos/${g.id}`, { descripcion, monto, categoria });
        close();
        await cargar();
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  function abrirConfirmacion(datos: { descripcion: string; monto: number; categoria: string }) {
    document.getElementById('scan-modal')!.innerHTML = `
      <div class="modal-overlay" id="sm-overlay">
        <div class="modal">
          <div class="modal-title">Confirma el gasto detectado</div>
          <div class="form-row"><label class="form-label">Descripción / comercio</label><input type="text" id="sm-desc" value="${escapeHtml(datos.descripcion)}" /></div>
          <div class="form-row"><label class="form-label">Monto ($)</label><input type="number" id="sm-monto" value="${datos.monto}" /></div>
          <div class="form-row"><label class="form-label">Categoría</label>
            <select id="sm-cat">${CATEGORIAS.map((c) => `<option value="${c}" ${c === datos.categoria ? 'selected' : ''}>${c}</option>`).join('')}</select>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" id="sm-save" style="flex:1">Guardar gasto</button>
            <button class="btn" id="sm-cancel">Cancelar</button>
          </div>
        </div>
      </div>`;
    const close = () => (document.getElementById('scan-modal')!.innerHTML = '');
    document.getElementById('sm-overlay')!.addEventListener('click', (e) => e.target === e.currentTarget && close());
    document.getElementById('sm-cancel')!.addEventListener('click', close);
    document.getElementById('sm-save')!.addEventListener('click', async () => {
      const descripcion = (document.getElementById('sm-desc') as HTMLInputElement).value.trim();
      const monto = Number((document.getElementById('sm-monto') as HTMLInputElement).value);
      const categoria = (document.getElementById('sm-cat') as HTMLSelectElement).value;
      if (!descripcion || !(monto > 0)) return;
      await api.post(`/groups/${grupo!.id}/gastos`, { descripcion, monto, categoria });
      close();
      await cargar();
    });
  }

  const scanBtn = document.getElementById('g-scan') as HTMLButtonElement;
  const scanInput = document.getElementById('g-scan-input') as HTMLInputElement;
  scanBtn.addEventListener('click', () => scanInput.click());
  scanInput.addEventListener('change', async () => {
    const file = scanInput.files?.[0];
    scanInput.value = '';
    if (!file) return;
    scanBtn.disabled = true;
    scanBtn.innerHTML = `<i class="ti ti-loader-2"></i> Leyendo boleta…`;
    try {
      const form = new FormData();
      form.append('imagen', file);
      const datos = await api.upload<{ monto: number; comercio: string; categoriaSugerida: string }>(
        `/groups/${grupo!.id}/gastos/desde-boleta`,
        form,
      );
      abrirConfirmacion({ descripcion: datos.comercio, monto: datos.monto, categoria: datos.categoriaSugerida });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      scanBtn.disabled = false;
      scanBtn.innerHTML = `<i class="ti ti-camera"></i> Escanear boleta`;
    }
  });

  async function cargar() {
    const gastos = await api.get<Gasto[]>(`/groups/${grupo!.id}/gastos`);
    document.getElementById('gastos-tbody')!.innerHTML = gastos
      .map(
        (g) => `<tr>
          <td>${escapeHtml(g.descripcion)}</td>
          <td><span class="tag">${escapeHtml(g.categoria)}</span></td>
          <td>${escapeHtml(g.miembro)}</td>
          <td style="text-align:right;color:var(--coral);font-weight:600">${fmt(g.monto)}</td>
          ${
            esAdmin
              ? `<td style="text-align:right;white-space:nowrap">
                  <button class="btn btn-sm btn-edit g-editar" data-id="${g.id}"><i class="ti ti-pencil"></i> Modificar</button>
                  <button class="btn btn-sm btn-danger g-eliminar" data-id="${g.id}"><i class="ti ti-trash"></i> Eliminar</button>
                </td>`
              : ''
          }
        </tr>`,
      )
      .join('');

    if (esAdmin) {
      document.querySelectorAll<HTMLElement>('.g-editar').forEach((el) =>
        el.addEventListener('click', () => {
          const g = gastos.find((x) => x.id === el.dataset.id);
          if (g) abrirEdicionGasto(g);
        }),
      );
      document.querySelectorAll<HTMLElement>('.g-eliminar').forEach((el) =>
        el.addEventListener('click', async () => {
          if (!confirm('¿Eliminar este gasto?')) return;
          await api.del(`/groups/${grupo!.id}/gastos/${el.dataset.id}`);
          await cargar();
        }),
      );
    }
  }

  document.getElementById('g-add')!.addEventListener('click', async () => {
    const descripcion = (document.getElementById('g-desc') as HTMLInputElement).value.trim();
    const monto = Number((document.getElementById('g-monto') as HTMLInputElement).value);
    const categoria = (document.getElementById('g-cat') as HTMLSelectElement).value;
    if (!descripcion || !monto) return;
    await api.post(`/groups/${grupo!.id}/gastos`, { descripcion, monto, categoria });
    (document.getElementById('g-desc') as HTMLInputElement).value = '';
    (document.getElementById('g-monto') as HTMLInputElement).value = '';
    await cargar();
  });

  async function cargarRecurrentes() {
    const recurrentes = await api.get<GastoRecurrente[]>(`/groups/${grupo!.id}/gastos-recurrentes`);
    document.getElementById('recurrentes-list')!.innerHTML = recurrentes.length
      ? recurrentes
          .map(
            (r) => `<div class="shop-item">
              <span class="tag" style="background:var(--blue-l);color:var(--blue-d)">día ${r.diaDelMes}</span>
              <div class="shop-name ${r.activo ? '' : 'done'}">${escapeHtml(r.descripcion)} <span style="color:var(--text-3)">· ${escapeHtml(r.categoria)}</span></div>
              <div style="font-weight:600">${fmt(r.monto)}</div>
              ${
                esAdmin
                  ? `<button class="btn btn-sm gr-toggle" data-id="${r.id}" data-activo="${r.activo}" style="margin-left:8px">${r.activo ? 'Pausar' : 'Reactivar'}</button>
                     <button class="btn btn-sm btn-danger gr-eliminar" data-id="${r.id}">Eliminar</button>`
                  : ''
              }
            </div>`,
          )
          .join('')
      : `<div style="font-size:12px;color:var(--text-3)">Sin gastos fijos definidos.</div>`;

    document.querySelectorAll<HTMLElement>('.gr-toggle').forEach((el) =>
      el.addEventListener('click', async () => {
        await api.patch(`/groups/${grupo!.id}/gastos-recurrentes/${el.dataset.id}`, { activo: el.dataset.activo !== 'true' });
        await cargarRecurrentes();
      }),
    );
    document.querySelectorAll<HTMLElement>('.gr-eliminar').forEach((el) =>
      el.addEventListener('click', async () => {
        if (!confirm('¿Eliminar este gasto fijo? (los gastos ya generados no se borran)')) return;
        await api.del(`/groups/${grupo!.id}/gastos-recurrentes/${el.dataset.id}`);
        await cargarRecurrentes();
      }),
    );
  }

  if (esAdmin) {
    document.getElementById('gr-add')!.addEventListener('click', async () => {
      const descripcion = (document.getElementById('gr-desc') as HTMLInputElement).value.trim();
      const monto = Number((document.getElementById('gr-monto') as HTMLInputElement).value);
      const categoria = (document.getElementById('gr-cat') as HTMLSelectElement).value;
      const diaDelMes = Number((document.getElementById('gr-dia') as HTMLInputElement).value);
      if (!descripcion || !(monto > 0) || !(diaDelMes >= 1 && diaDelMes <= 28)) return;
      try {
        await api.post(`/groups/${grupo!.id}/gastos-recurrentes`, { descripcion, monto, categoria, diaDelMes });
        (document.getElementById('gr-desc') as HTMLInputElement).value = '';
        (document.getElementById('gr-monto') as HTMLInputElement).value = '';
        (document.getElementById('gr-dia') as HTMLInputElement).value = '';
        await cargarRecurrentes();
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  await Promise.all([cargar(), cargarRecurrentes()]);
}

export async function renderPresupuesto() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  content.innerHTML = `
    <div class="card">
      <div class="card-hd"><div class="card-title">Definir presupuesto por categoría</div><span class="card-sub">Solo el administrador puede editar</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end">
        <div><label class="form-label">Categoría</label>
          <select id="p-cat">${CATEGORIAS.map((c) => `<option value="${c}">${c}</option>`).join('')}</select>
        </div>
        <div><label class="form-label">Monto asignado ($)</label><input type="number" id="p-monto" placeholder="0" /></div>
        <button class="btn btn-primary" id="p-save">Guardar</button>
      </div>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title">Seguimiento por categoría</div></div>
      <div id="presupuesto-list"></div>
    </div>`;

  async function cargar() {
    const estado = await api.get<EstadoCategoria[]>(`/groups/${grupo!.id}/presupuesto`);
    document.getElementById('presupuesto-list')!.innerHTML = estado.length
      ? estado
          .map((e) => {
            const pct = e.montoAsignado > 0 ? Math.min(100, Math.round((e.gastado / e.montoAsignado) * 100)) : 0;
            const over = e.gastado > e.montoAsignado;
            return `<div class="bar-row">
              <div class="bar-lbl">${escapeHtml(e.categoria)}</div>
              <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${over ? 'var(--coral)' : 'var(--teal)'}"></div></div>
              <div class="bar-val">${fmt(e.gastado)} / ${fmt(e.montoAsignado)}</div>
            </div>`;
          })
          .join('')
      : `<div style="font-size:12px;color:var(--text-3)">Aún no hay presupuestos definidos.</div>`;
  }

  document.getElementById('p-save')!.addEventListener('click', async () => {
    const categoria = (document.getElementById('p-cat') as HTMLSelectElement).value;
    const monto = Number((document.getElementById('p-monto') as HTMLInputElement).value);
    if (!(monto >= 0)) return;
    try {
      await api.put(`/groups/${grupo!.id}/presupuesto`, { categoria, monto });
      await cargar();
    } catch (err) {
      alert((err as Error).message);
    }
  });

  await cargar();
}

export async function renderIngresos() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  const esAdmin = grupo!.rol === 'Administrador';
  content.innerHTML = `
    <div class="card">
      <div class="card-hd"><div class="card-title">Registrar nuevo ingreso</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end">
        <div><label class="form-label">Descripción</label><input type="text" id="i-desc" placeholder="ej: Sueldo, bono, mesada" /></div>
        <div><label class="form-label">Monto ($)</label><input type="number" id="i-monto" placeholder="0" /></div>
        <button class="btn btn-primary" id="i-add"><i class="ti ti-plus"></i> Agregar</button>
      </div>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title">Historial de ingresos</div></div>
      <table class="tbl">
        <thead><tr><th>Descripción</th><th>Miembro</th><th style="text-align:right">Monto</th>${esAdmin ? '<th></th>' : ''}</tr></thead>
        <tbody id="ingresos-tbody"></tbody>
      </table>
    </div>
    <div id="ingreso-modal"></div>`;

  function abrirEdicion(i: Ingreso) {
    document.getElementById('ingreso-modal')!.innerHTML = `
      <div class="modal-overlay" id="im-overlay">
        <div class="modal">
          <div class="modal-title">Editar ingreso</div>
          <div class="form-row"><label class="form-label">Descripción</label><input type="text" id="im-desc" value="${escapeHtml(i.descripcion)}" /></div>
          <div class="form-row"><label class="form-label">Monto ($)</label><input type="number" id="im-monto" value="${i.monto}" /></div>
          <div class="modal-actions">
            <button class="btn btn-primary" id="im-save" style="flex:1">Guardar</button>
            <button class="btn" id="im-cancel">Cancelar</button>
          </div>
        </div>
      </div>`;
    const close = () => (document.getElementById('ingreso-modal')!.innerHTML = '');
    document.getElementById('im-overlay')!.addEventListener('click', (e) => e.target === e.currentTarget && close());
    document.getElementById('im-cancel')!.addEventListener('click', close);
    document.getElementById('im-save')!.addEventListener('click', async () => {
      const descripcion = (document.getElementById('im-desc') as HTMLInputElement).value.trim();
      const monto = Number((document.getElementById('im-monto') as HTMLInputElement).value);
      if (!descripcion || !(monto > 0)) return;
      try {
        await api.put(`/groups/${grupo!.id}/ingresos/${i.id}`, { descripcion, monto });
        close();
        await cargar();
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  async function cargar() {
    const ingresos = await api.get<Ingreso[]>(`/groups/${grupo!.id}/ingresos`);
    document.getElementById('ingresos-tbody')!.innerHTML = ingresos.length
      ? ingresos
          .map(
            (i) => `<tr>
              <td>${escapeHtml(i.descripcion)}</td>
              <td>${escapeHtml(i.miembro)}</td>
              <td style="text-align:right;color:var(--green);font-weight:600">${fmt(i.monto)}</td>
              ${
                esAdmin
                  ? `<td style="text-align:right;white-space:nowrap">
                      <button class="btn btn-sm btn-edit i-editar" data-id="${i.id}"><i class="ti ti-pencil"></i> Modificar</button>
                      <button class="btn btn-sm btn-danger i-eliminar" data-id="${i.id}"><i class="ti ti-trash"></i> Eliminar</button>
                    </td>`
                  : ''
              }
            </tr>`,
          )
          .join('')
      : `<tr><td style="color:var(--text-3);font-size:12px">Todavía no hay ingresos registrados.</td></tr>`;

    if (esAdmin) {
      document.querySelectorAll<HTMLElement>('.i-editar').forEach((el) =>
        el.addEventListener('click', () => {
          const i = ingresos.find((x) => x.id === el.dataset.id);
          if (i) abrirEdicion(i);
        }),
      );
      document.querySelectorAll<HTMLElement>('.i-eliminar').forEach((el) =>
        el.addEventListener('click', async () => {
          if (!confirm('¿Eliminar este ingreso?')) return;
          await api.del(`/groups/${grupo!.id}/ingresos/${el.dataset.id}`);
          await cargar();
        }),
      );
    }
  }

  document.getElementById('i-add')!.addEventListener('click', async () => {
    const descripcion = (document.getElementById('i-desc') as HTMLInputElement).value.trim();
    const monto = Number((document.getElementById('i-monto') as HTMLInputElement).value);
    if (!descripcion || !(monto > 0)) return;
    await api.post(`/groups/${grupo!.id}/ingresos`, { descripcion, monto });
    (document.getElementById('i-desc') as HTMLInputElement).value = '';
    (document.getElementById('i-monto') as HTMLInputElement).value = '';
    await cargar();
  });

  await cargar();
}
