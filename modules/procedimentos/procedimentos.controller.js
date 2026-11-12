const database = require("../../config/database");

const listar = async (req, res) => {
  try {
    const { rows } = await database.query(
      `SELECT id, nome, descricao, valor, duracao_min, tipo, ativo
       FROM procedimentos
       WHERE clinica_id = $1 AND ativo = true
       ORDER BY nome ASC`,
      [req.user.clinica_id],
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Erro ao listar procedimentos" });
  }
};

const criar = async (req, res) => {
  const { clinica_id } = req.user;
  const { nome, descricao, valor, duracao_min, tipo } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: "Nome obrigatório" });
  }
  const tipoNorm = tipo || "odontologia";
  if (!["odontologia", "estetica", "outro"].includes(tipoNorm)) {
    return res.status(400).json({ error: "Tipo inválido" });
  }

  try {
    const { rows } = await database.query(
      `INSERT INTO procedimentos (clinica_id, nome, descricao, valor, duracao_min, tipo)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        clinica_id,
        nome.trim(),
        descricao || null,
        Number(valor) || 0,
        Number(duracao_min) || 60,
        tipoNorm,
      ],
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: "Erro ao criar procedimento" });
  }
};

const atualizar = async (req, res) => {
  const { clinica_id } = req.user;
  const { id } = req.params;
  const { nome, descricao, valor, duracao_min, tipo, ativo } = req.body;

  try {
    const { rows: check } = await database.query(
      "SELECT id FROM procedimentos WHERE id = $1 AND clinica_id = $2",
      [id, clinica_id],
    );
    if (!check.length)
      return res.status(404).json({ error: "Procedimento não encontrado" });

    const updates = [];
    const values = [];
    let p = 1;
    if (nome !== undefined && String(nome).trim()) {
      updates.push(`nome = $${p++}`);
      values.push(String(nome).trim());
    }
    if (descricao !== undefined) {
      updates.push(`descricao = $${p++}`);
      values.push(descricao || null);
    }
    if (valor !== undefined) {
      updates.push(`valor = $${p++}`);
      values.push(Number(valor) || 0);
    }
    if (duracao_min !== undefined) {
      updates.push(`duracao_min = $${p++}`);
      values.push(Number(duracao_min) || 60);
    }
    if (tipo !== undefined) {
      updates.push(`tipo = $${p++}`);
      values.push(tipo);
    }
    if (ativo !== undefined) {
      updates.push(`ativo = $${p++}`);
      values.push(!!ativo);
    }

    if (!updates.length)
      return res.status(400).json({ error: "Nada para atualizar" });

    values.push(id, clinica_id);
    const { rows } = await database.query(
      `UPDATE procedimentos SET ${updates.join(", ")}
       WHERE id = $${p++} AND clinica_id = $${p} RETURNING *`,
      values,
    );
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Erro ao atualizar procedimento" });
  }
};

const desativar = async (req, res) => {
  const { clinica_id } = req.user;
  const { id } = req.params;
  try {
    const { rows } = await database.query(
      `UPDATE procedimentos SET ativo = false
       WHERE id = $1 AND clinica_id = $2 RETURNING id`,
      [id, clinica_id],
    );
    if (!rows.length)
      return res.status(404).json({ error: "Procedimento não encontrado" });
    res.json({ message: "Procedimento desativado" });
  } catch {
    res.status(500).json({ error: "Erro ao desativar procedimento" });
  }
};

module.exports = { listar, criar, atualizar, desativar };
