import { Router } from 'express';
import { generateTest, getRecommendation } from '../../controllers/preferences/preferencesController.js';

const router = Router();

router.post('/generate-test', generateTest);
router.post('/recommendation', getRecommendation);

export default router;
