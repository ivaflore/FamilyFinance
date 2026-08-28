import { api } from './api';

// Registra el service worker apenas carga la app (habilita instalar como
// PWA), sin pedir permisos todavía — eso queda para una acción explícita
// del usuario (activarNotificaciones), ya que los navegadores exigen un
// gesto del usuario para no ignorar el permiso de notificaciones.
export function registrarServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // sin service worker la app sigue funcionando igual, solo sin push/instalación
    });
  }
}

function base64UrlABuffer(base64Url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export async function estadoNotificaciones(): Promise<'no-soportado' | 'no-configurado' | 'denegado' | 'activo' | 'inactivo'> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'no-soportado';
  const { disponible } = await api.get<{ disponible: boolean; publicKey: string | null }>('/push/estado');
  if (!disponible) return 'no-configurado';
  if (Notification.permission === 'denied') return 'denegado';
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  return sub ? 'activo' : 'inactivo';
}

// Pide permiso y suscribe al navegador actual a las notificaciones push del
// grupo activo. Debe llamarse desde un click del usuario (requisito de los
// navegadores para el prompt de permiso).
export async function activarNotificaciones(): Promise<boolean> {
  const { disponible, publicKey } = await api.get<{ disponible: boolean; publicKey: string | null }>('/push/estado');
  if (!disponible || !publicKey) {
    alert('Las notificaciones no están configuradas en este servidor todavía.');
    return false;
  }
  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') return false;

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlABuffer(publicKey) as BufferSource,
  });
  const json = sub.toJSON();
  await api.post('/push/suscribir', { endpoint: json.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth });
  return true;
}

export async function desactivarNotificaciones(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  await api.post('/push/desuscribir', { endpoint: sub.endpoint });
  await sub.unsubscribe();
}
