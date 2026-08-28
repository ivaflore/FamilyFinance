import { registrarPolling } from '../app';
import { api, escapeHtml, fmt } from '../api';
import { grupoActivo } from '../state';

interface ProductoAlacena {
  id: string;
  icono: string;
  nombre: string;
  unidad: string;
  categoria: string;
  cantidadIdeal: number;
  cantidadActual: number;
  precioEstimado: number;
  faltante: number;
}

const CATEGORIAS_ALACENA = [
  'Despensa y Abarrotes',
  'Proteínas y Congelados',
  'Lácteos, Huevos y Fiambrería',
  'Frutas y Verduras',
  'Desayuno, Especias y Dulces',
  'Limpieza e Higiene',
  'Otros',
];
interface ProductoSugerido extends ProductoAlacena {
  origen: 'alacena' | 'receta';
}
interface ItemCompra { id: string; nombre: string; precioEstimado: number; comprado: boolean }
interface ListaCompras { sugeridos: ProductoSugerido[]; manuales: ItemCompra[] }
interface Receta {
  id: string;
  nombre: string;
  tipos: string[];
  tiempoMin: number;
  porciones: number;
  ingredientes: { n: string }[];
  pasos: string[];
  linkVideo?: string;
}
interface RecetaPlantilla {
  id: string;
  nombre: string;
  tipos: string[];
  tiempoMin: number;
  porciones: number;
  ingredientes: { n: string }[];
  linkVideo?: string;
}
interface Planificacion { id: string; fecha: string; tipoComida: string; receta: Receta; disponible: boolean; faltantes: string[] }

const TIPOS_RECETA: Record<string, string> = {
  desayuno: 'Desayuno',
  almuerzo: 'Almuerzo',
  cena: 'Cena',
  postre: 'Postre',
};
function etiquetaTipo(tipo: string) {
  return TIPOS_RECETA[tipo] ?? tipo[0].toUpperCase() + tipo.slice(1);
}
// Agrupa recetas por su primer tipo (una receta puede tener varios, ej.
// ["almuerzo","cena"]) respetando el orden desayuno→almuerzo→cena→postre
// y agregando al final cualquier tipo no contemplado.
function agruparPorTipo<T extends { tipos: string[] }>(items: T[]): [string, T[]][] {
  const ordenBase = Object.keys(TIPOS_RECETA);
  const tiposPresentes = new Set(items.map((i) => i.tipos[0] ?? 'otros'));
  const orden = [...ordenBase.filter((t) => tiposPresentes.has(t)), ...[...tiposPresentes].filter((t) => !ordenBase.includes(t))];
  return orden.map((tipo) => [tipo, items.filter((i) => (i.tipos[0] ?? 'otros') === tipo)]);
}

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
      <div style="display:grid;grid-template-columns:1.2fr 1.2fr 1fr 0.7fr 0.7fr 0.8fr auto;gap:8px;align-items:end">
        <div><label class="form-label">Producto</label><input type="text" id="a-nombre" placeholder="ej: Leche" /></div>
        <div><label class="form-label">Categoría</label>
          <select id="a-categoria">${CATEGORIAS_ALACENA.map((c) => `<option value="${c}">${c}</option>`).join('')}</select>
        </div>
        <div><label class="form-label">Unidad</label><input type="text" id="a-unidad" placeholder="ej: litros" value="unidades" /></div>
        <div><label class="form-label">Ideal</label><input type="number" id="a-ideal" placeholder="2" min="0.01" step="0.01" /></div>
        <div><label class="form-label">Tengo ahora</label><input type="number" id="a-actual" placeholder="2" min="0" step="0.01" /></div>
        <div><label class="form-label">Precio est. ($)</label><input type="number" id="a-precio" placeholder="0" min="0" step="1" /></div>
        <button class="btn btn-primary" id="a-add"><i class="ti ti-plus"></i> Agregar</button>
      </div>
    </div>
    <div class="card"><div class="card-hd"><div class="card-title">Inventario del grupo</div></div><div id="pantry-grupos"></div></div>
    <div id="alacena-modal"></div>`;

  function abrirEdicion(p: ProductoAlacena) {
    document.getElementById('alacena-modal')!.innerHTML = `
      <div class="modal-overlay" id="am-overlay">
        <div class="modal">
          <div class="modal-title">Editar producto</div>
          <div class="form-row"><label class="form-label">Producto</label><input type="text" id="am-nombre" value="${escapeHtml(p.nombre)}" /></div>
          <div class="form-row"><label class="form-label">Categoría</label>
            <select id="am-categoria">${CATEGORIAS_ALACENA.map((c) => `<option value="${c}" ${c === p.categoria ? 'selected' : ''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-row"><label class="form-label">Unidad</label><input type="text" id="am-unidad" value="${escapeHtml(p.unidad)}" /></div>
          <div class="form-row"><label class="form-label">Ideal</label><input type="number" id="am-ideal" value="${p.cantidadIdeal}" min="0.01" step="0.01" /></div>
          <div class="form-row"><label class="form-label">Tengo ahora</label><input type="number" id="am-actual" value="${p.cantidadActual}" min="0" step="0.01" /></div>
          <div class="form-row"><label class="form-label">Precio estimado ($)</label><input type="number" id="am-precio" value="${p.precioEstimado}" min="0" step="1" /></div>
          <div class="modal-actions">
            <button class="btn btn-primary" id="am-save" style="flex:1">Guardar</button>
            <button class="btn" id="am-cancel">Cancelar</button>
          </div>
        </div>
      </div>`;
    const close = () => (document.getElementById('alacena-modal')!.innerHTML = '');
    document.getElementById('am-overlay')!.addEventListener('click', (e) => e.target === e.currentTarget && close());
    document.getElementById('am-cancel')!.addEventListener('click', close);
    document.getElementById('am-save')!.addEventListener('click', async () => {
      const nombre = (document.getElementById('am-nombre') as HTMLInputElement).value.trim();
      const categoria = (document.getElementById('am-categoria') as HTMLSelectElement).value;
      const unidad = (document.getElementById('am-unidad') as HTMLInputElement).value.trim() || 'unidades';
      const cantidadIdeal = Number((document.getElementById('am-ideal') as HTMLInputElement).value);
      const cantidadActual = Number((document.getElementById('am-actual') as HTMLInputElement).value);
      const precioEstimado = Number((document.getElementById('am-precio') as HTMLInputElement).value) || 0;
      if (!nombre || !(cantidadIdeal > 0) || !(cantidadActual >= 0)) return;
      try {
        await api.put(`/groups/${grupo!.id}/alacena/${p.id}`, { nombre, categoria, unidad, cantidadIdeal, cantidadActual, precioEstimado });
        close();
        await cargar();
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  async function cargar() {
    const productos = await api.get<ProductoAlacena[]>(`/groups/${grupo!.id}/alacena`);

    function tarjeta(p: ProductoAlacena) {
      return `<div class="pantry-card ${p.faltante > 0 ? 'low' : ''}">
        <span class="p-icon">${escapeHtml(p.icono || '📦')}</span>
        <div class="p-name">${escapeHtml(p.nombre)}</div>
        <div class="p-qty">${p.cantidadActual} / ${p.cantidadIdeal} ${escapeHtml(p.unidad)}</div>
        ${p.precioEstimado > 0 ? `<div style="font-size:10px;color:var(--text-3)">${fmt(p.precioEstimado)} c/u</div>` : ''}
        ${p.faltante > 0 ? `<div style="font-size:10px;color:var(--coral-d);font-weight:600;margin-top:2px">Faltan ${p.faltante}</div>` : ''}
        <div style="display:flex;gap:4px;justify-content:center;margin-top:6px;flex-wrap:wrap">
          <button class="btn btn-sm p-menos" data-id="${p.id}" data-actual="${p.cantidadActual}">−1</button>
          <button class="btn btn-sm p-repone" data-id="${p.id}" data-ideal="${p.cantidadIdeal}">Reponer</button>
          <button class="btn btn-sm btn-edit p-editar" data-id="${p.id}"><i class="ti ti-pencil"></i> Editar</button>
          <button class="btn btn-sm btn-danger p-eliminar" data-id="${p.id}"><i class="ti ti-trash"></i> Borrar</button>
        </div>
      </div>`;
    }

    const grupos = document.getElementById('pantry-grupos')!;
    if (!productos.length) {
      grupos.innerHTML = `<div style="font-size:12px;color:var(--text-3)">La alacena está vacía todavía.</div>`;
    } else {
      const categoriasConProductos = CATEGORIAS_ALACENA.filter((c) => productos.some((p) => p.categoria === c));
      grupos.innerHTML = categoriasConProductos
        .map((categoria) => {
          const items = productos.filter((p) => p.categoria === categoria);
          return `<div class="pantry-cat">
            <div class="pantry-cat-title">${escapeHtml(categoria)} <span class="pantry-cat-count">${items.length}</span></div>
            <div class="pantry-grid">${items.map(tarjeta).join('')}</div>
          </div>`;
        })
        .join('');
    }

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
    document.querySelectorAll<HTMLElement>('.p-editar').forEach((el) =>
      el.addEventListener('click', () => {
        const p = productos.find((x) => x.id === el.dataset.id);
        if (p) abrirEdicion(p);
      }),
    );
    document.querySelectorAll<HTMLElement>('.p-eliminar').forEach((el) =>
      el.addEventListener('click', async () => {
        if (!confirm('¿Eliminar este producto de la alacena?')) return;
        await api.del(`/groups/${grupo!.id}/alacena/${el.dataset.id}`);
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
    const categoria = (document.getElementById('a-categoria') as HTMLSelectElement).value;
    const unidad = (document.getElementById('a-unidad') as HTMLInputElement).value.trim() || 'unidades';
    const cantidadIdeal = Number((document.getElementById('a-ideal') as HTMLInputElement).value);
    const cantidadActualInput = (document.getElementById('a-actual') as HTMLInputElement).value;
    const cantidadActual = cantidadActualInput === '' ? cantidadIdeal : Number(cantidadActualInput);
    const precioEstimado = Number((document.getElementById('a-precio') as HTMLInputElement).value) || 0;
    if (!nombre || !(cantidadIdeal > 0)) return;
    try {
      await api.post(`/groups/${grupo!.id}/alacena`, { nombre, categoria, unidad, cantidadIdeal, cantidadActual, precioEstimado });
      (document.getElementById('a-nombre') as HTMLInputElement).value = '';
      (document.getElementById('a-ideal') as HTMLInputElement).value = '';
      (document.getElementById('a-actual') as HTMLInputElement).value = '';
      (document.getElementById('a-precio') as HTMLInputElement).value = '';
      await cargar();
    } catch (err) {
      alert((err as Error).message);
    }
  });

  await cargar();
  registrarPolling(cargar);
}

export async function renderCompras() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  content.innerHTML = `
    <div class="card">
      <div class="card-hd">
        <div class="card-title">Sugeridos desde tu alacena</div>
        <span class="card-sub">Agrupados como en el supermercado — total estimado: <strong id="shop-total">$0</strong></span>
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

  let totalManuales = 0;

  function recalcularTotal() {
    let total = totalManuales;
    document.querySelectorAll<HTMLInputElement>('.p-cant-comprar').forEach((input) => {
      total += Number(input.dataset.precio) * (Number(input.value) || 0);
    });
    document.getElementById('shop-total')!.textContent = fmt(total);
  }

  async function cargar() {
    const { sugeridos, manuales } = await api.get<ListaCompras>(`/groups/${grupo!.id}/compras`);
    totalManuales = manuales.reduce((a, i) => a + i.precioEstimado, 0);

    const ORIGEN_LABEL: Record<ProductoSugerido['origen'], { texto: string; bg: string; fg: string }> = {
      alacena: { texto: 'Habitual', bg: 'var(--amber-l)', fg: 'var(--amber-d)' },
      receta: { texto: '🍽️ Menú', bg: 'var(--purple-l)', fg: 'var(--purple-d)' },
    };

    function fila(p: ProductoSugerido) {
      const origen = ORIGEN_LABEL[p.origen];
      const subtotal = p.precioEstimado * p.faltante;
      return `<tr>
        <td><span class="tag" style="background:${origen.bg};color:${origen.fg}">${origen.texto}</span></td>
        <td>${escapeHtml(p.nombre)}</td>
        <td>
          <input type="number" class="p-cant-comprar" data-id="${p.id}" data-actual="${p.cantidadActual}" data-precio="${p.precioEstimado}" value="${p.faltante}" min="0.01" step="0.01" style="width:64px" />
          ${escapeHtml(p.unidad)}
        </td>
        <td style="text-align:right;color:var(--text-3)">${p.precioEstimado > 0 ? fmt(p.precioEstimado) : '—'}</td>
        <td style="text-align:right;font-weight:600" class="p-subtotal">${p.precioEstimado > 0 ? fmt(subtotal) : '—'}</td>
        <td style="text-align:right"><button class="btn btn-sm btn-primary p-comprado" data-id="${p.id}">Ya compré</button></td>
      </tr>`;
    }

    if (!sugeridos.length) {
      document.getElementById('shop-sugeridos')!.innerHTML = `<div style="font-size:12px;color:var(--text-3)">Tu alacena está completa — nada pendiente por comprar.</div>`;
    } else {
      const categoriasConSugeridos = CATEGORIAS_ALACENA.filter((c) => sugeridos.some((p) => p.categoria === c));
      document.getElementById('shop-sugeridos')!.innerHTML = categoriasConSugeridos
        .map((categoria) => {
          const items = sugeridos.filter((p) => p.categoria === categoria);
          return `<div class="pantry-cat">
            <div class="pantry-cat-title">${escapeHtml(categoria)} <span class="pantry-cat-count">${items.length}</span></div>
            <table class="tbl">
              <thead><tr><th>Motivo</th><th>Producto</th><th>Cantidad a comprar</th><th style="text-align:right">Precio est.</th><th style="text-align:right">Subtotal</th><th></th></tr></thead>
              <tbody>${items.map(fila).join('')}</tbody>
            </table>
          </div>`;
        })
        .join('');
    }

    document.querySelectorAll<HTMLInputElement>('.p-cant-comprar').forEach((input) =>
      input.addEventListener('input', () => {
        const precio = Number(input.dataset.precio);
        const fila = input.closest('tr')!;
        const cantidad = Number(input.value) || 0;
        fila.querySelector('.p-subtotal')!.textContent = precio > 0 ? fmt(precio * cantidad) : '—';
        recalcularTotal();
      }),
    );
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
    recalcularTotal();

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
  registrarPolling(cargar);
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

  function botonVideo(linkVideo?: string) {
    if (!linkVideo) return '';
    return `<a href="${escapeHtml(linkVideo)}" target="_blank" rel="noopener" class="btn btn-sm rc-video" onclick="event.stopPropagation()">▶️ Ver video</a>`;
  }

  async function cargarPlantillas() {
    const plantillas = await api.get<RecetaPlantilla[]>('/recetas-plantilla');
    document.getElementById('recipe-plantillas')!.innerHTML = agruparPorTipo(plantillas)
      .map(
        ([tipo, items]) => `<div class="pantry-cat">
          <div class="pantry-cat-title">${etiquetaTipo(tipo)} <span class="pantry-cat-count">${items.length}</span></div>
          <div class="recipe-grid">
            ${items
              .map(
                (p) => `<div class="recipe-card p-plantilla" data-id="${p.id}">
                  <div class="rc-name">${escapeHtml(p.nombre)}</div>
                  <div class="rc-meta"><span>${p.tiempoMin} min</span><span>${p.porciones} pers.</span></div>
                  <div style="font-size:10px;color:var(--text-3)">${escapeHtml((p.ingredientes ?? []).map((i) => i.n).join(', '))}</div>
                  ${botonVideo(p.linkVideo)}
                </div>`,
              )
              .join('')}
          </div>
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
      ? agruparPorTipo(recetas)
          .map(
            ([tipo, items]) => `<div class="pantry-cat">
              <div class="pantry-cat-title">${etiquetaTipo(tipo)} <span class="pantry-cat-count">${items.length}</span></div>
              <div class="recipe-grid">
                ${items
                  .map(
                    (r) => `<div class="recipe-card">
                      <div class="rc-name">${escapeHtml(r.nombre)}</div>
                      <div class="rc-meta"><span>${r.tiempoMin} min</span><span>${r.porciones} pers.</span></div>
                      <div style="font-size:10px;color:var(--text-3)">${escapeHtml((r.ingredientes ?? []).map((i) => i.n).join(', '))}</div>
                      ${botonVideo(r.linkVideo)}
                    </div>`,
                  )
                  .join('')}
              </div>
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
          <div class="form-row"><label class="form-label">Tipo</label>
            <select id="nr-tipo">${Object.entries(TIPOS_RECETA).map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select>
          </div>
          <div class="form-row"><label class="form-label">Tiempo (min)</label><input type="number" id="nr-tiempo" value="30" /></div>
          <div class="form-row"><label class="form-label">Porciones</label><input type="number" id="nr-porciones" value="4" /></div>
          <div class="form-row"><label class="form-label">Ingredientes (separados por coma)</label><input type="text" id="nr-ingr" placeholder="arroz, tomate, aceite" /></div>
          <div class="form-row"><label class="form-label">Pasos (separados por punto)</label><textarea id="nr-pasos"></textarea></div>
          <div class="form-row"><label class="form-label">Link a video (opcional)</label><input type="url" id="nr-video" placeholder="https://www.youtube.com/..." /></div>
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
      const linkVideo = (document.getElementById('nr-video') as HTMLInputElement).value.trim();
      await api.post(`/groups/${grupo!.id}/recetas`, {
        nombre,
        tipos: [(document.getElementById('nr-tipo') as HTMLSelectElement).value],
        tiempoMin: Number((document.getElementById('nr-tiempo') as HTMLInputElement).value) || 30,
        porciones: Number((document.getElementById('nr-porciones') as HTMLInputElement).value) || 4,
        ingredientes,
        pasos: pasos.length ? pasos : ['Preparar y cocinar'],
        ...(linkVideo ? { linkVideo } : {}),
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
        <thead><tr><th>Fecha</th><th>Comida</th><th>Receta</th><th>¿Tienes todo?</th><th></th></tr></thead>
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
    </div>
    <div id="cal-modal"></div>`;

  let recetasDisponibles: Receta[] = [];

  function abrirEdicion(p: Planificacion) {
    document.getElementById('cal-modal')!.innerHTML = `
      <div class="modal-overlay" id="cm-overlay">
        <div class="modal">
          <div class="modal-title">Editar comida planificada</div>
          <div class="form-row"><label class="form-label">Fecha</label><input type="date" id="cm-fecha" value="${p.fecha.slice(0, 10)}" /></div>
          <div class="form-row"><label class="form-label">Tipo</label>
            <select id="cm-tipo">
              ${['almuerzo', 'cena', 'desayuno'].map((t) => `<option value="${t}" ${t === p.tipoComida ? 'selected' : ''}>${t[0].toUpperCase()}${t.slice(1)}</option>`).join('')}
            </select>
          </div>
          <div class="form-row"><label class="form-label">Receta</label>
            <select id="cm-receta">${recetasDisponibles.map((r) => `<option value="${r.id}" ${r.id === p.receta.id ? 'selected' : ''}>${escapeHtml(r.nombre)}</option>`).join('')}</select>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" id="cm-save" style="flex:1">Guardar</button>
            <button class="btn" id="cm-cancel">Cancelar</button>
          </div>
        </div>
      </div>`;
    const close = () => (document.getElementById('cal-modal')!.innerHTML = '');
    document.getElementById('cm-overlay')!.addEventListener('click', (e) => e.target === e.currentTarget && close());
    document.getElementById('cm-cancel')!.addEventListener('click', close);
    document.getElementById('cm-save')!.addEventListener('click', async () => {
      const fecha = (document.getElementById('cm-fecha') as HTMLInputElement).value;
      const tipoComida = (document.getElementById('cm-tipo') as HTMLSelectElement).value;
      const recetaId = (document.getElementById('cm-receta') as HTMLSelectElement).value;
      if (!fecha || !recetaId) return;
      await api.put(`/groups/${grupo!.id}/calendario/${p.id}`, { fecha, tipoComida, recetaId });
      close();
      await cargar();
    });
  }

  async function cargar() {
    const [planificaciones, recetas] = await Promise.all([
      api.get<Planificacion[]>(`/groups/${grupo!.id}/calendario?anio=${hoy.getFullYear()}&mes=${hoy.getMonth()}`),
      api.get<Receta[]>(`/groups/${grupo!.id}/recetas`),
    ]);
    recetasDisponibles = recetas;

    document.getElementById('cal-tbody')!.innerHTML = planificaciones.length
      ? planificaciones
          .map(
            (p) =>
              `<tr>
                <td>${new Date(p.fecha).toLocaleDateString('es-CL')}</td>
                <td><span class="tag">${p.tipoComida}</span></td>
                <td>${escapeHtml(p.receta.nombre)}</td>
                <td>
                  ${
                    p.disponible
                      ? `<span title="Tienes todos los ingredientes en la alacena">🟢 Sí</span>`
                      : `<span title="Faltan: ${escapeHtml(p.faltantes.join(', '))}">🔴 Faltan ${p.faltantes.length}</span>
                         <button class="btn btn-sm btn-primary cal-comprar" data-receta-id="${p.receta.id}" style="margin-left:6px">Agregar a la compra</button>`
                  }
                </td>
                <td style="text-align:right;white-space:nowrap">
                  <button class="btn btn-sm btn-edit cal-editar" data-id="${p.id}"><i class="ti ti-pencil"></i> Modificar</button>
                  <button class="btn btn-sm btn-danger cal-eliminar" data-id="${p.id}"><i class="ti ti-trash"></i> Eliminar</button>
                </td>
              </tr>`,
          )
          .join('')
      : `<tr><td colspan="5" style="color:var(--text-3);font-size:12px">Sin comidas planificadas este mes.</td></tr>`;

    document.querySelectorAll<HTMLElement>('.cal-comprar').forEach((el) =>
      el.addEventListener('click', async () => {
        const res = await api.post<{ agregados: string[] }>(
          `/groups/${grupo!.id}/recetas/${el.dataset.recetaId}/agregar-faltantes`,
          {},
        );
        alert(
          res.agregados.length
            ? `${res.agregados.length} producto(s) agregados a tu alacena y a la lista de compras.`
            : 'Esos ingredientes ya están en tu alacena — revisa si tienen stock suficiente.',
        );
        await cargar();
      }),
    );
    document.querySelectorAll<HTMLElement>('.cal-editar').forEach((el) =>
      el.addEventListener('click', () => {
        const p = planificaciones.find((x) => x.id === el.dataset.id);
        if (p) abrirEdicion(p);
      }),
    );
    document.querySelectorAll<HTMLElement>('.cal-eliminar').forEach((el) =>
      el.addEventListener('click', async () => {
        if (!confirm('¿Eliminar esta comida planificada?')) return;
        await api.del(`/groups/${grupo!.id}/calendario/${el.dataset.id}`);
        await cargar();
      }),
    );

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
  registrarPolling(cargar);
}
