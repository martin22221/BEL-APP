// Зарежда началните теми и въпроси от prisma/data/*.json
// Пуска се с: npm run db:seed
// Безопасно е да се пуска многократно: съществуващите въпроси не се дублират.
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import prisma from '../src/lib/prisma.js';

const readJson = async (file) =>
  JSON.parse(await readFile(new URL(`./data/${file}`, import.meta.url), 'utf8'));

async function main() {
  const topics = await readJson('topics.json');
  const questions = await readJson('questions.json');

  const topicIds = {};
  for (const t of topics) {
    const topic = await prisma.topic.upsert({
      where: { slug: t.slug },
      update: { name: t.name, category: t.category, description: t.description },
      create: t,
    });
    topicIds[t.slug] = topic.id;
  }

  let added = 0;
  for (const q of questions) {
    const topicId = topicIds[q.topic];
    if (!topicId) throw new Error(`Непозната тема "${q.topic}" във въпрос: ${q.text}`);
    if (q.correct < 0 || q.correct >= q.answers.length) {
      throw new Error(`Невалиден индекс на верния отговор във въпрос: ${q.text}`);
    }

    const exists = await prisma.question.findFirst({ where: { topicId, text: q.text } });
    if (exists) continue;

    await prisma.question.create({
      data: {
        topicId,
        text: q.text,
        explanation: q.explanation,
        difficulty: q.difficulty ?? 1,
        answers: {
          create: q.answers.map((text, i) => ({ text, isCorrect: i === q.correct })),
        },
      },
    });
    added++;
  }

  console.log(`Теми: ${topics.length}. Добавени въпроси: ${added} (общо във файла: ${questions.length}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
