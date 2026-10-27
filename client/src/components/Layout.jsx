import { NavLink, Outlet } from 'react-router';

export default function Layout() {
  return (
    <>
      <nav>
        <NavLink to="/">Табло</NavLink>
        <NavLink to="/topics">Теми</NavLink>
        <NavLink to="/stats">Статистика</NavLink>
        <NavLink to="/login">Вход</NavLink>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}
