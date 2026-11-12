const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Envia e-mail de recuperação de senha.
 * @param {string} to
 * @param {string} nome
 * @param {string} resetLink
 */
async function enviarEmailRecuperacao(to, nome, resetLink) {
  const html = `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #F8FAFC; padding: 32px 24px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #2563EB; margin: 0;">MultiClinic</h2>
      </div>
      <div style="background: #FFFFFF; padding: 32px 24px; border-radius: 12px; border: 1px solid #E2E8F0;">
        <h3 style="color: #0F172A; margin-top: 0;">Olá, ${nome}!</h3>
        <p style="color: #475569; line-height: 1.6;">
          Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetLink}" 
             style="background: #2563EB; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; display: inline-block;">
            Redefinir minha senha
          </a>
        </div>
        <p style="color: #94A3B8; font-size: 13px; line-height: 1.5;">
          Este link expira em <strong>15 minutos</strong>. Se você não solicitou a alteração, ignore este e-mail.
        </p>
        <p style="color: #94A3B8; font-size: 12px; word-break: break-all; margin-top: 16px;">
          Se o botão não funcionar, copie e cole este endereço no navegador:<br/>
          ${resetLink}
        </p>
      </div>
      <p style="text-align: center; color: #94A3B8; font-size: 12px; margin-top: 24px;">
        MultiClinic — Sistema de Gestão para Clínicas
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"MultiClinic" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: "Redefinição de senha — MultiClinic",
    html,
  });
}

module.exports = { transporter, enviarEmailRecuperacao };
