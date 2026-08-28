// Cliente HTTP mínimo: incluye siempre la cookie de sesión (credentials:
// 'include'), y traduce errores del backend en excepciones con mensaje
// listo para mostrar al usuario (SECURITY-09: mensajes genéricos).

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // FormData: dejamos que el navegador ponga su propio Content-Type con el
  // boundary del multipart — si lo fijamos nosotros a mano, el servidor no
  // puede parsear el body.
  const esFormData = options.body instanceof FormData;
  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: 'include',
    headers: esFormData ? options.headers : { 'Content-Type': 'application/json', ...options.headers },
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? 'Ocurrió un error inesperado.');
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, form: FormData) => request<T>(path, { method: 'POST', body: form }),
};

export function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-CL');
}

// SECURITY-05: nunca insertar texto de usuario sin escapar en el DOM.
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
