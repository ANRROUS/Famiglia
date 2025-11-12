import express from 'express';
import { logAuditoria } from '../../services/auditoriaService.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const auditoriaRouter = express.Router();

//sin autenticacion
auditoriaRouter.post('/', async (req, res) => {
  try {
    const { accion, recurso, recursoId, meta, ruta } = req.body;
    logAuditoria({
      accion,
      recurso,
      recursoId,
      ruta,
      req,
      meta
    });
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('POST /audits error', err);
    return res.status(500).json({ error: 'Error al registrar evento de auditoría' });
  }
});

//con autenticacion
auditoriaRouter.post('/me', verifyToken, async (req, res) => {
  try {
    const { accion, recurso, recursoId, meta, ruta } = req.body;
    logAuditoria({ 
      accion,
      recurso,
      recursoId,
      ruta,
      req,
      meta
    });
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('POST /audits/me error', err);
    return res.status(500).json({ error: 'Error al registrar evento' });
  }
});

export default auditoriaRouter;