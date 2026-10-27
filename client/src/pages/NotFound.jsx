import { Link } from 'react-router';

export default function NotFound() {
  return (
    <>
      <h1>Страницата не е намерена</h1>
      <Link to="/">Към таблото</Link>
    </>
  );
}
