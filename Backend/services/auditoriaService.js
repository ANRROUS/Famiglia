import { connectDB } from '../mongoClient.js';
import { Auditoria } from '../model/auditoria_model.js';

let conectado = false;
const asegurarConexion = async () => {
  if (!conectado) {
    await connectDB();
    conectado = true;
  }
};

export const logAuditoria = async (payload = {}) => {
  try {
    await asegurarConexion();
    const {
      anonimoId = null,
      usuarioId = null,
      accion,
      recurso = null,
      recursoId = null,
      ruta = null,
      req = null,
      meta = {}
    } = payload;

    if (!accion) return;

    const documento = {
      usuarioId: usuarioId ? String(usuarioId) : (req?.user?.id_usuario || req?.user?.id) ? String(req.user.id_usuario || req.user.id) : null,
      anonimoId: anonimoId || req?.cookies?.anon_id || null,
      accion,
      recurso,
      recursoId: recursoId ? String(recursoId) : null,
      ruta: ruta || (req?.originalUrl || req?.url) || null,
      meta
    };

    await Auditoria.create(documento);
  } catch (err) {
    console.error('logAuditoria error:', err);
  }
};

export default { logAuditoria };