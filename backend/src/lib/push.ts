// Cliente mínimo de notificaciones push (Web Push / VAPID). Las claves se
// autogeneran (no dependen de ninguna cuenta externa, a diferencia de
// Google OAuth o Gemini) — si no están configuradas, pushDisponible()
// devuelve false y el resto de la app debe seguir funcionando sin push
// (la suscripción del navegador simplemente no se ofrece).
import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

export function pushDisponible(): boolean {
  return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:soporte@familyfinance.app', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export function vapidPublicKey(): string | null {
  return VAPID_PUBLIC_KEY ?? null;
}

export interface SuscripcionPush {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Envía la notificación a cada suscripción y devuelve los endpoints que ya
// no son válidos (410/404 — el navegador las revocó), para que el llamador
// los borre de la base de datos.
export async function enviarNotificacion(
  subs: SuscripcionPush[],
  payload: { title: string; body: string; url?: string },
): Promise<string[]> {
  if (!pushDisponible() || subs.length === 0) return [];
  const invalidas: string[] = [];
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) invalidas.push(s.endpoint);
      }
    }),
  );
  return invalidas;
}
