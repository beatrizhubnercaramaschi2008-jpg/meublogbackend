import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // ou outro
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendVerificationEmail(email, token) {
  const link = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;

  await transporter.sendMail({
    from: `"Meu Blog" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verifique seu e-mail',
    html: `
      <h1>Confirme seu e-mail</h1>
      <p>Clique no link abaixo para verificar seu e-mail:</p>
      <a href="${link}">${link}</a>
    `
  });
}
