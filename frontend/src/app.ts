import { api, escapeHtml } from './api';
import { grupoActivo, state } from './state';
import { renderAsistente, renderSegmentacion } from './panels/insights';
import { renderFamilia } from './panels/familia';
import { renderAlacena, renderCalendario, renderCompras, renderRecetario } from './panels/hogar';
import { renderDashboard, renderGastos, renderIngresos, renderPresupuesto } from './panels/financiero';
import { renderMesada, renderTareas } from './panels/mesada';
import { activarNotificaciones, desactivarNotificaciones, estadoNotificaciones } from './push';

const PAGES: Record<string, { title: string; sub: string; render: () => void }> = {
  dashboard: { title: 'Resumen financiero', sub: 'de tu grupo familiar', render: renderDashboard },
  gastos: { title: 'Gestión de gastos', sub: 'Todos los gastos del grupo', render: renderGastos },
  ingresos: { title: 'Ingresos', sub: 'Sueldos, bonos y mesadas del grupo', render: renderIngresos },
  presupuesto: { title: 'Presupuesto familiar', sub: 'Control por categoría', render: renderPresupuesto },
  alacena: { title: 'Inventario alacena', sub: 'Stock del hogar compartido', render: renderAlacena },
  compras: { title: 'Lista de compras', sub: 'Compartida con tu grupo', render: renderCompras },
  recetario: { title: 'Recetario familiar', sub: 'Recetas de tu grupo', render: renderRecetario },
  calendario: { title: 'Menú del mes', sub: 'Calendario de comidas', render: renderCalendario },
  mesada: { title: 'Mi mesada', sub: 'Tu plata, tus metas de ahorro', render: renderMesada },
  tareas: { title: 'Tareas del hogar', sub: 'Con recompensa cuando corresponde', render: renderTareas },
  segmentacion: { title: 'Segmentación de productos', sub: '1ª categoría, 2ª categoría y prescindibles', render: renderSegmentacion },
  asistente: { title: 'Asistente', sub: 'Consulta sobre tus datos reales', render: renderAsistente },
  familia: { title: 'Mi familia', sub: 'Miembros del grupo', render: renderFamilia },
};

const NAV_SECTIONS: { label: string; items: { id: string; icon: string; label: string }[] }[] = [
  { label: 'principal', items: [
    { id: 'dashboard', icon: 'ti-layout-dashboard', label: 'Resumen' },
    { id: 'gastos', icon: 'ti-receipt', label: 'Gastos' },
    { id: 'ingresos', icon: 'ti-cash', label: 'Ingresos' },
  ] },
  { label: 'hogar', items: [
    { id: 'alacena', icon: 'ti-package', label: 'Alacena' },
    { id: 'compras', icon: 'ti-shopping-cart', label: 'Lista de compras' },
    { id: 'presupuesto', icon: 'ti-chart-pie', label: 'Presupuesto' },
  ] },
  { label: 'planificación', items: [
    { id: 'recetario', icon: 'ti-chef-hat', label: 'Recetario' },
    { id: 'calendario', icon: 'ti-calendar-month', label: 'Menú del mes' },
  ] },
  { label: 'hijos', items: [
    { id: 'mesada', icon: 'ti-piggy-bank', label: 'Mi mesada' },
    { id: 'tareas', icon: 'ti-checklist', label: 'Tareas del hogar' },
  ] },
  { label: 'familia', items: [
    { id: 'segmentacion', icon: 'ti-layers-intersect', label: 'Segmentación' },
    { id: 'familia', icon: 'ti-users-group', label: 'Mi familia' },
    { id: 'asistente', icon: 'ti-sparkles', label: 'Asistente' },
  ] },
];

export function renderApp() {
  const root = document.getElementById('app')!;
  const grupo = grupoActivo();

  root.innerHTML = `
    <div class="app">
      <div class="sidebar">
        <div class="sb-head">
          <div class="sb-logo">
            <div class="sb-icon"><i class="ti ti-home-heart"></i></div>
            <div><div class="sb-name">FamilyFinance</div><div class="sb-sub">gestión familiar</div></div>
          </div>
          <div class="family-pill"><i class="ti ti-users" style="font-size:12px"></i> ${escapeHtml(grupo?.nombre ?? '')}</div>
        </div>
        <nav class="nav" id="sidebar-nav">
          ${NAV_SECTIONS.map((sec) => `
            <div class="nav-sec">
              <div class="nav-sec-label">${sec.label}</div>
              ${sec.items.map((it) => `<button class="nav-item" data-page="${it.id}"><i class="ti ${it.icon}"></i> ${it.label}</button>`).join('')}
            </div>`).join('')}
        </nav>
        <div class="sb-foot">
          <button class="nav-item" id="btn-notificaciones" style="margin-bottom:6px"><i class="ti ti-bell"></i> <span id="notif-label">Notificaciones</span></button>
          <div class="user-row" id="btn-logout" title="Cerrar sesión">
            <div class="av">${escapeHtml((state.usuario?.nombre ?? '?').slice(0, 2).toUpperCase())}</div>
            <div><div class="u-name">${escapeHtml(state.usuario?.nombre ?? '')}</div><div class="u-role">${grupo?.rol ?? ''}</div></div>
            <i class="ti ti-logout" style="margin-left:auto;color:var(--text-3);font-size:14px"></i>
          </div>
        </div>
      </div>
      <div class="main">
        <div class="topbar">
          <div><div class="tb-title" id="page-title"></div><div class="tb-sub" id="page-sub"></div></div>
        </div>
        <div class="content" id="content"></div>
      </div>
    </div>
    <div class="mobile-nav">
      ${NAV_SECTIONS.flatMap((s) => s.items).slice(0, 5).map((it) => `<button data-page="${it.id}"><i class="ti ${it.icon}"></i>${it.label}</button>`).join('')}
    </div>`;

  document.querySelectorAll<HTMLElement>('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => goTo(btn.dataset.page!));
  });
  document.getElementById('btn-logout')!.addEventListener('click', async () => {
    await api.post('/auth/logout');
    location.reload();
  });

  configurarBotonNotificaciones();
  goTo('dashboard');
}

let intervaloActivo: number | null = null;

// Sincronización "en vivo" simple: las pantallas compartidas (compras,
// alacena, menú) se registran acá para refrescar sus datos cada cierto
// tiempo mientras están abiertas, así los cambios de otros miembros del
// grupo aparecen sin que haya que recargar la página a mano. Se limpia
// automáticamente al salir de la pantalla (goTo) para no seguir refrescando
// contenido que ya no existe en el DOM.
export function registrarPolling(fn: () => void, ms = 10000) {
  if (intervaloActivo !== null) window.clearInterval(intervaloActivo);
  intervaloActivo = window.setInterval(() => {
    // No refrescar mientras el usuario está escribiendo en un campo (ej:
    // editando la cantidad a comprar) — perdería lo que estaba tipeando.
    const activo = document.activeElement;
    if (activo instanceof HTMLInputElement || activo instanceof HTMLTextAreaElement) return;
    fn();
  }, ms);
}

export function goTo(pageId: string) {
  if (intervaloActivo !== null) {
    window.clearInterval(intervaloActivo);
    intervaloActivo = null;
  }
  document.querySelectorAll('.nav-item, .mobile-nav button').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll(`[data-page="${pageId}"]`).forEach((el) => el.classList.add('active'));

  const page = PAGES[pageId];
  document.getElementById('page-title')!.textContent = page.title;
  document.getElementById('page-sub')!.textContent = page.sub;
  document.getElementById('content')!.innerHTML = '';
  page.render();
}

async function configurarBotonNotificaciones() {
  const btn = document.getElementById('btn-notificaciones') as HTMLButtonElement | null;
  const label = document.getElementById('notif-label');
  if (!btn || !label) return;

  async function refrescar() {
    const estado = await estadoNotificaciones();
    if (estado === 'no-soportado' || estado === 'no-configurado') {
      btn!.style.display = 'none';
      return;
    }
    btn!.style.display = '';
    btn!.classList.toggle('active', estado === 'activo');
    label!.textContent =
      estado === 'activo' ? 'Notificaciones activas' : estado === 'denegado' ? 'Notificaciones bloqueadas' : 'Activar notificaciones';
    btn!.disabled = estado === 'denegado';
  }

  btn.addEventListener('click', async () => {
    try {
      const estadoActual = await estadoNotificaciones();
      if (estadoActual === 'activo') {
        await desactivarNotificaciones();
      } else {
        await activarNotificaciones();
      }
    } catch (err) {
      alert(`No se pudo activar las notificaciones: ${(err as Error).message}`);
    }
    await refrescar();
  });

  await refrescar();
}
