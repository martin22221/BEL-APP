import prisma from '../lib/prisma.js';
import { badRequest, notFoundError, conflict, HttpError } from '../utils/httpError.js';
import { pickRandomQuestions, toPublicQuestion, MAX_QUESTIONS } from './questions.service.js';
import { gradeAnswers, summarizeByTopic, percent } from './scoring.js';

const DEFAULTS = {
  TOPIC: { count: 10 },
  EXAM: { count: 20, durationMinutes: 60 },
};

const attemptInclude = {
  topic: { select: { id: true, name: true } },
  answers: {
    orderBy: { position: 'asc' },
    include: {
      question: {
        include: {
          topic: { select: { id: true, name: true } },
          answers: { orderBy: { id: 'asc' } },
        },
      },
    },
  },
};

export async function startTest({ mode, topicId, count, durationMinutes, userId }) {
  const testMode = String(mode || '').toUpperCase();
  if (!DEFAULTS[testMode]) {
    throw badRequest('Полето mode трябва да е "topic" или "exam"');
  }

  const questionCount = count ?? DEFAULTS[testMode].count;
  if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > MAX_QUESTIONS) {
    throw badRequest(`Броят въпроси трябва да е между 1 и ${MAX_QUESTIONS}`);
  }

  let topic = null;
  if (testMode === 'TOPIC') {
    if (!Number.isInteger(topicId)) throw badRequest('За тест по тема е нужно topicId');
    topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) throw notFoundError('Темата не е намерена');
  }

  let expiresAt = null;
  if (testMode === 'EXAM') {
    const minutes = durationMinutes ?? DEFAULTS.EXAM.durationMinutes;
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 240) {
      throw badRequest('Времето трябва да е между 1 и 240 минути');
    }
    expiresAt = new Date(Date.now() + minutes * 60 * 1000);
  }

  const questions = await pickRandomQuestions({ topicId: topic?.id, count: questionCount });
  if (questions.length === 0) {
    throw notFoundError('Няма въпроси за този тест');
  }

  const attempt = await prisma.testAttempt.create({
    data: {
      mode: testMode,
      topicId: topic?.id ?? null,
      userId: userId ?? null,
      expiresAt,
      total: questions.length,
      answers: {
        create: questions.map((q, index) => ({ questionId: q.id, position: index + 1 })),
      },
    },
  });

  return {
    attemptId: attempt.id,
    mode: attempt.mode,
    topic: topic ? { id: topic.id, name: topic.name } : null,
    total: attempt.total,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
    questions: questions.map(toPublicQuestion),
  };
}

async function loadAttempt(attemptId, user) {
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    include: attemptInclude,
  });
  if (!attempt) throw notFoundError('Тестът не е намерен');

  // Когато има автентикация (#11), само собственикът вижда своя тест
  if (attempt.userId !== null && attempt.userId !== user?.id) {
    throw new HttpError(403, 'Нямате достъп до този тест');
  }
  return attempt;
}

function parseSubmittedAnswers(answers, attempt) {
  if (!Array.isArray(answers)) {
    throw badRequest('Полето answers трябва да е масив от { questionId, answerId }');
  }

  const questionsById = new Map(attempt.answers.map((a) => [a.questionId, a.question]));
  const selected = new Map();

  for (const item of answers) {
    const questionId = item?.questionId;
    const answerId = item?.answerId ?? null;
    const question = questionsById.get(questionId);

    if (!question) throw badRequest(`Въпрос ${questionId} не е част от този тест`);
    if (selected.has(questionId)) throw badRequest(`Въпрос ${questionId} е изпратен два пъти`);
    if (answerId !== null && !question.answers.some((a) => a.id === answerId)) {
      throw badRequest(`Отговор ${answerId} не принадлежи на въпрос ${questionId}`);
    }
    selected.set(questionId, answerId);
  }
  return selected;
}

export async function submitTest(attemptId, answers, user) {
  const attempt = await loadAttempt(attemptId, user);
  if (attempt.submittedAt) throw conflict('Тестът вече е предаден');

  const selected = parseSubmittedAnswers(answers, attempt);
  const questions = attempt.answers.map((a) => a.question);
  const graded = gradeAnswers(questions, selected);

  await prisma.$transaction([
    ...graded.items.map((item) =>
      prisma.attemptAnswer.update({
        where: { attemptId_questionId: { attemptId, questionId: item.questionId } },
        data: { answerId: item.answerId, isCorrect: item.isCorrect },
      }),
    ),
    prisma.testAttempt.update({
      where: { id: attemptId },
      data: { submittedAt: new Date(), score: graded.score },
    }),
  ]);

  return getTestResult(attemptId, user);
}

export async function getTestResult(attemptId, user) {
  const attempt = await loadAttempt(attemptId, user);

  const base = {
    attemptId: attempt.id,
    mode: attempt.mode,
    topic: attempt.topic,
    total: attempt.total,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
  };

  // Тестът още тече: връщаме въпросите без верните отговори (напр. след презареждане)
  if (!attempt.submittedAt) {
    return {
      ...base,
      status: 'IN_PROGRESS',
      questions: attempt.answers.map((a) => toPublicQuestion(a.question)),
    };
  }

  const items = attempt.answers.map((a) => ({
    id: a.question.id,
    position: a.position,
    text: a.question.text,
    topic: a.question.topic,
    explanation: a.question.explanation,
    answers: a.question.answers.map((ans) => ({
      id: ans.id,
      text: ans.text,
      isCorrect: ans.isCorrect,
    })),
    selectedAnswerId: a.answerId,
    isCorrect: a.isCorrect === true,
  }));

  return {
    ...base,
    status: 'SUBMITTED',
    submittedAt: attempt.submittedAt,
    score: attempt.score,
    percent: percent(attempt.score, attempt.total),
    byTopic: summarizeByTopic(items),
    questions: items,
  };
}
