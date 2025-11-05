import axios from './axiosInstance.js';

export const enviarEventoAuditoria = async (evento, usuarioLogueado = false) => {
  try {
    const url= usuarioLogueado ? '/auditoria/me' : '/auditoria';
    await axios.post(url, evento, { withCredentials: true });
  } catch (e) {
    console.debug('Error enviando evento de auditoría:', e?.message || e);
  }
};

export default { enviarEventoAuditoria };