// Чисти функции за оценяване. Нямат връзка с базата, затова лесно се тестват.

export function percent(correct, total) {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

// questions: [{ id, answers: [{ id, isCorrect }] }]
// selected:  Map<questionId, answerId | null>
export function gradeAnswers(questions, selected) {
  const items = questions.map((question) => {
    const correct = question.answers.find((a) => a.isCorrect);
    const answerId = selected.get(question.id) ?? null;
    return {
      questionId: question.id,
      answerId,
      correctAnswerId: correct ? correct.id : null,
      isCorrect: answerId !== null && correct !== undefined && answerId === correct.id,
    };
  });

  const score = items.filter((i) => i.isCorrect).length;
  return { items, score, total: items.length, percent: percent(score, items.length) };
}

// items: [{ isCorrect, topic: { id, name } }]
// Връща резултат по теми, подреден от най-слабата към най-силната.
export function summarizeByTopic(items) {
  const byTopic = new Map();
  for (const item of items) {
    const entry = byTopic.get(item.topic.id) ?? {
      topicId: item.topic.id,
      name: item.topic.name,
      correct: 0,
      total: 0,
    };
    entry.total += 1;
    if (item.isCorrect) entry.correct += 1;
    byTopic.set(item.topic.id, entry);
  }
  return [...byTopic.values()]
    .map((t) => ({ ...t, percent: percent(t.correct, t.total) }))
    .sort((a, b) => a.percent - b.percent || a.topicId - b.topicId);
}
