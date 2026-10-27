import prisma from '../lib/prisma.js';
import { shuffle } from '../utils/shuffle.js';

export const MAX_QUESTIONS = 50;

// Връща въпрос без информация кой отговор е верен (за ученика по време на теста)
export function toPublicQuestion(question) {
  return {
    id: question.id,
    topicId: question.topicId,
    text: question.text,
    difficulty: question.difficulty,
    answers: shuffle(question.answers).map((a) => ({ id: a.id, text: a.text })),
  };
}

// Избира произволни въпроси. Ако topicId липсва, взема от всички теми.
export async function pickRandomQuestions({ topicId, count }) {
  const where = topicId ? { topicId } : {};
  const ids = await prisma.question.findMany({ where, select: { id: true } });
  const chosenIds = shuffle(ids.map((q) => q.id)).slice(0, count);

  const questions = await prisma.question.findMany({
    where: { id: { in: chosenIds } },
    include: { answers: { orderBy: { id: 'asc' } } },
  });

  // findMany не пази реда от "in", затова го възстановяваме
  const byId = new Map(questions.map((q) => [q.id, q]));
  return chosenIds.map((id) => byId.get(id));
}
