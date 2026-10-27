import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { start, submit, getResult } from '../controllers/tests.controller.js';

const router = Router();

router.post('/start', optionalAuth, start);
router.post('/:id/submit', optionalAuth, submit);
router.get('/:id', optionalAuth, getResult);

export default router;
