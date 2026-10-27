// Интеграционни тестове: изискват пусната база с изпълнен seed (npm run db:seed).
import 'dotenv/config';
import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/lib/prisma.js';

describe.skipIf(!process.env.DATABASE_URL)('API', () => {
  afterAll(() => prisma.$disconnect());

  it('GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/topics връща темите с брой въпроси', async () => {
    const res = await request(app).get('/api/topics');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('questionCount');
  });

  it('GET /api/questions не издава верния отговор', async () => {
    const res = await request(app).get('/api/questions?count=5');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(5);
    expect(JSON.stringify(res.body)).not.toContain('isCorrect');
  });

  it('тест по тема: старт, предаване и резултат', async () => {
    const topics = await request(app).get('/api/topics');
    const topicId = topics.body[0].id;

    const start = await request(app)
      .post('/api/tests/start')
      .send({ mode: 'topic', topicId, count: 3 });
    expect(start.status).toBe(201);
    expect(start.body.questions.length).toBeGreaterThan(0);

    const answers = start.body.questions.map((q) => ({
      questionId: q.id,
      answerId: q.answers[0].id,
    }));
    const submit = await request(app)
      .post(`/api/tests/${start.body.attemptId}/submit`)
      .send({ answers });

    expect(submit.status).toBe(200);
    expect(submit.body.status).toBe('SUBMITTED');
    expect(submit.body.total).toBe(start.body.questions.length);
    expect(submit.body.questions[0]).toHaveProperty('explanation');

    const again = await request(app)
      .post(`/api/tests/${start.body.attemptId}/submit`)
      .send({ answers });
    expect(again.status).toBe(409);
  });

  it('пробна матура има краен срок', async () => {
    const res = await request(app)
      .post('/api/tests/start')
      .send({ mode: 'exam', count: 5, durationMinutes: 30 });
    expect(res.status).toBe(201);
    expect(res.body.mode).toBe('EXAM');
    expect(res.body.expiresAt).not.toBeNull();
  });

  it('връща 400 при невалиден режим', async () => {
    const res = await request(app).post('/api/tests/start').send({ mode: 'abc' });
    expect(res.status).toBe(400);
  });
});
