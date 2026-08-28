// Cliente mínimo para la API gratuita de Google Gemini (texto + visión).
// Se llama directo por REST (fetch nativo de Node) en vez de traer el SDK
// completo, para mantener la dependencia liviana.
//
// Si GEMINI_API_KEY no está configurada, geminiDisponible() devuelve false
// y el resto de la app debe usar su propio fallback local — el asistente y
// el escaneo de boletas deben seguir siendo utilizables (en modo degradado)
// sin esta integración.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export function geminiDisponible(): boolean {
  return Boolean(GEMINI_API_KEY);
}

interface Parte {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

async function generar(parts: Parte[], responseSchema?: object): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY no configurada.');

  const body: Record<string, unknown> = { contents: [{ parts }] };
  if (responseSchema) {
    body.generationConfig = { responseMimeType: 'application/json', responseSchema };
  }

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Gemini respondió ${res.status}`);

  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!texto) throw new Error('Gemini no devolvió contenido.');
  return texto;
}

// Responde una pregunta en lenguaje natural usando como "grounding" un
// resumen de los datos reales del grupo (evita que el modelo invente cifras).
export async function responderConsulta(pregunta: string, contexto: string): Promise<string> {
  const prompt = `Eres el asistente financiero de la app FamilyFinance. Responde en español, en máximo 3 frases, de forma cercana, y basándote ÚNICAMENTE en los datos reales del grupo listados abajo. Si la pregunta no se puede responder con estos datos, dilo y sugiere en qué sección de la app revisarlo.

Datos reales del grupo:
${contexto}

Pregunta del usuario: ${pregunta}`;
  const texto = await generar([{ text: prompt }]);
  return texto.trim();
}

export interface BoletaExtraida {
  monto: number;
  comercio: string;
  categoriaSugerida: string;
}

// Extrae los datos de una boleta/recibo fotografiado usando salida
// estructurada (JSON Schema), para no depender de parsear texto libre.
export async function interpretarBoleta(
  imagenBase64: string,
  mimeType: string,
  categoriasValidas: string[],
): Promise<BoletaExtraida> {
  const schema = {
    type: 'OBJECT',
    properties: {
      monto: { type: 'NUMBER', description: 'Monto total pagado en la boleta, sin símbolo de moneda.' },
      comercio: { type: 'STRING', description: 'Nombre del comercio o lugar donde se hizo la compra.' },
      categoriaSugerida: { type: 'STRING', enum: categoriasValidas },
    },
    required: ['monto', 'comercio', 'categoriaSugerida'],
  };
  const prompt =
    'Analiza esta boleta o recibo de compra y extrae el monto total, el nombre del comercio y la categoría de gasto que mejor corresponde de la lista permitida.';
  const texto = await generar([{ text: prompt }, { inlineData: { mimeType, data: imagenBase64 } }], schema);

  const parsed = JSON.parse(texto) as BoletaExtraida;
  if (!(parsed.monto > 0)) throw new Error('No se pudo leer un monto válido en la boleta.');
  return parsed;
}
