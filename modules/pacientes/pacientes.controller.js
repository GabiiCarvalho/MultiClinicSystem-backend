const database = require("../../config/database");
const { validarCPF, validarEmail } = require("../../utils/validators");

/**
 * GET /pacientes
 */
const listarPacientes = async (req, res) => {
  const { clinica_id, cargo, id: userId } = req.user;
  const { busca } = req.query;

  try {
    const isDentista = ["dentista", "esteticista"].includes(cargo);
    const values = [clinica_id];
    let p = 2;
    let query;

    if (isDentista) {
      query = `
        SELECT DISTINCT p.id, p.nome, p.telefone, p.email, p.cpf,
                        p.data_nascimento, p.observacoes, p.created_at
        FROM pacientes p
        JOIN agendamentos a ON a.paciente_id = p.id
        WHERE p.clinica_id = $1 AND a.profissional_id = $${p++}
      `;
      values.push(userId);
    } else {
      query = `
        SELECT id, nome, telefone, email, cpf, data_nascimento,
               observacoes, created_at
        FROM pacientes
        WHERE clinica_id = $1
      `;
    }

    if (busca) {
      query += ` AND (nome ILIKE $${p} OR telefone ILIKE $${p} OR email ILIKE $${p})`;
      values.push(`%${busca}%`);
      p++;
    }

    query += " ORDER BY nome ASC";

    const { rows } = await database.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error("Erro listar pacientes:", error);
    res.status(500).json({ error: "Erro ao buscar pacientes" });
  }
};

/**
 * GET /pacientes/:id
 */
const getPaciente = async (req, res) => {
  const { clinica_id, cargo, id: userId } = req.user;
  const { id } = req.params;

  try {
    const { rows } = await database.query(
      "SELECT * FROM pacientes WHERE id = $1 AND clinica_id = $2",
      [id, clinica_id],
    );
    if (!rows[0])
      return res.status(404).json({ error: "Paciente não encontrado" });

    if (["dentista", "esteticista"].includes(cargo)) {
      const { rows: check } = await database.query(
        `SELECT id FROM agendamentos
         WHERE paciente_id = $1 AND profissional_id = $2 AND clinica_id = $3
         LIMIT 1`,
        [id, userId, clinica_id],
      );
      if (!check.length) {
        return res.status(403).json({ error: "Acesso negado a este paciente" });
      }
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Erro getPaciente:", error);
    res.status(500).json({ error: "Erro ao buscar paciente" });
  }
};

/**
 * POST /pacientes
 */
const criarPaciente = async (req, res) => {
  const { clinica_id } = req.user;
  const { nome, telefone, email, cpf, data_nascimento, observacoes } = req.body;

  if (!nome || !String(nome).trim()) {
    return res.status(400).json({ error: "Nome obrigatório" });
  }

  const cpfLimpo = cpf ? String(cpf).replace(/\D/g, "") : null;
  if (cpfLimpo && !validarCPF(cpfLimpo)) {
    return res.status(400).json({ error: "CPF inválido" });
  }

  if (email && !validarEmail(email)) {
    return res.status(400).json({ error: "E-mail inválido" });
  }

  try {
    const { rows } = await database.query(
      `INSERT INTO pacientes
       (clinica_id, nome, telefone, email, cpf, data_nascimento, observacoes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        clinica_id,
        String(nome).trim(),
        telefone ? String(telefone).replace(/\D/g, "") : null,
        email ? String(email).trim().toLowerCase() : null,
        cpfLimpo,
        data_nascimento || null,
        observacoes ? String(observacoes).trim() : null,
      ],
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Erro ao criar paciente:", error);
    res.status(500).json({ error: "Erro ao criar paciente" });
  }
};

/**
 * PATCH /pacientes/:id
 */
const atualizarPaciente = async (req, res) => {
  const { clinica_id } = req.user;
  const { id } = req.params;
  const { nome, telefone, email, cpf, data_nascimento, observacoes } = req.body;

  try {
    const { rows: check } = await database.query(
      "SELECT id FROM pacientes WHERE id = $1 AND clinica_id = $2",
      [id, clinica_id],
    );
    if (!check.length)
      return res.status(404).json({ error: "Paciente não encontrado" });

    const updates = [];
    const values = [];
    let p = 1;

    if (nome !== undefined) {
      if (!String(nome).trim()) {
        return res.status(400).json({ error: "Nome não pode ficar vazio" });
      }
      updates.push(`nome = $${p++}`);
      values.push(String(nome).trim());
    }

    if (telefone !== undefined) {
      updates.push(`telefone = $${p++}`);
      values.push(telefone ? String(telefone).replace(/\D/g, "") : null);
    }

    if (email !== undefined) {
      if (email && !validarEmail(email)) {
        return res.status(400).json({ error: "E-mail inválido" });
      }
      updates.push(`email = $${p++}`);
      values.push(email ? String(email).trim().toLowerCase() : null);
    }

    if (cpf !== undefined) {
      const cpfLimpo = cpf ? String(cpf).replace(/\D/g, "") : null;
      if (cpfLimpo && !validarCPF(cpfLimpo)) {
        return res.status(400).json({ error: "CPF inválido" });
      }
      updates.push(`cpf = $${p++}`);
      values.push(cpfLimpo);
    }

    if (data_nascimento !== undefined) {
      updates.push(`data_nascimento = $${p++}`);
      values.push(data_nascimento || null);
    }

    if (observacoes !== undefined) {
      updates.push(`observacoes = $${p++}`);
      values.push(observacoes ? String(observacoes).trim() : null);
    }

    if (!updates.length) {
      return res.status(400).json({ error: "Nenhum campo para atualizar" });
    }

    values.push(id, clinica_id);
    const { rows } = await database.query(
      `UPDATE pacientes SET ${updates.join(", ")}
       WHERE id = $${p++} AND clinica_id = $${p}
       RETURNING *`,
      values,
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error);
    res.status(500).json({ error: "Erro ao atualizar paciente" });
  }
};

module.exports = {
  listarPacientes,
  getPaciente,
  criarPaciente,
  atualizarPaciente,
};
