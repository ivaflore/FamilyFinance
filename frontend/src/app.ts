import { api, escapeHtml } from './api';
import { grupoActivo, state } from './state';
import { renderAsistente, renderSegmentacion } from './panels/insights';
import { renderFamilia } from './panels/familia';
import { renderAlacena, renderCalendario, renderCompras, renderRecetario } from './panels/hogar';
import { renderDashboard, renderGastos, renderPresupuesto } from './panels/financiero';

const PAGES: Record<string, { title: string; sub: string; render: () => void }> = {
  dashboard: { title: 'Resumen financiero', sub: 'de tu grupo familiar', render: renderDashboard },
  gastos: { title: 'Gestión de gastos', sub: 'Todos los gastos del grupo', render: renderGastos },
  presupuesto: { title: 'Presupuesto familiar', sub: 'Control por categoría', render: renderPresupuesto },
  alacena: { title: 'Inventario alacena', sub: 'Stock del hogar compartido', render: renderAlacena },
  compras: { title: 'Lista de compras', sub: 'Compartida con tu grupo', render: renderCompras },
  recetario: { title: 'Recetario familiar', sub: 'Recetas de tu grupo', render: renderRecetario },
  calendario: { title: 'Menú del mes', sub: 'Calendario de comidas', render: renderCalendario },
  segmentacion: { title: 'Segmentación de productos', sub: '1ª categoría, 2ª categoría y prescindibles', render: renderSegmentacion },
  asistente: { title: 'Asistente', sub: 'Consulta sobre tus datos reales', render: renderAsistente },
  familia: { title: 'Mi familia', sub: 'Miembros del grupo', render: renderFamilia },
};

const NAV_SECTIONS: { label: string; items: { id: string; icon: string; label: string }[] }[] = [
  { label: 'principal', items: [
    { id: 'dashboard', icon: 'ti-layout-dashboard', label: 'Resumen' },
    { id: 'gastos', icon: 'ti-receipt', label: 'Gastos' },
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

  goTo('dashboard');
}

export function goTo(pageId: string) {
  document.querySelectorAll('.nav-item, .mobile-nav button').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll(`[data-page="${pageId}"]`).forEach((el) => el.classList.add('active'));

  const page = PAGES[pageId];
  document.getElementById('page-title')!.textContent = page.title;
  document.getElementById('page-sub')!.textContent = page.sub;
  document.getElementById('content')!.innerHTML = '';
  page.render();
}
