import { OAuth2Client } from 'google-auth-library';
import { AppError } from '../middleware/errorHandler';
import { generarTokenSesion, nuevaExpiracion } from '../lib/session';
import { identidadRepository } from './identidad.repository';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const identidadService = {
  // BR-01: el googleSub (claim `sub` del ID Token) es la clave real de
  // unicidad, no el correo — evita que alguien "recupere" el acceso a una
  // cuenta ajena registrando el mismo correo en una cuenta de Google nueva.
  async iniciarSesionConGoogle(googleIdToken: string) {
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: googleIdToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      // BR-04/SECURITY-09: mensaje genérico, sin exponer la causa técnica
      throw new AppError(401, 'No pudimos verificar tu cuenta de Google. Intenta de nuevo.');
    }
    if (!payload?.sub) {
      throw new AppError(401, 'No pudimos verificar tu cuenta de Google. Intenta de nuevo.');
    }

    let usuario = await identidadRepository.buscarPorGoogleSub(payload.sub);
    if (!usuario) {
      usuario = await identidadRepository.crear({
        googleSub: payload.sub,
        correo: payload.email ?? '',
        nombre: payload.name ?? payload.email ?? 'Usuario',
        fotoUrl: payload.picture,
      });
    } else {
      usuario = await identidadRepository.actualizarUltimoLogin(usuario.id);
    }

    const { token, hash } = generarTokenSesion();
    await identidadRepository.crearSesion(usuario.id, hash, nuevaExpiracion());

    return { usuario, token };
  },

  async cerrarSesion(tokenHash: string): Promise<void> {
    await identidadRepository.invalidarSesion(tokenHash);
  },

  async obtenerPerfil(usuarioId: string) {
    const usuario = await identidadRepository.buscarPorId(usuarioId);
    if (!usuario) throw new AppError(404, 'Usuario no encontrado.');
    return usuario;
  },
};
