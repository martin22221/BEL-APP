# ER диаграма на базата (issue #10)

Схемата е в `server/prisma/schema.prisma`. Диаграмата се показва директно в GitHub.

```mermaid
erDiagram
    users ||--o{ test_attempts : "прави"
    topics ||--o{ questions : "съдържа"
    topics ||--o{ test_attempts : "тест по тема"
    questions ||--|{ answers : "има"
    test_attempts ||--|{ attempt_answers : "съдържа"
    questions ||--o{ attempt_answers : "в тест"
    answers ||--o{ attempt_answers : "избран"

    users {
        int id PK
        string name
        string email UK
        string passwordHash
        enum role "STUDENT | TEACHER | ADMIN"
        datetime createdAt
    }
    topics {
        int id PK
        string name
        string slug UK
        enum category "LANGUAGE | LITERATURE"
        string description
    }
    questions {
        int id PK
        int topicId FK
        string text
        string explanation
        int difficulty "1-3"
        datetime createdAt
        datetime updatedAt
    }
    answers {
        int id PK
        int questionId FK
        string text
        boolean isCorrect
    }
    test_attempts {
        int id PK
        int userId FK "null до #11"
        int topicId FK "само при TOPIC"
        enum mode "TOPIC | EXAM"
        datetime startedAt
        datetime expiresAt "само при EXAM"
        datetime submittedAt
        int score
        int total
    }
    attempt_answers {
        int id PK
        int attemptId FK
        int questionId FK
        int answerId FK "null = без отговор"
        boolean isCorrect
        int position
    }
```

## Защо е така

- **attempt_answers** пази по един ред за всеки въпрос в теста. Редовете се създават при старт (без отговор) и се попълват при предаване. Така знаем кои въпроси са били в теста, дори ученикът да не е отговорил на всички.
- **isCorrect в attempt_answers** се записва при предаване. Статистиката по теми (#3) се смята с прости заявки, без да се преизчислява всеки тест.
- **userId е незадължително**, докато автентикацията (#11) не е готова. След това трябва да стане задължително.
- При изтриване на въпрос се изтриват и отговорите му (`onDelete: Cascade`).
