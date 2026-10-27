import { startTest, submitTest, getTestResult } from '../services/tests.service.js';
import { toId } from '../utils/httpError.js';

// POST /api/tests/start
// body: { mode: "topic" | "exam", topicId?, count?, durationMinutes? }
export async function start(req, res) {
  const { mode, topicId, count, durationMinutes } = req.body ?? {};
  const result = await startTest({
    mode,
    topicId,
    count,
    durationMinutes,
    userId: req.user?.id,
  });
  res.status(201).json(result);
}

// POST /api/tests/:id/submit
// body: { answers: [{ questionId, answerId }] }
export async function submit(req, res) {
  const id = toId(req.params.id);
  const result = await submitTest(id, req.body?.answers, req.user);
  res.json(result);
}

// GET /api/tests/:id
export async function getResult(req, res) {
  const id = toId(req.params.id);
  const result = await getTestResult(id, req.user);
  res.json(result);
}
