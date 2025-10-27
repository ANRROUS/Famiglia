import { Router } from 'express';
import { 
  generateTest, 
  getRecommendation, 
  getRecommendationHistory 
} from '../../controllers/preferences/preferencesController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = Router();

// Rutas públicas (no requieren autenticación)
router.post('/generate-test', generateTest);

// Rutas protegidas (requieren autenticación)
router.post('/recommendation', verifyToken, getRecommendation);
router.get('/history', verifyToken, getRecommendationHistory);

export default router;
