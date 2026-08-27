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
  // resuelto por el middleware), lógica local basada en reglas, sin
  // llamadas a servicios de IA externos.
  async consultarAsistente(grupoFamiliarId: string, pregunta: string): Promise<string> {
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
      const porAgotarse = alacena.filter((p) => p.porAgotarse);
      return porAgotarse.length
        ? `Tienes ${porAgotarse.length} producto(s) por agotarse: ${porAgotarse.map((p) => p.nombre).join(', ')}.`
        : `Tu alacena está en buen estado, ${alacena.length} productos registrados.`;
    }
    return 'Puedo ayudarte con tus gastos, tu presupuesto, tus recetas, tu alacena y tus oportunidades de ahorro. Pregúntame algo más específico.';
  },
};
