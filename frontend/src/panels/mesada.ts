import { api, escapeHtml, fmt } from '../api';
import { grupoActivo, state } from '../state';

interface Miembro { usuarioId: string; nombre: string; fotoUrl: string | null; rol: 'Administrador' | 'Miembro' }
interface SaldoMiembro { usuarioId: string; nombre: string; saldo: number }
interface Movimiento { id: string; descripcion: string; monto: number; fecha: string }
interface MesadaDetalle { saldo: number; movimientos: Movimiento[] }
interface MetaAhorro { id: string; nombre: string; montoObjetivo: number; progreso: number }
interface Tarea { id: string; titulo: string; asignadoAUsuarioId: string | null; asignadoANombre: string | null; recompensa: number; completada: boolean }

export async function renderMesada() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  const esAdmin = grupo!.rol === 'Administrador';
  const miYo = state.usuario!.id;

  const miembros = esAdmin ? await api.get<Miembro[]>(`/groups/${grupo!.id}/members`) : [];

  content.innerHTML = `
    <div class="card">
      <div class="card-hd"><div class="card-title">Mesada de la familia</div><span class="card-sub">Saldo de cada miembro</span></div>
      <div id="mesada-resumen"></div>
    </div>
    <div class="card">
      <div class="card-hd">
        <div class="card-title">Mi cuenta</div>
        ${
          esAdmin
            ? `<select id="mv-usuario">${miembros.map((m) => `<option value="${m.usuarioId}" ${m.usuarioId === miYo ? 'selected' : ''}>${escapeHtml(m.nombre)}${m.usuarioId === miYo ? ' (tú)' : ''}</option>`).join('')}</select>`
            : ''
        }
      </div>
      <div class="m-val" id="mv-saldo" style="margin-bottom:10px">$0</div>
      <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr auto;gap:8px;align-items:end;margin-bottom:14px">
        <div><label class="form-label">Descripción</label><input type="text" id="mv-desc" placeholder="ej: Mesada semanal" /></div>
        <div><label class="form-label">Tipo</label><select id="mv-tipo"><option value="ingreso">Ingreso (+)</option><option value="retiro">Gasto (−)</option></select></div>
        <div><label class="form-label">Monto ($)</label><input type="number" id="mv-monto" placeholder="0" min="1" /></div>
        <button class="btn btn-primary" id="mv-add"><i class="ti ti-plus"></i> Agregar</button>
      </div>
      <table class="tbl">
        <thead><tr><th>Descripción</th><th style="text-align:right">Monto</th></tr></thead>
        <tbody id="mv-tbody"></tbody>
      </table>
    </div>
    <div class="card">
      <div class="card-hd">
        <div class="card-title">Metas de ahorro</div>
      </div>
      <div id="metas-list" style="margin-bottom:14px"></div>
      <div style="display:grid;grid-template-columns:1.5fr 1fr auto;gap:8px;align-items:end">
        <div><label class="form-label">Meta</label><input type="text" id="mt-nombre" placeholder="ej: Bicicleta nueva" /></div>
        <div><label class="form-label">Monto objetivo ($)</label><input type="number" id="mt-monto" placeholder="0" min="1" /></div>
        <button class="btn btn-primary" id="mt-add"><i class="ti ti-plus"></i> Agregar</button>
      </div>
    </div>`;

  function usuarioSeleccionado(): string {
    const sel = document.getElementById('mv-usuario') as HTMLSelectElement | null;
    return sel ? sel.value : miYo;
  }

  async function cargarResumen() {
    const saldos = await api.get<SaldoMiembro[]>(`/groups/${grupo!.id}/mesada`);
    document.getElementById('mesada-resumen')!.innerHTML = saldos.length
      ? saldos
          .map(
            (s) => `<div class="bar-row">
              <div class="bar-lbl">${escapeHtml(s.nombre)}</div>
              <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, Math.round((Math.max(0, s.saldo) / Math.max(...saldos.map((x) => Math.max(1, x.saldo)))) * 100))}%;background:var(--teal)"></div></div>
              <div class="bar-val ${s.saldo < 0 ? 'm-bad' : ''}">${fmt(s.saldo)}</div>
            </div>`,
          )
          .join('')
      : `<div style="font-size:12px;color:var(--text-3)">Nadie tiene movimientos todavía.</div>`;
  }

  async function cargarCuenta() {
    const usuarioId = usuarioSeleccionado();
    const [detalle, metas] = await Promise.all([
      api.get<MesadaDetalle>(`/groups/${grupo!.id}/mesada/${usuarioId}/movimientos`),
      api.get<MetaAhorro[]>(`/groups/${grupo!.id}/mesada/${usuarioId}/metas`),
    ]);

    document.getElementById('mv-saldo')!.innerHTML = `${fmt(detalle.saldo)} <span style="font-size:11px;color:var(--text-3);font-weight:400">de saldo actual</span>`;
    document.getElementById('mv-tbody')!.innerHTML = detalle.movimientos.length
      ? detalle.movimientos
          .map(
            (m) => `<tr>
              <td>${escapeHtml(m.descripcion)}</td>
              <td style="text-align:right;font-weight:600;color:${m.monto >= 0 ? 'var(--green)' : 'var(--coral)'}">${m.monto >= 0 ? '+' : ''}${fmt(m.monto)}</td>
            </tr>`,
          )
          .join('')
      : `<tr><td colspan="2" style="color:var(--text-3);font-size:12px">Sin movimientos todavía.</td></tr>`;

    document.getElementById('metas-list')!.innerHTML = metas.length
      ? metas
          .map(
            (m) => `<div class="bar-row">
              <div class="bar-lbl">${escapeHtml(m.nombre)}</div>
              <div class="bar-track"><div class="bar-fill" style="width:${m.progreso}%;background:${m.progreso >= 100 ? 'var(--green)' : 'var(--purple)'}"></div></div>
              <div class="bar-val">${m.progreso}% <button class="btn btn-sm btn-danger mt-eliminar" data-id="${m.id}" style="margin-left:6px">Borrar</button></div>
            </div>`,
          )
          .join('')
      : `<div style="font-size:12px;color:var(--text-3)">Sin metas de ahorro todavía.</div>`;

    document.querySelectorAll<HTMLElement>('.mt-eliminar').forEach((el) =>
      el.addEventListener('click', async () => {
        if (!confirm('¿Eliminar esta meta?')) return;
        await api.del(`/groups/${grupo!.id}/mesada/${usuarioId}/metas/${el.dataset.id}`);
        await cargarCuenta();
      }),
    );
  }

  document.getElementById('mv-usuario')?.addEventListener('change', cargarCuenta);

  document.getElementById('mv-add')!.addEventListener('click', async () => {
    const descripcion = (document.getElementById('mv-desc') as HTMLInputElement).value.trim();
    const tipo = (document.getElementById('mv-tipo') as HTMLSelectElement).value;
    const montoInput = Number((document.getElementById('mv-monto') as HTMLInputElement).value);
    if (!descripcion || !(montoInput > 0)) return;
    const monto = tipo === 'retiro' ? -montoInput : montoInput;
    try {
      await api.post(`/groups/${grupo!.id}/mesada/${usuarioSeleccionado()}/movimientos`, { descripcion, monto });
      (document.getElementById('mv-desc') as HTMLInputElement).value = '';
      (document.getElementById('mv-monto') as HTMLInputElement).value = '';
      await Promise.all([cargarCuenta(), cargarResumen()]);
    } catch (err) {
      alert((err as Error).message);
    }
  });

  document.getElementById('mt-add')!.addEventListener('click', async () => {
    const nombre = (document.getElementById('mt-nombre') as HTMLInputElement).value.trim();
    const montoObjetivo = Number((document.getElementById('mt-monto') as HTMLInputElement).value);
    if (!nombre || !(montoObjetivo > 0)) return;
    try {
      await api.post(`/groups/${grupo!.id}/mesada/${usuarioSeleccionado()}/metas`, { nombre, montoObjetivo });
      (document.getElementById('mt-nombre') as HTMLInputElement).value = '';
      (document.getElementById('mt-monto') as HTMLInputElement).value = '';
      await cargarCuenta();
    } catch (err) {
      alert((err as Error).message);
    }
  });

  await Promise.all([cargarResumen(), cargarCuenta()]);
}

export async function renderTareas() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  const esAdmin = grupo!.rol === 'Administrador';

  const miembros = esAdmin ? await api.get<Miembro[]>(`/groups/${grupo!.id}/members`) : [];

  content.innerHTML = `
    ${
      esAdmin
        ? `<div class="card">
            <div class="card-hd"><div class="card-title">Asignar nueva tarea</div></div>
            <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr auto;gap:8px;align-items:end">
              <div><label class="form-label">Tarea</label><input type="text" id="t-titulo" placeholder="ej: Ordenar el patio" /></div>
              <div><label class="form-label">Asignar a</label>
                <select id="t-asignado"><option value="">Sin asignar</option>${miembros.map((m) => `<option value="${m.usuarioId}">${escapeHtml(m.nombre)}</option>`).join('')}</select>
              </div>
              <div><label class="form-label">Recompensa ($)</label><input type="number" id="t-recompensa" placeholder="0" min="0" /></div>
              <button class="btn btn-primary" id="t-add"><i class="ti ti-plus"></i> Agregar</button>
            </div>
          </div>`
        : ''
    }
    <div class="card">
      <div class="card-hd"><div class="card-title">Tareas del hogar</div></div>
      <div id="tareas-list"></div>
    </div>`;

  async function cargar() {
    const tareas = await api.get<Tarea[]>(`/groups/${grupo!.id}/tareas`);
    document.getElementById('tareas-list')!.innerHTML = tareas.length
      ? tareas
          .map(
            (t) => `<div class="shop-item">
              <div class="shop-check ${t.completada ? 'checked' : ''}" data-id="${t.id}" data-completada="${t.completada}">${t.completada ? '<i class="ti ti-check" style="font-size:10px;color:#fff"></i>' : ''}</div>
              <div class="shop-name ${t.completada ? 'done' : ''}">${escapeHtml(t.titulo)} ${t.asignadoANombre ? `<span style="color:var(--text-3);font-size:11px"> · ${escapeHtml(t.asignadoANombre)}</span>` : ''}</div>
              ${t.recompensa > 0 ? `<span class="tag" style="background:var(--amber-l);color:var(--amber-d)">${fmt(t.recompensa)}</span>` : ''}
              ${esAdmin ? `<button class="btn btn-sm btn-danger t-eliminar" data-id="${t.id}" style="margin-left:8px">Eliminar</button>` : ''}
            </div>`,
          )
          .join('')
      : `<div style="font-size:12px;color:var(--text-3)">No hay tareas del hogar todavía.</div>`;

    document.querySelectorAll<HTMLElement>('.shop-check').forEach((el) =>
      el.addEventListener('click', async () => {
        const completada = el.dataset.completada !== 'true';
        await api.patch(`/groups/${grupo!.id}/tareas/${el.dataset.id}`, { completada });
        await cargar();
      }),
    );
    if (esAdmin) {
      document.querySelectorAll<HTMLElement>('.t-eliminar').forEach((el) =>
        el.addEventListener('click', async () => {
          if (!confirm('¿Eliminar esta tarea?')) return;
          await api.del(`/groups/${grupo!.id}/tareas/${el.dataset.id}`);
          await cargar();
        }),
      );
    }
  }

  document.getElementById('t-add')?.addEventListener('click', async () => {
    const titulo = (document.getElementById('t-titulo') as HTMLInputElement).value.trim();
    const asignadoAUsuarioId = (document.getElementById('t-asignado') as HTMLSelectElement).value || undefined;
    const recompensa = Number((document.getElementById('t-recompensa') as HTMLInputElement).value) || 0;
    if (!titulo) return;
    await api.post(`/groups/${grupo!.id}/tareas`, { titulo, asignadoAUsuarioId, recompensa });
    (document.getElementById('t-titulo') as HTMLInputElement).value = '';
    (document.getElementById('t-recompensa') as HTMLInputElement).value = '';
    await cargar();
  });

  await cargar();
}
