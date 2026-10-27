import { Router } from 'express';
import { listTopics, getTopic } from '../controllers/topics.controller.js';

const router = Router();

router.get('/', listTopics);
router.get('/:id', getTopic);

export default router;
