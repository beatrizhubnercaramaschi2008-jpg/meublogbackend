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
// 📌 REGISTRO
// =============================
export async function registerUser(req, res) {
  try {
    const { username, email, password, bio } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    // validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "E-mail inválido." });
    }

    // verificar duplicados
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ error: "E
