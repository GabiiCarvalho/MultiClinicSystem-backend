const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const database = require("../../config/database");

const makeToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "12h",
  });

const generateSessionId = () => crypto.randomBytes(16).toString("hex");

// ✅ Função auxiliar para verificar o status do trial
const verificarAssinatura = (clinica) => {
  const trialExpirado = new Date(clinica.trial_ends_at) < new Date();
  const bloqueado = trialExpirado && !clinica.is_subscribed;
  return { bloqueado, trialExpirado };
};

const loginClinica = async (req, res) => {
  const { email, cnpj, senha } = req.body;
  if (!email || !cnpj || !senha) {
    return res.status(400).json({ error: "Email, CNPJ e senha obrigatórios" });
  }
  const cnpjLimpo = cnpj.replace(/\D/g, "");

  try {
    const { rows } = await database.query(
      `SELECT u.id, u.nome, u.email, u.senha_hash, u.cargo, u.ativo,
              c.id AS clinica_id, c.nome AS clinica_nome, c.ativo AS clinica_ativa,
              c.trial_ends_at, c.is_subscribed
       FROM usuarios u
       JOIN clinicas c ON c.id = u.clinica_id
       WHERE u.email = $1 AND c.cnpj = $2 AND u.cargo IN ('proprietario','gestor')`,
      [email.toLowerCase().trim(), cnpjLimpo],
    );

    const u = rows[0];
    if (!u) return res.status(401).json({ error: "Credenciais inválidas" });
    if (!u.ativo) return res.status(403).json({ error: "Usuário inativo." });
    if (!u.clinica_ativa)
      return res.status(403).json({ error: "Clínica inativa." });

    const ok = await bcrypt.compare(senha, u.senha_hash);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    await database.query(
      "DELETE FROM sessoes_ativas WHERE updated_at < NOW() - INTERVAL '12 hours'",
    );

    const { rows: sessao } = await database.query(
      "SELECT token_sessao FROM sessoes_ativas WHERE usuario_id = $1",
      [u.id],
    );

    if (sessao.length > 0) {
      return res.status(403).json({
        error:
          "Este usuário gestor já está logado em outro dispositivo. Por favor, saia da outra sessão antes de entrar.",
      });
    }

    const sessionId = generateSessionId();
    await database.query(
      "INSERT INTO sessoes_ativas (usuario_id, token_sessao) VALUES ($1, $2)",
      [u.id, sessionId],
    );

    const token = makeToken({
      id: u.id,
      clinica_id: u.clinica_id,
      cargo: u.cargo,
      nome: u.nome,
      email: u.email,
      tipo: "clinica",
      sessionId,
    });

    // ✅ Verifica o bloqueio
    const { bloqueado } = verificarAssinatura(u);

    res.json({
      token,
      usuario: {
        id: u.id,
        clinica_id: u.clinica_id,
        nome: u.nome,
        nomeGestor: u.nome,
        email: u.email,
        cargo: u.cargo,
        loja_id: u.clinica_id,
        loja_nome: u.clinica_nome,
        tipo: "clinica",
        trial_ends_at: u.trial_ends_at, // ✅ NOVO
        is_subscribed: u.is_subscribed, // ✅ NOVO
        bloqueado, // ✅ NOVO
      },
    });
  } catch (error) {
    console.error("Erro login clínica:", error);
    res.status(500).json({ error: "Erro interno" });
  }
};

const loginUsuario = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha obrigatórios" });
  }

  try {
    const { rows } = await database.query(
      `SELECT u.id, u.clinica_id, u.nome, u.email, u.cargo,
              u.especialidade, u.senha_hash, u.ativo,
              c.nome AS loja_nome, c.ativo AS clinica_ativa,
              c.trial_ends_at, c.is_subscribed
       FROM usuarios u
       JOIN clinicas c ON c.id = u.clinica_id
       WHERE u.email = $1`,
      [email.toLowerCase().trim()],
    );

    const u = rows[0];
    if (!u) return res.status(401).json({ error: "Credenciais inválidas" });
    if (!u.ativo) return res.status(403).json({ error: "Usuário inativo." });
    if (!u.clinica_ativa)
      return res.status(403).json({ error: "Clínica inativa." });

    const ok = await bcrypt.compare(senha, u.senha_hash);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    await database.query(
      "DELETE FROM sessoes_ativas WHERE updated_at < NOW() - INTERVAL '12 hours'",
    );

    const { rows: sessao } = await database.query(
      "SELECT token_sessao FROM sessoes_ativas WHERE usuario_id = $1",
      [u.id],
    );

    if (sessao.length > 0) {
      return res.status(403).json({
        error:
          "Este usuário já está logado em outro dispositivo. Por favor, saia da outra sessão antes de entrar.",
      });
    }

    const sessionId = generateSessionId();
    await database.query(
      "INSERT INTO sessoes_ativas (usuario_id, token_sessao) VALUES ($1, $2)",
      [u.id, sessionId],
    );

    const token = makeToken({
      id: u.id,
      clinica_id: u.clinica_id,
      cargo: u.cargo,
      nome: u.nome,
      email: u.email,
      especialidade: u.especialidade,
      tipo: "usuario",
      sessionId,
    });

    // ✅ Verifica o bloqueio
    const { bloqueado } = verificarAssinatura(u);

    res.json({
      token,
      usuario: {
        id: u.id,
        clinica_id: u.clinica_id,
        nome: u.nome,
        nomeGestor: u.nome,
        email: u.email,
        cargo: u.cargo,
        especialidade: u.especialidade,
        loja_id: u.clinica_id,
        loja_nome: u.loja_nome,
        tipo: "usuario",
        trial_ends_at: u.trial_ends_at,
        is_subscribed: u.is_subscribed,
        bloqueado,
      },
    });
  } catch (error) {
    console.error("Erro login usuário:", error);
    res.status(500).json({ error: "Erro interno" });
  }
};

const getMe = async (req, res) => {
  try {
    const { id, tipo, sessionId } = req.user;

    const { rows: sessao } = await database.query(
      "SELECT token_sessao FROM sessoes_ativas WHERE usuario_id = $1",
      [id],
    );

    if (!sessao.length || sessao[0].token_sessao !== sessionId) {
      return res
        .status(401)
        .json({ error: "Sessão expirada em outro dispositivo." });
    }

    await database.query(
      "UPDATE sessoes_ativas SET updated_at = NOW() WHERE usuario_id = $1",
      [id],
    );

    const { rows } = await database.query(
      `SELECT u.id, u.clinica_id, u.nome, u.email, u.cargo, u.especialidade,
              c.nome AS loja_nome, c.ativo AS clinica_ativa,
              c.trial_ends_at, c.is_subscribed
       FROM usuarios u
       JOIN clinicas c ON c.id = u.clinica_id
       WHERE u.id = $1 AND u.ativo = true`,
      [id],
    );

    if (!rows[0])
      return res.status(404).json({ error: "Usuário não encontrado" });
    if (!rows[0].clinica_ativa)
      return res.status(403).json({ error: "Clínica inativa" });

    const { bloqueado } = verificarAssinatura(rows[0]);

    res.json({
      id: rows[0].id,
      clinica_id: rows[0].clinica_id,
      nome: rows[0].nome,
      nomeGestor: rows[0].nome,
      email: rows[0].email,
      cargo: rows[0].cargo,
      especialidade: rows[0].especialidade,
      loja_id: rows[0].clinica_id,
      loja_nome: rows[0].loja_nome,
      trial_ends_at: rows[0].trial_ends_at,
      is_subscribed: rows[0].is_subscribed,
      bloqueado,
      tipo: tipo || "usuario",
    });
  } catch (error) {
    console.error("Erro getMe:", error);
    res.status(500).json({ error: "Erro interno" });
  }
};

/**
 * POST /auth/logout
 */
const logoutUser = async (req, res) => {
  try {
    const { usuario_id } = req.body;

    if (usuario_id) {
      await database.query("DELETE FROM sessoes_ativas WHERE usuario_id = $1", [
        usuario_id,
      ]);
    }

    res.json({ message: "Sessão encerrada com sucesso" });
  } catch (error) {
    console.error("Erro logout:", error);
    res.status(500).json({ error: "Erro ao encerrar sessão" });
  }
};

module.exports = { loginClinica, loginUsuario, getMe, logoutUser };
