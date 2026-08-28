import { geminiDisponible, responderConsulta } from '../lib/gemini';
import { financieroService } from '../nucleo-financiero/financiero.service';
import { hogarService } from '../hogar/hogar.service';
import { calcularResumenSegmentacion } from './insights.logic';
import { insightsRepository } from './insights.repository';

export const insightsService = {
  listarSegmentacion(grupoFamiliarId: string) {
    return insightsRepository.listarProductosSegmentados(grupoFamiliarId);
  },

  async clasificarProducto(grupoFamiliarId: string, id: string, segmento: string): Promise<void> {
    await insightsRepository.actualizarSegmento(id, grupoFamiliarId, segmento);
  },

  async resumenSegmentacion(grupoFamiliarId: string) {
    const productos = await insightsRepository.listarProductosSegmentados(grupoFamiliarId);
    return calcularResumenSegmentacion(
      productos.map((p) => ({
        precioUnitario: Number(p.precioUnitario),
        cantidad: p.cantidad,
        segmento: p.segmento as 'cat1' | 'cat2' | 'saving',
      })),
    );
  },

  // BR-21/BR-22: solo lee datos del propio grupo (grupoFamiliarId ya
  // resuelto por el middleware). Si hay una integración de IA configurada
  // (GEMINI_API_KEY), se usa para responder en lenguaje natural con el
  // contexto real del grupo como grounding; si no está configurada o la
  // llamada falla, se degrada a la lógica local basada en reglas de abajo,
  // que siempre está disponible sin depender de un servicio externo.
  async consultarAsistente(grupoFamiliarId: string, pregunta: string): Promise<string> {
    if (geminiDisponible()) {
      try {
        const contexto = await this.construirContexto(grupoFamiliarId);
        return await responderConsulta(pregunta, contexto);
      } catch {
        // degrada silenciosamente a la respuesta local
      }
    }
    return this.respuestaLocal(grupoFamiliarId, pregunta);
  },

  async construirContexto(grupoFamiliarId: string): Promise<string> {
    const [estado, alacena, recetas, resumen] = await Promise.all([
      financieroService.estadoPresupuesto(grupoFamiliarId),
      hogarService.listarAlacena(grupoFamiliarId),
      hogarService.listarRecetas(grupoFamiliarId),
      this.resumenSegmentacion(grupoFamiliarId),
    ]);
    const totalGastado = estado.reduce((a, e) => a + e.gastado, 0);
    const porAgotarse = alacena.filter((p) => p.faltante > 0);
    return [
      `Gasto total del mes: $${Math.round(totalGastado)}.`,
      `Presupuesto por categoría (gastado/asignado): ${
        estado.map((e) => `${e.categoria} ($${Math.round(e.gastado)}/$${Math.round(e.montoAsignado)})`).join(', ') || 'sin definir'
      }.`,
      `Productos de la alacena por debajo de su cantidad ideal: ${porAgotarse.map((p) => p.nombre).join(', ') || 'ninguno'}.`,
      `Recetas guardadas en el recetario: ${recetas.length}.`,
      `Oportunidad de ahorro estimada en productos prescindibles: $${Math.round(resumen.saving)}/mes.`,
    ].join('\n');
  },

  async respuestaLocal(grupoFamiliarId: string, pregunta: string): Promise<string> {
    const q = pregunta.toLowerCase();

    if (/receta|cocinar|men[uú]/.test(q)) {
      const recetas = await hogarService.listarRecetas(grupoFamiliarId);
      const picks = recetas.slice(0, 3);
      return picks.length
        ? `Con lo que tienes en tu recetario te recomiendo: ${picks.map((r) => r.nombre).join(', ')}.`
        : 'Todavía no tienes recetas guardadas — agrega algunas en el Recetario.';
    }
    if (/ahorr/.test(q)) {
      const resumen = await this.resumenSegmentacion(grupoFamiliarId);
      return `Tienes $${Math.round(resumen.saving).toLocaleString('es-CL')}/mes en productos prescindibles según tu segmentación. Revisa "Segmentación" para el detalle.`;
    }
    if (/gast|presupuesto|analiz/.test(q)) {
      const estado = await financieroService.estadoPresupuesto(grupoFamiliarId);
      const total = estado.reduce((a, e) => a + e.gastado, 0);
      return `Este mes tu grupo lleva gastado $${Math.round(total).toLocaleString('es-CL')} en total. Revisa "Presupuesto" para el detalle por categoría.`;
    }
    if (/alacena|stock/.test(q)) {
      const alacena = await hogarService.listarAlacena(grupoFamiliarId);
      const porAgotarse = alacena.filter((p) => p.faltante > 0);
      return porAgotarse.length
        ? `Tienes ${porAgotarse.length} producto(s) por agotarse: ${porAgotarse.map((p) => p.nombre).join(', ')}.`
        : `Tu alacena está en buen estado, ${alacena.length} productos registrados.`;
    }
    return 'Puedo ayudarte con tus gastos, tu presupuesto, tus recetas, tu alacena y tus oportunidades de ahorro. Pregúntame algo más específico.';
  },
};
