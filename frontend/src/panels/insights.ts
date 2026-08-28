import { api, escapeHtml, fmt } from '../api';
import { grupoActivo } from '../state';

interface ProductoSegmentado {
  id: string;
  nombre: string;
  categoria: string;
  frecuencia: string;
  precioUnitario: number;
  cantidad: number;
  segmento: 'cat1' | 'cat2' | 'saving';
  justificacion: string;
}

const SEGMENTO_LABEL: Record<string, string> = { cat1: '1ª categoría', cat2: '2ª categoría', saving: 'Prescindible' };

export async function renderSegmentacion() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  content.innerHTML = `<div class="card"><div class="card-hd"><div class="card-title">Clasificación de productos</div></div><div id="seg-tbl"></div></div>`;

  const productos = await api.get<ProductoSegmentado[]>(`/groups/${grupo!.id}/segmentacion`);
  const container = document.getElementById('seg-tbl')!;

  if (!productos.length) {
    container.innerHTML = `<div style="font-size:12px;color:var(--text-3)">Aún no tienes productos clasificados. Esta lista se puede ir completando a medida que registras tus gastos habituales.</div>`;
    return;
  }

  container.innerHTML = `<table class="tbl">
    <thead><tr><th>Producto</th><th>Total mes</th><th>Segmento</th></tr></thead>
    <tbody>${productos
      .map(
        (p) => `<tr>
          <td>${escapeHtml(p.nombre)}</td>
          <td>${fmt(p.precioUnitario * p.cantidad)}</td>
          <td><select data-id="${p.id}" class="seg-select">
            ${Object.entries(SEGMENTO_LABEL).map(([v, l]) => `<option value="${v}" ${v === p.segmento ? 'selected' : ''}>${l}</option>`).join('')}
          </select></td>
        </tr>`,
      )
      .join('')}</tbody>
  </table>`;

  container.querySelectorAll<HTMLSelectElement>('.seg-select').forEach((sel) => {
    sel.addEventListener('change', async () => {
      await api.patch(`/groups/${grupo!.id}/segmentacion/${sel.dataset.id}`, { segmento: sel.value });
    });
  });
}

export async function renderAsistente() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  content.innerHTML = `
    <div class="card">
      <div class="ai-panel">
        <div class="ai-msgs" id="ai-msgs">
          <div class="ai-msg bot">¡Hola! Puedo ayudarte con tus gastos, presupuesto, alacena, recetas y ahorro. ¿En qué te ayudo?</div>
        </div>
        <div class="ai-input-row">
          <input type="text" id="ai-input" placeholder="Pregúntame algo…" />
          <button class="btn btn-primary" id="ai-send"><i class="ti ti-send"></i></button>
        </div>
      </div>
    </div>`;

  async function enviar() {
    const input = document.getElementById('ai-input') as HTMLInputElement;
    const texto = input.value.trim();
    if (!texto) return;
    input.value = '';
    const msgs = document.getElementById('ai-msgs')!;
    msgs.innerHTML += `<div class="ai-msg user">${escapeHtml(texto)}</div>`;
    msgs.innerHTML += `<div class="ai-msg bot" id="ai-typing">Escribiendo…</div>`;
    msgs.scrollTop = msgs.scrollHeight;

    try {
      const { respuesta } = await api.post<{ respuesta: string }>(`/groups/${grupo!.id}/asistente`, { pregunta: texto });
      document.getElementById('ai-typing')!.outerHTML = `<div class="ai-msg bot">${escapeHtml(respuesta)}</div>`;
    } catch (err) {
      document.getElementById('ai-typing')!.outerHTML = `<div class="ai-msg bot">${escapeHtml((err as Error).message)}</div>`;
    }
    msgs.scrollTop = msgs.scrollHeight;
  }

  document.getElementById('ai-send')!.addEventListener('click', enviar);
  document.getElementById('ai-input')!.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') enviar();
  });
}
