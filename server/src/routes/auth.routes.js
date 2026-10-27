import { Router } from 'express';

// TODO (#11): POST /register и POST /login.
// Контролерът да е в controllers/auth.controller.js,
// паролите да се хешират с bcrypt, вход да връща JWT.

const router = Router();

const notReady = (req, res) => {
  res.status(501).json({ error: 'Автентикацията още не е готова (#11)' });
};

router.post('/register', notReady);
router.post('/login', notReady);

export default router;
