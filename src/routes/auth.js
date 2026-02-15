import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import { sendVerificationEmail } from '../config/email.js';

const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'E-mail inválido.' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: 'E-mail já registrado.' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Nome de usuário já em uso.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password, // será criptografada pelo pre('save')
      bio: bio || '',
      emailVerified: false,
      emailVerificationToken: token,
      emailVerificationExpires: expires
    });

    await sendVerificationEmail(user.email, token);

    return res.status(201).json({
      message: 'Usuário registrado. Verifique seu e-mail para ativar a conta.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
});

// GET /auth/verify-email?token=...
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token não fornecido.' });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido ou expirado.' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res.json({ message: 'E-mail verificado com sucesso.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao verificar e-mail.' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    const passwordOk = await user.comparePassword(password);
    if (!passwordOk) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    if (!user.emailVerified) {
      return res
        .status(403)
        .json({ error: 'Verifique seu e-mail antes de entrar.' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

export default router;

