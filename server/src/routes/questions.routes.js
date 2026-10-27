import { Router } from 'express';
import { getRandomQuestions } from '../controllers/questions.controller.js';

const router = Router();

router.get('/', getRandomQuestions);

export default router;
