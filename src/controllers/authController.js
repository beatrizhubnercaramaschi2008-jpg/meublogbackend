import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nodemailer from "nodemailer";

// CONFIGURAÇÃO DO EMAIL
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// FUNÇÃO PARA ENVIAR EMAIL DE VERIFICAÇÃO
async function sendVerificationEmail(email, token) {
  const link = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;

  await transporter.sendMail({
    from: `"Meu Blog" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verifique seu e-mail",
    html: `
      <h2>Confirme seu e-mail</h2>
      <p>Clique no link abaixo para ativar sua conta:</p>
      <a href="${link}">${link}</a>
      <p>Se não foi você, ignore este e-mail.</p>
    `
  });
}

// =============================
// REGISTRO
// =============================
export async function registerUser(req, res) {
  try {
    const { username, email, password, bio } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "E-mail inválido." });
    }

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ error: "E-mail já registrado." });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ error: "Nome de usuário já está em uso." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      bio: bio || "",
      emailVerified: false,
      emailVerificationToken: token,
      emailVerificationExpires: expires
    });

    await sendVerificationEmail(user.email, token);

    return res.status(201).json({
      message: "Conta criada! Verifique seu e-mail para ativar sua conta."
    });

  } catch (err) {
    console.error("Erro no registro:", err);
    return res.status(500).json({ error: "Erro ao registrar usuário." });
  }
}

// =============================
// VERIFICAR EMAIL
// =============================
export async function verifyEmail(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Token não fornecido." });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: "Token inválido ou expirado." });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res.json({ message: "E-mail verificado com sucesso!" });

  } catch (err) {
    console.error("Erro ao verificar e-mail:", err);
    return res.status(500).json({ error: "Erro ao verificar e-mail." });
  }
}

// =============================
// LOGIN
// =============================
export async function loginUser(req, res) {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      return res.status(400).json({ error: "Credenciais inválidas." });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Credenciais inválidas." });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: "Verifique seu e-mail antes de entrar." });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
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
    console.error("Erro no login:", err);
    return res.status(500).json({ error: "Erro ao fazer login." });
  }
}

