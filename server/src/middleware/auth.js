// TODO (#11): проверка на JWT токена от хедъра Authorization: Bearer <token>.
// Когато е готово, req.user трябва да съдържа { id, role }.
//
// optionalAuth: пуска заявката и без токен (засега тестовете работят анонимно).
// requireAuth:  връща 401, ако няма валиден токен.
// requireRole:  връща 403, ако ролята не е разрешена, напр. requireRole('TEACHER', 'ADMIN').

export function optionalAuth(req, res, next) {
  req.user = null;
  next();
}

export function requireAuth(req, res, next) {
  res.status(501).json({ error: 'Автентикацията още не е готова (#11)' });
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Нямате права за това действие' });
    }
    next();
  };
}
