import { describe, it, expect } from 'vitest';
import { gradeAnswers, summarizeByTopic, percent } from '../src/services/scoring.js';

const questions = [
  { id: 1, answers: [{ id: 10, isCorrect: true }, { id: 11, isCorrect: false }] },
  { id: 2, answers: [{ id: 20, isCorrect: false }, { id: 21, isCorrect: true }] },
  { id: 3, answers: [{ id: 30, isCorrect: true }, { id: 31, isCorrect: false }] },
];

describe('percent', () => {
  it('закръгля до цяло число', () => {
    expect(percent(1, 3)).toBe(33);
    expect(percent(2, 3)).toBe(67);
  });
  it('връща 0 при 0 въпроса', () => {
    expect(percent(0, 0)).toBe(0);
  });
});

describe('gradeAnswers', () => {
  it('брои верните, грешните и пропуснатите отговори', () => {
    const selected = new Map([
      [1, 10], // верен
      [2, 20], // грешен
      // 3 е без отговор
    ]);
    const result = gradeAnswers(questions, selected);

    expect(result.score).toBe(1);
    expect(result.total).toBe(3);
    expect(result.percent).toBe(33);
    expect(result.items).toEqual([
      { questionId: 1, answerId: 10, correctAnswerId: 10, isCorrect: true },
      { questionId: 2, answerId: 20, correctAnswerId: 21, isCorrect: false },
      { questionId: 3, answerId: null, correctAnswerId: 30, isCorrect: false },
    ]);
  });
});

describe('summarizeByTopic', () => {
  it('групира по тема и подрежда от най-слабата', () => {
    const pravopis = { id: 1, name: 'Правопис' };
    const leksika = { id: 2, name: 'Лексика' };
    const result = summarizeByTopic([
      { topic: pravopis, isCorrect: true },
      { topic: pravopis, isCorrect: true },
      { topic: leksika, isCorrect: false },
      { topic: leksika, isCorrect: true },
    ]);

    expect(result).toEqual([
      { topicId: 2, name: 'Лексика', correct: 1, total: 2, percent: 50 },
      { topicId: 1, name: 'Правопис', correct: 2, total: 2, percent: 100 },
    ]);
  });
});
