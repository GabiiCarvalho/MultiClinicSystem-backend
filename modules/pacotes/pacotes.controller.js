const database = require("../../config/database");

const listarPacotes = async (req, res) => {
  const { clinica_id } = req.user;
  const { paciente_id, status } = req.query;

  try {
    const conditions = ["p.clinica_id = $1"];
    const values = [clinica_id];
    let i = 2;

    if (paciente_id) {
      conditions.push(`p.paciente_id = $${i++}`);
      values.push(paciente_id);
    }
    if (status) {
      conditions.push(`p.status = $${i++}`);
      values.push(status);
    }

    const { rows } = await database.query(
      `SELECT p.*, proc.nome AS procedimento_nome, pac.nome AS paciente_nome
       FROM pacotes_paciente p
       JOIN procedimentos proc ON proc.id = p.procedimento_id
       JOIN pacientes pac ON pac.id = p.paciente_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY p.created_at DESC`,
      values,
    );
    res.json(rows);
  } catch (error) {
    console.error("Erro listar pacotes:", error);
    res.status(500).json({ error: "Erro ao listar pacotes" });
  }
};

const criarPacote = async (req, res) => {
  const { clinica_id } = req.user;
  const {
    paciente_id,
    procedimento_id,
    nome,
    total_sessoes,
    valor_total,
    validade,
    observacoes,
  } = req.body;

  if (!paciente_id || !procedimento_id || !total_sessoes) {
    return res
      .status(400)
      .json({
        error: "Paciente, procedimento e total de sessões são obrigatórios",
      });
  }
  if (Number(total_sessoes) <= 0) {
    return res
      .status(400)
      .json({ error: "Total de sessões deve ser maior que zero" });
  }

  try {
    const { rows } = await database.query(
      `INSERT INTO pacotes_paciente
       (clinica_id, paciente_id, procedimento_id, nome, total_sessoes,
        valor_total, validade, observacoes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        clinica_id,
        paciente_id,
        procedimento_id,
        nome || null,
        Number(total_sessoes),
        Number(valor_total) || 0,
        validade || null,
        observacoes || null,
      ],
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Erro criar pacote:", error);
    res.status(500).json({ error: "Erro ao criar pacote" });
  }
};

const debitarSessao = async (req, res) => {
  const { clinica_id } = req.user;
  const { id } = req.params;
  const { agendamento_id, observacoes } = req.body;

  const client = await database.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT * FROM pacotes_paciente
       WHERE id = $1 AND clinica_id = $2 FOR UPDATE`,
      [id, clinica_id],
    );
    if (!rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Pacote não encontrado" });
    }

    const pac = rows[0];
    if (pac.status !== "ativo") {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: `Pacote não está ativo (status: ${pac.status})` });
    }
    if (pac.sessoes_usadas >= pac.total_sessoes) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Pacote sem sessões disponíveis" });
    }

    await client.query(
      `INSERT INTO sessoes_utilizadas (pacote_id, agendamento_id, observacoes)
       VALUES ($1, $2, $3)`,
      [id, agendamento_id || null, observacoes || null],
    );

    const novasUsadas = pac.sessoes_usadas + 1;
    const novoStatus = novasUsadas >= pac.total_sessoes ? "esgotado" : "ativo";

    const { rows: updated } = await client.query(
      `UPDATE pacotes_paciente
       SET sessoes_usadas = $1, status = $2
       WHERE id = $3 RETURNING *`,
      [novasUsadas, novoStatus, id],
    );

    await client.query("COMMIT");
    res.json(updated[0]);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Erro debitar sessão:", error);
    res.status(500).json({ error: "Erro ao debitar sessão" });
  } finally {
    client.release();
  }
};

module.exports = { listarPacotes, criarPacote, debitarSessao };
