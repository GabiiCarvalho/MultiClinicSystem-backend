const database = require("../../config/database");

const criarPagamento = async (req, res) => {
  const { clinica_id, id: criado_por } = req.user;
  const {
    paciente_id,
    agendamento_id,
    itens,
    subtotal,
    desconto,
    total,
    forma_pagamento,
    recebido,
    troco,
  } = req.body;

  if (!paciente_id || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ error: "Paciente e itens obrigatórios" });
  }
  if (!forma_pagamento) {
    return res.status(400).json({ error: "Forma de pagamento obrigatória" });
  }

  const client = await database.connect();
  try {
    await client.query("BEGIN");

    const { rows: pac } = await client.query(
      "SELECT id FROM pacientes WHERE id = $1 AND clinica_id = $2",
      [paciente_id, clinica_id],
    );
    if (!pac.length) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Paciente não pertence a esta clínica" });
    }

    const { rows: pgto } = await client.query(
      `INSERT INTO pagamentos
       (clinica_id, paciente_id, agendamento_id, subtotal, desconto, total,
        forma_pagamento, recebido, troco, criado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        clinica_id,
        paciente_id,
        agendamento_id || null,
        Number(subtotal) || 0,
        Number(desconto) || 0,
        Number(total) || 0,
        forma_pagamento,
        Number(recebido) || Number(total) || 0,
        Number(troco) || 0,
        criado_por,
      ],
    );

    // marca agendamento(s) como pago
    if (agendamento_id) {
      await client.query(
        `UPDATE agendamentos SET pago = true, updated_at = NOW()
         WHERE id = $1 AND clinica_id = $2`,
        [agendamento_id, clinica_id],
      );
    }

    await client.query("COMMIT");
    res.status(201).json(pgto[0]);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Erro ao criar pagamento:", error);
    res.status(500).json({ error: "Erro ao registrar pagamento" });
  } finally {
    client.release();
  }
};

const listarPagamentos = async (req, res) => {
  const { clinica_id } = req.user;
  try {
    const { rows } = await database.query(
      `SELECT p.*, pac.nome AS paciente_nome
       FROM pagamentos p
       JOIN pacientes pac ON pac.id = p.paciente_id
       WHERE p.clinica_id = $1
       ORDER BY p.created_at DESC LIMIT 500`,
      [clinica_id],
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Erro ao listar pagamentos" });
  }
};

module.exports = { criarPagamento, listarPagamentos };
