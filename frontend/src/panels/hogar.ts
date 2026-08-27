import { api, escapeHtml, fmt } from '../api';
import { grupoActivo } from '../state';

interface ProductoAlacena { id: string; icono: string; nombre: string; cantidadTexto: string; porAgotarse: boolean }
interface ItemCompra { id: string; nombre: string; precioEstimado: number; comprado: boolean }
interface Receta { id: string; nombre: string; tipos: string[]; tiempoMin: number; porciones: number; ingredientes: { n: string }[]; pasos: string[] }
interface Planificacion { id: string; fecha: string; tipoComida: string; receta: Receta }

export async function renderAlacena() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  content.innerHTML = `
    <div class="card">
      <div class="card-hd">
        <div class="card-title">Agregar producto</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end">
        <div><label class="form-label">Producto</label><input type="text" id="a-nombre" placeholder="ej: Leche" /></div>
        <div><label class="form-label">Cantidad</label><input type="text" id="a-cant" placeholder="ej: 2 litros" /></div>
        <button class="btn btn-primary" id="a-add"><i class="ti ti-plus"></i> Agregar</button>
      </div>
    </div>
    <div class="card"><div class="card-hd"><div class="card-title">Inventario del grupo</div></div><div class="pantry-grid" id="pantry-grid"></div></div>`;

  async function cargar() {
    const productos = await api.get<ProductoAlacena[]>(`/groups/${grupo!.id}/alacena`);
    document.getElementById('pantry-grid')!.innerHTML = productos.length
      ? productos
          .map(
            (p) => `<div class="pantry-card ${p.porAgotarse ? 'low' : ''}">
              <span class="p-icon">${escapeHtml(p.icono || '📦')}</span>
              <div class="p-name">${escapeHtml(p.nombre)}</div>
              <div class="p-qty">${escapeHtml(p.cantidadTexto)}</div>
            </div>`,
          )
          .join('')
      : `<div style="font-size:12px;color:var(--text-3)">La alacena está vacía todavía.</div>`;
  }

  document.getElementById('a-add')!.addEventListener('click', async () => {
    const nombre = (document.getElementById('a-nombre') as HTMLInputElement).value.trim();
    const cantidadTexto = (document.getElementById('a-cant') as HTMLInputElement).value.trim() || '1 unidad';
    if (!nombre) return;
    await api.post(`/groups/${grupo!.id}/alacena`, { nombre, cantidadTexto });
    (document.getElementById('a-nombre') as HTMLInputElement).value = '';
    (document.getElementById('a-cant') as HTMLInputElement).value = '';
    await cargar();
  });

  await cargar();
}

export async function renderCompras() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  content.innerHTML = `
    <div class="card">
      <div class="card-hd">
        <div class="card-title">Lista de compras del grupo</div>
        <div style="display:flex;gap:6px">
          <input type="text" id="c-nombre" placeholder="Agregar producto…" style="width:180px" />
          <button class="btn btn-sm btn-primary" id="c-add"><i class="ti ti-plus"></i></button>
        </div>
      </div>
      <div id="shop-list"></div>
    </div>`;

  async function cargar() {
    const items = await api.get<ItemCompra[]>(`/groups/${grupo!.id}/compras`);
    const list = document.getElementById('shop-list')!;
    list.innerHTML = items.length
      ? items
          .map(
            (i) => `<div class="shop-item">
              <div class="shop-check ${i.comprado ? 'checked' : ''}" data-id="${i.id}" data-comprado="${i.comprado}">${i.comprado ? '<i class="ti ti-check" style="font-size:10px;color:#fff"></i>' : ''}</div>
              <div class="shop-name ${i.comprado ? 'done' : ''}">${escapeHtml(i.nombre)}</div>
              <div>${fmt(i.precioEstimado)}</div>
            </div>`,
          )
          .join('')
      : `<div style="font-size:12px;color:var(--text-3)">No hay productos en la lista.</div>`;

    list.querySelectorAll<HTMLElement>('.shop-check').forEach((el) => {
      el.addEventListener('click', async () => {
        const id = el.dataset.id!;
        const nuevoEstado = el.dataset.comprado !== 'true';
        await api.patch(`/groups/${grupo!.id}/compras/${id}`, { comprado: nuevoEstado });
        await cargar();
      });
    });
  }

  document.getElementById('c-add')!.addEventListener('click', async () => {
    const nombre = (document.getElementById('c-nombre') as HTMLInputElement).value.trim();
    if (!nombre) return;
    await api.post(`/groups/${grupo!.id}/compras`, { nombre });
    (document.getElementById('c-nombre') as HTMLInputElement).value = '';
    await cargar();
  });

  await cargar();
}

export async function renderRecetario() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  content.innerHTML = `
    <div class="card">
      <div class="card-hd">
        <div class="card-title">Recetario del grupo</div>
        <button class="btn btn-sm btn-primary" id="r-new"><i class="ti ti-plus"></i> Nueva receta</button>
      </div>
      <div class="recipe-grid" id="recipe-grid"></div>
    </div>
    <div id="recipe-modal"></div>`;

  async function cargar() {
    const recetas = await api.get<Receta[]>(`/groups/${grupo!.id}/recetas`);
    document.getElementById('recipe-grid')!.innerHTML = recetas.length
      ? recetas
          .map(
            (r) => `<div class="recipe-card">
              <div class="rc-name">${escapeHtml(r.nombre)}</div>
              <div class="rc-meta"><span>${r.tiempoMin} min</span><span>${r.porciones} pers.</span></div>
              <div style="font-size:10px;color:var(--text-3)">${escapeHtml((r.ingredientes ?? []).map((i) => i.n).join(', '))}</div>
            </div>`,
          )
          .join('')
      : `<div style="font-size:12px;color:var(--text-3)">Todavía no hay recetas.</div>`;
  }

  document.getElementById('r-new')!.addEventListener('click', () => {
    document.getElementById('recipe-modal')!.innerHTML = `
      <div class="modal-overlay" id="rm-overlay">
        <div class="modal">
          <div class="modal-title">Nueva receta</div>
          <div class="form-row"><label class="form-label">Nombre</label><input type="text" id="nr-nombre" /></div>
          <div class="form-row"><label class="form-label">Tiempo (min)</label><input type="number" id="nr-tiempo" value="30" /></div>
          <div class="form-row"><label class="form-label">Porciones</label><input type="number" id="nr-porciones" value="4" /></div>
          <div class="form-row"><label class="form-label">Ingredientes (separados por coma)</label><input type="text" id="nr-ingr" placeholder="arroz, tomate, aceite" /></div>
          <div class="form-row"><label class="form-label">Pasos (separados por punto)</label><textarea id="nr-pasos"></textarea></div>
          <div class="modal-actions">
            <button class="btn btn-primary" id="nr-save" style="flex:1">Guardar</button>
            <button class="btn" id="nr-cancel">Cancelar</button>
          </div>
        </div>
      </div>`;
    const close = () => (document.getElementById('recipe-modal')!.innerHTML = '');
    document.getElementById('rm-overlay')!.addEventListener('click', (e) => e.target === e.currentTarget && close());
    document.getElementById('nr-cancel')!.addEventListener('click', close);
    document.getElementById('nr-save')!.addEventListener('click', async () => {
      const nombre = (document.getElementById('nr-nombre') as HTMLInputElement).value.trim();
      if (!nombre) return;
      const ingredientes = (document.getElementById('nr-ingr') as HTMLInputElement).value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((n) => ({ n, cat: 'abarrotes' }));
      const pasos = (document.getElementById('nr-pasos') as HTMLTextAreaElement).value
        .split('.')
        .map((s) => s.trim())
        .filter(Boolean);
      await api.post(`/groups/${grupo!.id}/recetas`, {
        nombre,
        tipos: ['almuerzo'],
        tiempoMin: Number((document.getElementById('nr-tiempo') as HTMLInputElement).value) || 30,
        porciones: Number((document.getElementById('nr-porciones') as HTMLInputElement).value) || 4,
        ingredientes,
        pasos: pasos.length ? pasos : ['Preparar y cocinar'],
      });
      close();
      await cargar();
    });
  });

  await cargar();
}

export async function renderCalendario() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  const hoy = new Date();
  content.innerHTML = `
    <div class="card">
      <div class="card-hd">
        <div class="card-title">Menú de ${hoy.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</div>
        <button class="btn btn-sm btn-primary" id="cal-generar"><i class="ti ti-shopping-cart"></i> Generar lista de compras</button>
      </div>
      <table class="tbl">
        <thead><tr><th>Fecha</th><th>Comida</th><th>Receta</th></tr></thead>
        <tbody id="cal-tbody"></tbody>
      </table>
      <div class="card" style="margin-top:10px">
        <div class="card-title" style="margin-bottom:.75rem">Planificar una comida</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;align-items:end">
          <div><label class="form-label">Fecha</label><input type="date" id="cal-fecha" /></div>
          <div><label class="form-label">Tipo</label><select id="cal-tipo"><option value="almuerzo">Almuerzo</option><option value="cena">Cena</option><option value="desayuno">Desayuno</option></select></div>
          <div><label class="form-label">Receta</label><select id="cal-receta"></select></div>
          <button class="btn btn-primary" id="cal-add">Agregar</button>
        </div>
      </div>
    </div>`;

  async function cargar() {
    const [planificaciones, recetas] = await Promise.all([
      api.get<Planificacion[]>(`/groups/${grupo!.id}/calendario?anio=${hoy.getFullYear()}&mes=${hoy.getMonth()}`),
      api.get<Receta[]>(`/groups/${grupo!.id}/recetas`),
    ]);
    document.getElementById('cal-tbody')!.innerHTML = planificaciones.length
      ? planificaciones
          .map(
            (p) =>
              `<tr><td>${new Date(p.fecha).toLocaleDateString('es-CL')}</td><td><span class="tag">${p.tipoComida}</span></td><td>${escapeHtml(p.receta.nombre)}</td></tr>`,
          )
          .join('')
      : `<tr><td colspan="3" style="color:var(--text-3);font-size:12px">Sin comidas planificadas este mes.</td></tr>`;

    const select = document.getElementById('cal-receta') as HTMLSelectElement;
    select.innerHTML = recetas.map((r) => `<option value="${r.id}">${escapeHtml(r.nombre)}</option>`).join('');
  }

  document.getElementById('cal-add')!.addEventListener('click', async () => {
    const fecha = (document.getElementById('cal-fecha') as HTMLInputElement).value;
    const tipoComida = (document.getElementById('cal-tipo') as HTMLSelectElement).value;
    const recetaId = (document.getElementById('cal-receta') as HTMLSelectElement).value;
    if (!fecha || !recetaId) return;
    await api.post(`/groups/${grupo!.id}/calendario`, { fecha, tipoComida, recetaId });
    await cargar();
  });

  document.getElementById('cal-generar')!.addEventListener('click', async () => {
    const res = await api.post<{ agregados: string[] }>(`/groups/${grupo!.id}/compras/generar-desde-menu`, {
      anio: hoy.getFullYear(),
      mes: hoy.getMonth(),
    });
    alert(res.agregados.length ? `${res.agregados.length} ingredientes agregados a la lista de compras.` : 'No hay ingredientes nuevos para agregar.');
  });

  await cargar();
}
