import { api, escapeHtml, fmt } from '../api';
import { grupoActivo } from '../state';

interface Miembro { usuarioId: string; nombre: string; fotoUrl: string | null; rol: 'Administrador' | 'Miembro' }
interface Aporte { usuarioId: string; nombre: string; monto: number; transacciones: number }

export async function renderFamilia() {
  const content = document.getElementById('content')!;
  const grupo = grupoActivo();
  const esAdmin = grupo?.rol === 'Administrador';

  content.innerHTML = `
    <div class="g2" style="margin-bottom:10px">
      <div class="metric"><div class="m-label">Código de familia</div><div class="m-val" style="font-size:16px">${escapeHtml(grupo?.nombre ?? '')}</div></div>
      <div class="metric"><div class="m-label">Tu rol</div><div class="m-val" style="font-size:16px">${grupo?.rol ?? ''}</div></div>
    </div>
    <div class="g2">
      <div class="card">
        <div class="card-hd">
          <div class="card-title">Miembros</div>
          ${esAdmin ? `<button class="btn btn-sm btn-primary" id="fam-invite"><i class="ti ti-plus"></i> Invitar</button>` : ''}
        </div>
        <div id="fam-miembros"></div>
        <div id="fam-invite-box"></div>
      </div>
      <div class="card">
        <div class="card-hd"><div class="card-title">Gastos por miembro</div></div>
        <div id="fam-aportes"></div>
      </div>
    </div>`;

  async function cargar() {
    const [miembros, aportes] = await Promise.all([
      api.get<Miembro[]>(`/groups/${grupo!.id}/members`),
      api.get<Aporte[]>(`/groups/${grupo!.id}/miembros/aportes`),
    ]);

    document.getElementById('fam-miembros')!.innerHTML = miembros
      .map(
        (m) => `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
          <div class="av">${escapeHtml(m.nombre.slice(0, 2).toUpperCase())}</div>
          <div style="flex:1"><div style="font-size:13px;font-weight:600">${escapeHtml(m.nombre)}</div><div style="font-size:10px;color:var(--text-3)">${m.rol}</div></div>
          ${esAdmin && m.rol !== 'Administrador' ? `<button class="btn btn-sm" data-remove="${m.usuarioId}">Remover</button>` : ''}
        </div>`,
      )
      .join('');

    document.getElementById('fam-miembros')!.querySelectorAll<HTMLElement>('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await api.del(`/groups/${grupo!.id}/members/${btn.dataset.remove}`);
          await cargar();
        } catch (err) {
          alert((err as Error).message);
        }
      });
    });

    const maxMonto = Math.max(...aportes.map((a) => a.monto), 1);
    document.getElementById('fam-aportes')!.innerHTML = aportes
      .map(
        (a) =>
          `<div class="bar-row"><div class="bar-lbl">${escapeHtml(a.nombre)}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round((a.monto / maxMonto) * 100)}%;background:var(--teal)"></div></div><div class="bar-val">${fmt(a.monto)}</div></div>`,
      )
      .join('') || `<div style="font-size:12px;color:var(--text-3)">Sin gastos registrados todavía.</div>`;
  }

  document.getElementById('fam-invite')?.addEventListener('click', async () => {
    const { tokenInvitacion } = await api.post<{ tokenInvitacion: string }>(`/groups/${grupo!.id}/invite`, {});
    const link = `${location.origin}/invite/${tokenInvitacion}`;
    document.getElementById('fam-invite-box')!.innerHTML = `
      <div class="invite-code-box">Comparte este link con la persona que quieres invitar (válido por 7 días):<br><strong>${escapeHtml(link)}</strong></div>`;
  });

  await cargar();
}
