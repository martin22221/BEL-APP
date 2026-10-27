// Всички заявки към бекенда минават оттук.
// В режим на разработка Vite пренасочва /api към http://localhost:4000 (виж vite.config.js).

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token'); // ще се ползва след #11
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Грешка ${res.status}`);
  }
  return data;
}

export const api = {
  // Теми и въпроси (#8)
  getTopics: () => request('/topics'),
  getTopic: (id) => request(`/topics/${id}`),
  getQuestions: ({ topic, count } = {}) => {
    const params = new URLSearchParams();
    if (topic) params.set('topic', topic);
    if (count) params.set('count', count);
    return request(`/questions?${params}`);
  },

  // Тестове (#9)
  startTopicTest: (topicId, count = 10) =>
    request('/tests/start', { method: 'POST', body: JSON.stringify({ mode: 'topic', topicId, count }) }),
  startExam: (count = 20, durationMinutes = 60) =>
    request('/tests/start', { method: 'POST', body: JSON.stringify({ mode: 'exam', count, durationMinutes }) }),
  submitTest: (attemptId, answers) =>
    request(`/tests/${attemptId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),
  getTest: (attemptId) => request(`/tests/${attemptId}`),

  // Автентикация (#11), още не е готова на бекенда
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
};
