import { api, escapeHtml, fmt } from '../api';
import { grupoActivo } from '../state';

interface Gasto { id: string; descripcion: string; monto: number; categoria: string; fecha: string; miembro: string }
interface EstadoCategoria { categoria: string; montoAsignado: number; gastado: number; disponible: number }

const CATEGORIAS = ['supermercado', 'transporte', 'salud', 'servicios', 'entretenimiento', 'otros'];

export async function renderDashboard() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  content.innerHTML = `<div class="card"><div class="card-title">Cargando…</div></div>`;

  const [estado, gastos] = await Promise.all([
    api.get<EstadoCategoria[]>(`/groups/${grupo!.id}/presupuesto`),
    api.get<Gasto[]>(`/groups/${grupo!.id}/gastos`),
  ]);

  const totalGasto = estado.reduce((a, e) => a + e.gastado, 0);
  const totalPresupuesto = estado.reduce((a, e) => a + e.montoAsignado, 0);

  content.innerHTML = `
    <div class="g3">
      <div class="metric"><div class="m-label">Gasto del mes</div><div class="m-val">${fmt(totalGasto)}</div></div>
      <div class="metric"><div class="m-label">Presupuesto disponible</div><div class="m-val">${fmt(Math.max(0, totalPresupuesto - totalGasto))}</div></div>
      <div class="metric"><div class="m-label">Transacciones</div><div class="m-val">${gastos.length}</div></div>
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
          .map(
            (e) => `<div class="bar-row"><div class="bar-lbl">${escapeHtml(e.categoria)}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round((e.gastado / maxGastado) * 100)}%;background:var(--teal)"></div></div><div class="bar-val">${fmt(e.gastado)}</div></div>`,
          )
          .join('');

  document.getElementById('dash-gastos')!.innerHTML = gastos
    .slice(0, 6)
    .map(
      (g) => `<tr><td><div style="font-size:12px;font-weight:600">${escapeHtml(g.descripcion)}</div><div style="font-size:10px;color:var(--text-3)">${escapeHtml(g.miembro)}</div></td><td style="text-align:right;color:var(--coral);font-weight:600">${fmt(g.monto)}</td></tr>`,
    )
    .join('');
}

export async function renderGastos() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  content.innerHTML = `
    <div class="card">
      <div class="card-hd"><div class="card-title">Registrar nuevo gasto</div></div>
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
        <thead><tr><th>Descripción</th><th>Categoría</th><th>Miembro</th><th style="text-align:right">Monto</th></tr></thead>
        <tbody id="gastos-tbody"></tbody>
      </table>
    </div>`;

  async function cargar() {
    const gastos = await api.get<Gasto[]>(`/groups/${grupo!.id}/gastos`);
    document.getElementById('gastos-tbody')!.innerHTML = gastos
      .map(
        (g) => `<tr>
          <td>${escapeHtml(g.descripcion)}</td>
          <td><span class="tag">${escapeHtml(g.categoria)}</span></td>
          <td>${escapeHtml(g.miembro)}</td>
          <td style="text-align:right;color:var(--coral);font-weight:600">${fmt(g.monto)}</td>
        </tr>`,
      )
      .join('');
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

  await cargar();
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
