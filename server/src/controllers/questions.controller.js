import { pickRandomQuestions, toPublicQuestion, MAX_QUESTIONS } from '../services/questions.service.js';
import { badRequest, toId } from '../utils/httpError.js';

// GET /api/questions?topic=1&count=10
// Връща произволни въпроси без верните отговори.
export async function getRandomQuestions(req, res) {
  const topicId = req.query.topic ? toId(req.query.topic, 'topic') : undefined;
  const count = req.query.count ? Number(req.query.count) : 10;

  if (!Number.isInteger(count) || count < 1 || count > MAX_QUESTIONS) {
    throw badRequest(`count трябва да е между 1 и ${MAX_QUESTIONS}`);
  }

  const questions = await pickRandomQuestions({ topicId, count });
  res.json(questions.map(toPublicQuestion));
}
