# API документация

Базов адрес: `http://localhost:4000/api`. Всички отговори са JSON. При грешка: `{ "error": "съобщение" }`.

| Метод | Път | Описание | Issue |
|---|---|---|---|
| GET | `/health` | Проверка дали сървърът работи | #7 |
| GET | `/topics` | Списък с теми | #8 |
| GET | `/topics/:id` | Една тема | #8 |
| GET | `/questions?topic=&count=` | Произволни въпроси | #8 |
| POST | `/tests/start` | Започване на тест | #9 |
| POST | `/tests/:id/submit` | Предаване на тест | #9 |
| GET | `/tests/:id` | Тест в ход или резултат | #9 |
| POST | `/auth/register` | Регистрация (още връща 501) | #11 |
| POST | `/auth/login` | Вход (още връща 501) | #11 |

---

## GET /topics

```json
[
  {
    "id": 1,
    "name": "Правопис",
    "slug": "pravopis",
    "category": "LANGUAGE",
    "description": "Правописни правила, членуване, слято и разделно писане",
    "questionCount": 4
  }
]
```

`category` е `LANGUAGE` (език) или `LITERATURE` (литература). `GET /topics/:id` връща един такъв обект или 404.

## GET /questions

Параметри: `topic` (id на тема, по желание), `count` (1-50, по подразбиране 10).
Верните отговори **не** се връщат. Отговорите са в разбъркан ред.

```json
[
  {
    "id": 18,
    "topicId": 5,
    "text": "Кое произведение е на Никола Вапцаров?",
    "difficulty": 1,
    "answers": [
      { "id": 71, "text": "„Ветрената мелница“" },
      { "id": 69, "text": "„Писмо“" }
    ]
  }
]
```

## POST /tests/start

Тест по тема:

```json
{ "mode": "topic", "topicId": 2, "count": 10 }
```

Пробна матура (въпроси от всички теми, с краен срок):

```json
{ "mode": "exam", "count": 20, "durationMinutes": 60 }
```

| Поле | Задължително | По подразбиране | Граници |
|---|---|---|---|
| `mode` | да | | `topic` или `exam` |
| `topicId` | при `topic` | | |
| `count` | не | 10 (topic), 20 (exam) | 1-50 |
| `durationMinutes` | не | 60 | 1-240, само за exam |

Отговор `201`:

```json
{
  "attemptId": 1,
  "mode": "TOPIC",
  "topic": { "id": 2, "name": "Пунктуация" },
  "total": 3,
  "startedAt": "2026-10-27T07:10:38.130Z",
  "expiresAt": null,
  "questions": [ { "id": 6, "topicId": 2, "text": "...", "difficulty": 1, "answers": [ { "id": 21, "text": "..." } ] } ]
}
```

При `exam` полето `expiresAt` показва кога изтича времето. Таймерът на фронтенда (#6) се смята от него.

## POST /tests/:id/submit

```json
{
  "answers": [
    { "questionId": 6, "answerId": 21 },
    { "questionId": 7, "answerId": null }
  ]
}
```

Въпроси, които липсват в масива или са с `answerId: null`, се броят за грешни.

Грешки: `400` (въпрос не е от теста, отговор не е от въпроса, повторен въпрос), `404` (няма такъв тест), `409` (тестът вече е предаден).

Отговор `200`:

```json
{
  "attemptId": 1,
  "mode": "TOPIC",
  "topic": { "id": 2, "name": "Пунктуация" },
  "status": "SUBMITTED",
  "total": 3,
  "score": 1,
  "percent": 33,
  "startedAt": "...",
  "submittedAt": "...",
  "expiresAt": null,
  "byTopic": [
    { "topicId": 2, "name": "Пунктуация", "correct": 1, "total": 3, "percent": 33 }
  ],
  "questions": [
    {
      "id": 6,
      "position": 1,
      "text": "Кое изречение е оформено правилно?",
      "topic": { "id": 2, "name": "Пунктуация" },
      "explanation": "Обръщението „Мамо“ се отделя със запетая...",
      "answers": [ { "id": 21, "text": "Мамо, ела тук!", "isCorrect": true } ],
      "selectedAnswerId": 21,
      "isCorrect": true
    }
  ]
}
```

`byTopic` е подреден от най-слабата към най-силната тема.

## GET /tests/:id

- Ако тестът още не е предаден: `status: "IN_PROGRESS"` и въпросите без верните отговори (за продължаване след презареждане на страницата).
- Ако е предаден: същият отговор като при `submit`.
