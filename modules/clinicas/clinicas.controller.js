const bcrypt = require("bcrypt");
const database = require("../../config/database");
const { validarCNPJ } = require("../../utils/validators");

const PLANOS_CONFIG = {
  basico: { limite: 1, preco: 299.99 },
  intermediario: { limite: 3, preco: 399.99 },
  premium: { limite: 20, preco: 699.99 },
};

/**
 * POST /clinicas/register — cadastro público
 */
const registrarClinica = async (req, res) => {
  const { nome, cnpj, email, senha, telefone, endereco, nomeGestor, plano } =
    req.body;

  // ✅ VALIDAÇÕES PRIMEIRO (antes de qualquer query)
  if (!nome || !cnpj || !email || !senha || !nomeGestor) {
    return res.status(400).json({
      error:
        "Nome da clínica, CNPJ, e-mail, senha e nome do gestor são obrigatórios",
    });
  }

  if (String(senha).length < 6) {
    return res
      .status(400)
      .json({ error: "Senha deve ter no mínimo 6 caracteres" });
  }

  const cnpjLimpo = String(cnpj).replace(/\D/g, "");
  if (cnpjLimpo.length !== 14) {
    return res
      .status(400)
      .json({ error: "CNPJ inválido — informe 14 dígitos" });
  }
  if (!validarCNPJ(cnpjLimpo)) {
    return res
      .status(400)
      .json({ error: "CNPJ inválido — dígito verificador não confere" });
  }

  const emailNorm = String(email).toLowerCase().trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailNorm)) {
    return res.status(400).json({ error: "E-mail inválido" });
  }

  const planoEscolhido = String(plano || "basico").toLowerCase();
  const config = PLANOS_CONFIG[planoEscolhido];
  if (!config) {
    return res.status(400).json({
      error: "Plano inválido",
      planosValidos: Object.keys(PLANOS_CONFIG),
    });
  }

  // ✅ AGORA sim, conecta no banco
  const client = await database.connect();
  try {
    await client.query("BEGIN");

    const { rows: existe } = await client.query(
      "SELECT id FROM clinicas WHERE email = $1 OR cnpj = $2",
      [emailNorm, cnpjLimpo],
    );
    if (existe.length) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "E-mail ou CNPJ já cadastrado" });
    }

    const senha_hash = await bcrypt.hash(senha, 12);

    // ✅ CORREÇÃO CRÍTICA: is_subscribed = FALSE (trial, não assinante)
    const { rows: clinicaRows } = await client.query(
      `INSERT INTO clinicas
       (nome, cnpj, email, telefone, endereco, plano, limite_profissionais,
        trial_ends_at, is_subscribed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() + INTERVAL '7 days', false)
       RETURNING id, nome, email, cnpj, telefone, endereco, plano,
                 limite_profissionais, trial_ends_at, is_subscribed`,
      [
        String(nome).trim(),
        cnpjLimpo,
        emailNorm,
        telefone || null,
        endereco || null,
        planoEscolhido,
        config.limite,
      ],
    );
    const clinica = clinicaRows[0];

    // ✅ Cria o proprietário
    await client.query(
      `INSERT INTO usuarios (clinica_id, nome, email, senha_hash, cargo)
       VALUES ($1, $2, $3, $4, 'proprietario')`,
      [clinica.id, String(nomeGestor).trim(), emailNorm, senha_hash],
    );

    await client.query("COMMIT");

    res.status(201).json({
      message:
        "Clínica cadastrada com sucesso! Você tem 7 dias de teste grátis.",
      clinica_id: clinica.id,
      nome: clinica.nome,
      plano: clinica.plano,
      trial_ends_at: clinica.trial_ends_at,
      is_subscribed: clinica.is_subscribed,
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Erro ao registrar clínica:", error);
    res.status(500).json({ error: "Erro ao cadastrar clínica" });
  } finally {
    client.release();
  }
};

/**
 * GET /clinicas/me
 */
const getClinica = async (req, res) => {
  const { clinica_id } = req.user;
  try {
    const { rows } = await database.query(
      `SELECT id, nome, email, cnpj, telefone, endereco, ativo, plano,
              limite_profissionais, trial_ends_at, is_subscribed,
              asaas_customer_id, asaas_subscription_id, created_at
       FROM clinicas WHERE id = $1`,
      [clinica_id],
    );
    if (!rows[0])
      return res.status(404).json({ error: "Clínica não encontrada" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Erro getClinica:", error);
    res.status(500).json({ error: "Erro ao buscar clínica" });
  }
};

/**
 * PATCH /clinicas/me
 */
const atualizarClinica = async (req, res) => {
  const { clinica_id, cargo, id: userId } = req.user;

  if (!["proprietario", "gestor"].includes(cargo)) {
    return res.status(403).json({
      error: "Apenas proprietário ou gestor pode alterar dados da clínica",
    });
  }

  const { nome, telefone, endereco } = req.body;
  const client = await database.connect();

  try {
    await client.query("BEGIN");

    const updates = [];
    const values = [];
    let p = 1;

    if (nome !== undefined) {
      updates.push(`nome = $${p++}`);
      values.push(String(nome).trim());
    }
    if (telefone !== undefined) {
      updates.push(`telefone = $${p++}`);
      values.push(telefone || null);
    }
    if (endereco !== undefined) {
      updates.push(`endereco = $${p++}`);
      values.push(endereco || null);
    }

    if (!updates.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Nada para atualizar" });
    }

    values.push(clinica_id);
    const { rows } = await client.query(
      `UPDATE clinicas SET ${updates.join(", ")} WHERE id = $${p}
       RETURNING id, nome, email, cnpj, telefone, endereco`,
      values,
    );

    await client.query("COMMIT");
    res.json(rows[0]);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Erro atualizarClinica:", error);
    res.status(500).json({ error: "Erro ao atualizar clínica" });
  } finally {
    client.release();
  }
};

module.exports = { registrarClinica, getClinica, atualizarClinica };
