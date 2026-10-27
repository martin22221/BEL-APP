import { Routes, Route } from 'react-router';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Topics from './pages/Topics.jsx';
import Test from './pages/Test.jsx';
import Result from './pages/Result.jsx';
import Stats from './pages/Stats.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="topics" element={<Topics />} />
        <Route path="test/:attemptId" element={<Test />} />
        <Route path="result/:attemptId" element={<Result />} />
        <Route path="stats" element={<Stats />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
