const crypto = require("crypto");
const bcrypt = require("bcrypt");
const database = require("../../config/database");
const { enviarEmailRecuperacao } = require("../../config/mailer");

const RESET_TOKEN_TTL_MIN = 15; // 15 min.

/**
 * POST /auth/forgot-password
 */
const solicitarRecuperacao = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "E-mail obrigatório" });

  const emailNorm = email.toLowerCase().trim();

  try {
    const { rows } = await database.query(
      `SELECT id, nome, email FROM usuarios WHERE email = $1 AND ativo = true`,
      [emailNorm],
    );

    if (rows.length === 0) {
      return res.json({
        message:
          "Se este e-mail estiver cadastrado, enviaremos um link de recuperação.",
      });
    }

    const usuario = rows[0];

    await database.query(
      "UPDATE password_reset_tokens SET used = true WHERE usuario_id = $1 AND used = false",
      [usuario.id],
    );

    const plainToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MIN * 60 * 1000);

    await database.query(
      `INSERT INTO password_reset_tokens (usuario_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [usuario.id, tokenHash, expiresAt],
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password?token=${plainToken}`;

    enviarEmailRecuperacao(usuario.email, usuario.nome, resetLink)
      .then(() => {
        console.log(
          `✅ E-mail de recuperação enviado com sucesso para: ${usuario.email}`,
        );
      })
      .catch((err) => {
        console.error(
          `❌ Falha ao enviar e-mail para ${usuario.email}:`,
          err.message,
        );
      });

    res.json({
      message:
        "Se este e-mail estiver cadastrado, enviaremos um link de recuperação.",
    });
  } catch (error) {
    console.error("Erro forgot-password:", error);
    res.status(500).json({ error: "Erro interno" });
  }
};

/**
 * POST /auth/reset-password
 * Body: { token, novaSenha }
 */
const redefinirSenha = async (req, res) => {
  const { token, novaSenha } = req.body;

  if (!token || !novaSenha) {
    return res
      .status(400)
      .json({ error: "Token e nova senha são obrigatórios" });
  }
  if (novaSenha.length < 6) {
    return res
      .status(400)
      .json({ error: "A senha deve ter no mínimo 6 caracteres" });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const client = await database.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT prt.id, prt.usuario_id, prt.expires_at, prt.used
       FROM password_reset_tokens prt
       WHERE prt.token_hash = $1
       ORDER BY prt.created_at DESC LIMIT 1`,
      [tokenHash],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Token inválido ou expirado" });
    }

    const row = rows[0];

    if (row.used) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Este link já foi utilizado" });
    }
    if (new Date(row.expires_at) < new Date()) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Token expirado. Solicite um novo link." });
    }

    const senha_hash = await bcrypt.hash(novaSenha, 12);

    await client.query("UPDATE usuarios SET senha_hash = $1 WHERE id = $2", [
      senha_hash,
      row.usuario_id,
    ]);

    await client.query(
      "UPDATE password_reset_tokens SET used = true WHERE id = $1",
      [row.id],
    );

    await client.query("COMMIT");

    res.json({
      message: "Senha redefinida com sucesso! Você já pode fazer login.",
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Erro reset-password:", error);
    res.status(500).json({ error: "Erro interno" });
  } finally {
    client.release();
  }
};

module.exports = { solicitarRecuperacao, redefinirSenha };
