import { Router } from 'express';
import topicsRoutes from './topics.routes.js';
import questionsRoutes from './questions.routes.js';
import testsRoutes from './tests.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

router.use('/topics', topicsRoutes);
router.use('/questions', questionsRoutes);
router.use('/tests', testsRoutes);
router.use('/auth', authRoutes);

export default router;
