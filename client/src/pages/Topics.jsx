import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../api/client.js';

// Работещ пример как страница взема данни от бекенда.
// Стилът и изгледът ще се оформят по wireframes (#4).
export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getTopics().then(setTopics).catch((e) => setError(e.message));
  }, []);

  async function startTest(topicId) {
    try {
      const test = await api.startTopicTest(topicId);
      navigate(`/test/${test.attemptId}`);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h1>Теми</h1>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <ul>
        {topics.map((t) => (
          <li key={t.id}>
            {t.name} ({t.questionCount} въпроса){' '}
            <button onClick={() => startTest(t.id)} disabled={t.questionCount === 0}>
              Започни тест
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
