import { Router } from 'express';
import { crearContacto } from '../controllers/contacto.controllers.js';
import { contactSchema } from '../validators/contact.validator.js';

const router = Router();

router.post('/contact', (req, res, next) => {
  const result = contactSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }
  next();
}, crearContacto);

export default router;