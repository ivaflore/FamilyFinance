export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  fotoUrl: string | null;
}

export interface GrupoResumen {
  id: string;
  nombre: string;
  rol: 'Administrador' | 'Miembro';
}

export const state: {
  usuario: Usuario | null;
  grupos: GrupoResumen[];
  grupoActivoId: string | null;
} = {
  usuario: null,
  grupos: [],
  grupoActivoId: null,
};

export function grupoActivo(): GrupoResumen | null {
  return state.grupos.find((g) => g.id === state.grupoActivoId) ?? null;
}
