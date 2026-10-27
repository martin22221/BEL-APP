import prisma from '../lib/prisma.js';
import { notFoundError, toId } from '../utils/httpError.js';

function withCount(topic) {
  const { _count, ...rest } = topic;
  return { ...rest, questionCount: _count.questions };
}

// GET /api/topics
export async function listTopics(req, res) {
  const topics = await prisma.topic.findMany({
    orderBy: [{ category: 'asc' }, { id: 'asc' }],
    include: { _count: { select: { questions: true } } },
  });
  res.json(topics.map(withCount));
}

// GET /api/topics/:id
export async function getTopic(req, res) {
  const id = toId(req.params.id);
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: { _count: { select: { questions: true } } },
  });
  if (!topic) throw notFoundError('Темата не е намерена');
  res.json(withCount(topic));
}
