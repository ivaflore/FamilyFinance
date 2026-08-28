import { api, escapeHtml, fmt } from '../api';
import { grupoActivo } from '../state';

interface ProductoAlacena {
  id: string;
  icono: string;
  nombre: string;
  unidad: string;
  cantidadIdeal: number;
  cantidadActual: number;
  faltante: number;
}
interface ProductoSugerido extends ProductoAlacena {
  origen: 'alacena' | 'receta';
}
interface ItemCompra { id: string; nombre: string; precioEstimado: number; comprado: boolean }
interface ListaCompras { sugeridos: ProductoSugerido[]; manuales: ItemCompra[] }
interface Receta { id: string; nombre: string; tipos: string[]; tiempoMin: number; porciones: number; ingredientes: { n: string }[]; pasos: string[] }
interface RecetaPlantilla { id: string; nombre: string; tiempoMin: number; porciones: number; ingredientes: { n: string }[] }
interface Planificacion { id: string; fecha: string; tipoComida: string; receta: Receta }

export async function renderAlacena() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  content.innerHTML = `
    <div class="card">
      <div class="card-hd">
        <div class="card-title">Agregar producto a mantener</div>
        <button class="btn btn-sm" id="a-importar">📥 Importar despensa base</button>
      </div>
      <div style="font-size:11px;color:var(--text-3);margin:-6px 0 10px">Define cuánto deberías tener siempre y cuánto tienes ahora</div>
      <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr auto;gap:8px;align-items:end">
        <div><label class="form-label">Producto</label><input type="text" id="a-nombre" placeholder="ej: Leche" /></div>
        <div><label class="form-label">Unidad</label><input type="text" id="a-unidad" placeholder="ej: litros" value="unidades" /></div>
        <div><label class="form-label">Ideal</label><input type="number" id="a-ideal" placeholder="2" min="0.01" step="0.01" /></div>
        <div><label class="form-label">Tengo ahora</label><input type="number" id="a-actual" placeholder="2" min="0" step="0.01" /></div>
        <button class="btn btn-primary" id="a-add"><i class="ti ti-plus"></i> Agregar</button>
      </div>
    </div>
    <div class="card"><div class="card-hd"><div class="card-title">Inventario del grupo</div></div><div class="pantry-grid" id="pantry-grid"></div></div>`;

  async function cargar() {
    const productos = await api.get<ProductoAlacena[]>(`/groups/${grupo!.id}/alacena`);
    document.getElementById('pantry-grid')!.innerHTML = productos.length
      ? productos
          .map(
            (p) => `<div class="pantry-card ${p.faltante > 0 ? 'low' : ''}">
              <span class="p-icon">${escapeHtml(p.icono || '📦')}</span>
              <div class="p-name">${escapeHtml(p.nombre)}</div>
              <div class="p-qty">${p.cantidadActual} / ${p.cantidadIdeal} ${escapeHtml(p.unidad)}</div>
              ${p.faltante > 0 ? `<div style="font-size:10px;color:var(--coral-d);font-weight:600;margin-top:2px">Faltan ${p.faltante}</div>` : ''}
              <div style="display:flex;gap:4px;justify-content:center;margin-top:6px">
                <button class="btn btn-sm p-menos" data-id="${p.id}" data-actual="${p.cantidadActual}">−1</button>
                <button class="btn btn-sm p-repone" data-id="${p.id}" data-ideal="${p.cantidadIdeal}">Reponer</button>
              </div>
            </div>`,
          )
          .join('')
      : `<div style="font-size:12px;color:var(--text-3)">La alacena está vacía todavía.</div>`;

    document.querySelectorAll<HTMLElement>('.p-menos').forEach((el) =>
      el.addEventListener('click', async () => {
        const actual = Math.max(0, Number(el.dataset.actual) - 1);
        await api.patch(`/groups/${grupo!.id}/alacena/${el.dataset.id}`, { cantidadActual: actual });
        await cargar();
      }),
    );
    document.querySelectorAll<HTMLElement>('.p-repone').forEach((el) =>
      el.addEventListener('click', async () => {
        await api.patch(`/groups/${grupo!.id}/alacena/${el.dataset.id}`, { cantidadActual: Number(el.dataset.ideal) });
        await cargar();
      }),
    );
  }

  document.getElementById('a-importar')!.addEventListener('click', async () => {
    if (!confirm('Esto agrega ~60 productos típicos de despensa (los que ya tengas con el mismo nombre no se duplican). ¿Continuar?')) return;
    const res = await api.post<{ agregados: string[] }>(`/groups/${grupo!.id}/alacena/importar-despensa-base`, {});
    alert(res.agregados.length ? `${res.agregados.length} producto(s) agregados a tu alacena.` : 'Ya tenías todos los productos de la despensa base.');
    await cargar();
  });

  document.getElementById('a-add')!.addEventListener('click', async () => {
    const nombre = (document.getElementById('a-nombre') as HTMLInputElement).value.trim();
    const unidad = (document.getElementById('a-unidad') as HTMLInputElement).value.trim() || 'unidades';
    const cantidadIdeal = Number((document.getElementById('a-ideal') as HTMLInputElement).value);
    const cantidadActualInput = (document.getElementById('a-actual') as HTMLInputElement).value;
    const cantidadActual = cantidadActualInput === '' ? cantidadIdeal : Number(cantidadActualInput);
    if (!nombre || !(cantidadIdeal > 0)) return;
    await api.post(`/groups/${grupo!.id}/alacena`, { nombre, unidad, cantidadIdeal, cantidadActual });
    (document.getElementById('a-nombre') as HTMLInputElement).value = '';
    (document.getElementById('a-ideal') as HTMLInputElement).value = '';
    (document.getElementById('a-actual') as HTMLInputElement).value = '';
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
        <div class="card-title">Sugeridos desde tu alacena</div>
        <span class="card-sub">Productos por debajo de la cantidad que deberías tener</span>
      </div>
      <div id="shop-sugeridos"></div>
    </div>
    <div class="card">
      <div class="card-hd">
        <div class="card-title">Otros productos</div>
        <div style="display:flex;gap:6px">
          <input type="text" id="c-nombre" placeholder="Agregar producto…" style="width:180px" />
          <button class="btn btn-sm btn-primary" id="c-add"><i class="ti ti-plus"></i></button>
        </div>
      </div>
      <div id="shop-list"></div>
    </div>`;

  async function cargar() {
    const { sugeridos, manuales } = await api.get<ListaCompras>(`/groups/${grupo!.id}/compras`);

    const ORIGEN_LABEL: Record<ProductoSugerido['origen'], { texto: string; bg: string; fg: string }> = {
      alacena: { texto: 'Abastecimiento habitual', bg: 'var(--amber-l)', fg: 'var(--amber-d)' },
      receta: { texto: '🍽️ Para el menú', bg: 'var(--purple-l)', fg: 'var(--purple-d)' },
    };

    document.getElementById('shop-sugeridos')!.innerHTML = sugeridos.length
      ? `<table class="tbl">
          <thead><tr><th>Motivo</th><th>Producto</th><th>Cantidad propuesta a comprar</th><th></th></tr></thead>
          <tbody>${sugeridos
            .map((p) => {
              const origen = ORIGEN_LABEL[p.origen];
              return `<tr>
                <td><span class="tag" style="background:${origen.bg};color:${origen.fg}">${origen.texto}</span></td>
                <td>${escapeHtml(p.nombre)}</td>
                <td>
                  <input type="number" class="p-cant-comprar" data-id="${p.id}" data-actual="${p.cantidadActual}" value="${p.faltante}" min="0.01" step="0.01" style="width:64px" />
                  ${escapeHtml(p.unidad)}
                </td>
                <td style="text-align:right"><button class="btn btn-sm btn-primary p-comprado" data-id="${p.id}">Ya compré</button></td>
              </tr>`;
            })
            .join('')}</tbody>
        </table>`
      : `<div style="font-size:12px;color:var(--text-3)">Tu alacena está completa — nada pendiente por comprar.</div>`;

    document.querySelectorAll<HTMLElement>('.p-comprado').forEach((el) =>
      el.addEventListener('click', async () => {
        const fila = el.closest('tr')!;
        const input = fila.querySelector<HTMLInputElement>('.p-cant-comprar')!;
        const comprado = Number(input.value);
        if (!(comprado > 0)) return;
        const nuevaCantidad = Number(input.dataset.actual) + comprado;
        await api.patch(`/groups/${grupo!.id}/alacena/${el.dataset.id}`, { cantidadActual: nuevaCantidad });
        await cargar();
      }),
    );

    const list = document.getElementById('shop-list')!;
    list.innerHTML = manuales.length
      ? manuales
          .map(
            (i) => `<div class="shop-item">
              <div class="shop-check ${i.comprado ? 'checked' : ''}" data-id="${i.id}" data-comprado="${i.comprado}">${i.comprado ? '<i class="ti ti-check" style="font-size:10px;color:#fff"></i>' : ''}</div>
              <div class="shop-name ${i.comprado ? 'done' : ''}">${escapeHtml(i.nombre)}</div>
              <div>${fmt(i.precioEstimado)}</div>
            </div>`,
          )
          .join('')
      : `<div style="font-size:12px;color:var(--text-3)">No hay otros productos en la lista.</div>`;

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
        <div class="card-title">Recetas sugeridas</div>
        <span class="card-sub">Agrégalas a tu recetario con un clic</span>
      </div>
      <div class="recipe-grid" id="recipe-plantillas"></div>
    </div>
    <div class="card">
      <div class="card-hd">
        <div class="card-title">Recetario del grupo</div>
        <button class="btn btn-sm btn-primary" id="r-new"><i class="ti ti-plus"></i> Nueva receta</button>
      </div>
      <div class="recipe-grid" id="recipe-grid"></div>
    </div>
    <div id="recipe-modal"></div>`;

  async function cargarPlantillas() {
    const plantillas = await api.get<RecetaPlantilla[]>('/recetas-plantilla');
    document.getElementById('recipe-plantillas')!.innerHTML = plantillas
      .map(
        (p) => `<div class="recipe-card p-plantilla" data-id="${p.id}">
          <div class="rc-name">${escapeHtml(p.nombre)}</div>
          <div class="rc-meta"><span>${p.tiempoMin} min</span><span>${p.porciones} pers.</span></div>
          <div style="font-size:10px;color:var(--text-3)">${escapeHtml((p.ingredientes ?? []).map((i) => i.n).join(', '))}</div>
        </div>`,
      )
      .join('');

    document.querySelectorAll<HTMLElement>('.p-plantilla').forEach((el) =>
      el.addEventListener('click', async () => {
        await api.post(`/groups/${grupo!.id}/recetas/importar/${el.dataset.id}`, {});
        await cargar();
      }),
    );
  }

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

  await Promise.all([cargarPlantillas(), cargar()]);
}

export async function renderCalendario() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  const hoy = new Date();
  content.innerHTML = `
    <div class="card">
      <div class="card-hd">
        <div class="card-title">Menú de ${hoy.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</div>
        <button class="btn btn-sm btn-primary" id="cal-generar"><i class="ti ti-shopping-cart"></i> Agregar ingredientes a la alacena</button>
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
    alert(res.agregados.length ? `${res.agregados.length} producto(s) agregados a tu alacena y a la lista de compras.` : 'No hay ingredientes nuevos para agregar.');
  });

  await cargar();
}
