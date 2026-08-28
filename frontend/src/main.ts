import './style.css';
import { api } from './api';
import { renderApp } from './app';
import { registrarServiceWorker } from './push';
import { state } from './state';

registrarServiceWorker();

declare global {
  interface Window {
    google: any;
  }
}

const root = document.getElementById('app')!;

async function bootstrap() {
  try {
    const data = await api.get<{ usuario: typeof state.usuario; grupos: typeof state.grupos }>('/me');
    state.usuario = data.usuario;
    state.grupos = data.grupos;
    state.grupoActivoId = data.grupos[0]?.id ?? null;
    if (state.grupoActivoId) {
      renderApp();
    } else {
      renderOnboarding();
    }
  } catch {
    renderLogin();
  }
}

function renderLogin() {
  root.innerHTML = `
    <div class="centered-screen">
      <div class="centered-card">
        <div class="sb-icon" style="width:48px;height:48px;font-size:22px;margin:0 auto 1rem"><i class="ti ti-home-heart"></i></div>
        <h1>FamilyFinance</h1>
        <p>Gestiona las finanzas de tu familia en un solo lugar. Inicia sesión con tu cuenta de Google para empezar.</p>
        <div id="google-signin-btn"></div>
        <div id="login-error" style="color:var(--coral);font-size:12px;margin-top:1rem"></div>
      </div>
    </div>`;

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) {
    document.getElementById('login-error')!.textContent =
      'Falta configurar VITE_GOOGLE_CLIENT_ID (ver README.md) para habilitar el login con Google.';
    return;
  }

  window.google?.accounts.id.initialize({
    client_id: clientId,
    callback: async (response: { credential: string }) => {
      try {
        const data = await api.post<{ usuario: typeof state.usuario }>('/auth/google', { idToken: response.credential });
        state.usuario = data.usuario;
        await bootstrap();
      } catch (err) {
        document.getElementById('login-error')!.textContent = (err as Error).message;
      }
    },
  });
  window.google?.accounts.id.renderButton(document.getElementById('google-signin-btn'), { theme: 'outline', size: 'large' });
}

function renderOnboarding() {
  root.innerHTML = `
    <div class="centered-screen">
      <div class="centered-card">
        <div class="sb-icon" style="width:48px;height:48px;font-size:22px;margin:0 auto 1rem"><i class="ti ti-users-group"></i></div>
        <h1>¡Hola, ${state.usuario?.nombre ?? ''}!</h1>
        <p>Todavía no perteneces a ningún grupo familiar. Crea uno nuevo o únete con un código de invitación.</p>
        <div class="onboarding-options">
          <div class="form-row" style="text-align:left">
            <label class="form-label">Crear un grupo nuevo</label>
            <input type="text" id="ob-nombre-grupo" placeholder="ej: Familia García" />
          </div>
          <button class="btn btn-primary" id="ob-crear">Crear grupo familiar</button>
          <div style="border-top:1px solid var(--border);margin:.75rem 0"></div>
          <div class="form-row" style="text-align:left">
            <label class="form-label">Unirme con código de invitación</label>
            <input type="text" id="ob-token" placeholder="Pega aquí el código o link" />
          </div>
          <button class="btn" id="ob-unirse">Unirme al grupo</button>
        </div>
        <div id="ob-error" style="color:var(--coral);font-size:12px;margin-top:1rem"></div>
      </div>
    </div>`;

  document.getElementById('ob-crear')!.addEventListener('click', async () => {
    const nombre = (document.getElementById('ob-nombre-grupo') as HTMLInputElement).value.trim();
    if (!nombre) return;
    try {
      await api.post('/groups', { nombre });
      await bootstrap();
    } catch (err) {
      document.getElementById('ob-error')!.textContent = (err as Error).message;
    }
  });

  document.getElementById('ob-unirse')!.addEventListener('click', async () => {
    const raw = (document.getElementById('ob-token') as HTMLInputElement).value.trim();
    const token = raw.includes('/') ? raw.split('/').pop()! : raw;
    if (!token) return;
    try {
      await api.post(`/invitations/${token}/accept`);
      await bootstrap();
    } catch (err) {
      document.getElementById('ob-error')!.textContent = (err as Error).message;
    }
  });
}

export { bootstrap };
bootstrap();
