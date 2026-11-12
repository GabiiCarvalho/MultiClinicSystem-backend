const database = require("../../config/database");

const STATUS_VALIDOS = [
  "agendado",
  "confirmado",
  "em_procedimento",
  "finalizado",
  "cancelado",
];

const STATUS_POR_CARGO = {
  dentista: ["em_procedimento", "finalizado", "cancelado"],
  esteticista: ["em_procedimento", "finalizado", "cancelado"],
  atendente: ["agendado", "confirmado", "cancelado"],
  financeiro: ["finalizado", "cancelado"],
  gestor: STATUS_VALIDOS,
  proprietario: STATUS_VALIDOS,
};

const listarAgendamentos = async (req, res) => {
  const { clinica_id, cargo, id: userId } = req.user;
  const { data, profissional_id, status, mes, ano } = req.query;

  if (data && !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return res
      .status(400)
      .json({ error: "Data deve estar no formato YYYY-MM-DD" });
  }

  try {
    const isDentista = ["dentista", "esteticista"].includes(cargo);
    const conditions = ["a.clinica_id = $1"];
    const values = [clinica_id];
    let p = 2;

    if (isDentista) {
      conditions.push(`a.profissional_id = $${p++}`);
      values.push(userId);
    } else if (profissional_id) {
      conditions.push(`a.profissional_id = $${p++}`);
      values.push(profissional_id);
    }

    if (data) {
      conditions.push(`DATE(a.data_hora) = $${p++}`);
      values.push(data);
    } else if (mes && ano) {
      conditions.push(`EXTRACT(MONTH FROM a.data_hora) = $${p++}`);
      values.push(Number(mes));
      conditions.push(`EXTRACT(YEAR FROM a.data_hora) = $${p++}`);
      values.push(Number(ano));
    }

    if (status && status !== "todos") {
      conditions.push(`a.status = $${p++}`);
      values.push(status);
    }

    const query = `
      SELECT
        a.id, a.data_hora, a.data_hora_fim, a.status,
        a.valor, a.pago, a.observacoes, a.procedure_progress,
        a.motivo_cancelamento, 
        a.profissional_id, -- <--- ESSA LINHA É A CORREÇÃO PRINCIPAL
        json_build_object(
          'id', pac.id, 'nome', pac.nome,
          'telefone', pac.telefone, 'email', pac.email
        ) AS paciente,
        json_build_object(
          'id', prof.id, 'nome', prof.nome,
          'cargo', prof.cargo, 'especialidade', prof.especialidade
        ) AS dentista,
        json_build_object(
          'id', proc.id, 'nome', proc.nome,
          'tipo', proc.tipo, 'duracao_min', proc.duracao_min
        ) AS procedimento
      FROM agendamentos a
      JOIN pacientes pac   ON pac.id  = a.paciente_id
      JOIN usuarios   prof ON prof.id = a.profissional_id
      LEFT JOIN procedimentos proc ON proc.id = a.procedimento_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY a.data_hora ASC
    `;

    const { rows } = await database.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar agendamentos:", error);
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
};

const getAgendamento = async (req, res) => {
  const { clinica_id, cargo, id: userId } = req.user;
  const { id } = req.params;

  try {
    const { rows } = await database.query(
      `SELECT a.*, pac.nome AS paciente_nome, prof.nome AS profissional_nome
       FROM agendamentos a
       JOIN pacientes pac ON pac.id = a.paciente_id
       JOIN usuarios  prof ON prof.id = a.profissional_id
       WHERE a.id = $1 AND a.clinica_id = $2`,
      [id, clinica_id],
    );

    if (!rows[0])
      return res.status(404).json({ error: "Agendamento não encontrado" });

    if (
      ["dentista", "esteticista"].includes(cargo) &&
      rows[0].profissional_id !== userId
    ) {
      return res
        .status(403)
        .json({ error: "Acesso negado a este agendamento" });
    }

    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Erro ao buscar agendamento" });
  }
};

const criarAgendamento = async (req, res) => {
  const { clinica_id, id: criado_por } = req.user;
  const {
    paciente_id,
    profissional_id,
    procedimento_id,
    data_hora,
    data_hora_fim,
    valor,
    observacoes,
  } = req.body;

  if (!paciente_id || !profissional_id || !data_hora) {
    return res
      .status(400)
      .json({ error: "Paciente, profissional e data/hora são obrigatórios" });
  }

  const client = await database.connect();
  try {
    await client.query("BEGIN");

    const { rows: profCheck } = await client.query(
      "SELECT id FROM usuarios WHERE id = $1 AND clinica_id = $2 AND ativo = true",
      [profissional_id, clinica_id],
    );
    if (!profCheck.length) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Profissional não pertence a esta clínica" });
    }

    const { rows: pacCheck } = await client.query(
      "SELECT id FROM pacientes WHERE id = $1 AND clinica_id = $2",
      [paciente_id, clinica_id],
    );
    if (!pacCheck.length) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Paciente não pertence a esta clínica" });
    }

    if (procedimento_id) {
      const { rows: procCheck } = await client.query(
        "SELECT id FROM procedimentos WHERE id = $1 AND clinica_id = $2",
        [procedimento_id, clinica_id],
      );
      if (!procCheck.length) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: "Procedimento não pertence a esta clínica" });
      }
    }

    const fim =
      data_hora_fim ||
      new Date(new Date(data_hora).getTime() + 60 * 60000).toISOString();

    const { rows: conflito } = await client.query(
      `SELECT id FROM agendamentos
       WHERE profissional_id = $1
         AND status NOT IN ('cancelado','finalizado')
         AND data_hora < $3
         AND data_hora_fim > $2`,
      [profissional_id, data_hora, fim],
    );
    if (conflito.length) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: "Conflito de horário",
        detail: "Este profissional já possui agendamento neste horário",
      });
    }

    const { rows } = await client.query(
      `INSERT INTO agendamentos
       (clinica_id, paciente_id, profissional_id, procedimento_id,
        data_hora, data_hora_fim, valor, observacoes, criado_por, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'agendado')
       RETURNING *`,
      [
        clinica_id,
        paciente_id,
        profissional_id,
        procedimento_id || null,
        data_hora,
        fim,
        Number(valor) || 0,
        observacoes || null,
        criado_por,
      ],
    );

    await client.query("COMMIT");
    res.locals.entityId = rows[0].id;
    res.status(201).json(rows[0]);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Erro ao criar agendamento:", error);
    res.status(500).json({ error: "Erro ao criar agendamento" });
  } finally {
    client.release();
  }
};

const atualizarStatus = async (req, res) => {
  const { clinica_id, cargo, id: userId } = req.user;
  const { id } = req.params;
  const { status, motivo_cancelamento } = req.body;

  if (!STATUS_VALIDOS.includes(status)) {
    return res
      .status(400)
      .json({ error: "Status inválido", statusValidos: STATUS_VALIDOS });
  }

  const permitidos = STATUS_POR_CARGO[cargo] || [];
  if (!permitidos.includes(status)) {
    return res.status(403).json({
      error: `Cargo "${cargo}" não pode definir status "${status}"`,
      statusPermitidos: permitidos,
    });
  }

  try {
    const { rows: check } = await database.query(
      "SELECT profissional_id FROM agendamentos WHERE id = $1 AND clinica_id = $2",
      [id, clinica_id],
    );
    if (!check.length) return res.status(404).json({ error: "Não encontrado" });

    if (
      ["dentista", "esteticista"].includes(cargo) &&
      check[0].profissional_id !== userId
    ) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const { rows } = await database.query(
      `UPDATE agendamentos
       SET status = $1, motivo_cancelamento = $2, updated_at = NOW()
       WHERE id = $3 AND clinica_id = $4 RETURNING *`,
      [status, motivo_cancelamento || null, id, clinica_id],
    );

    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Erro ao atualizar status" });
  }
};

const atualizarData = async (req, res) => {
  const { clinica_id, cargo, id: userId } = req.user;
  const { id } = req.params;
  const { data_hora, data_hora_fim } = req.body;

  if (!data_hora)
    return res.status(400).json({ error: "data_hora obrigatória" });

  try {
    const { rows: check } = await database.query(
      "SELECT profissional_id, data_hora_fim, data_hora FROM agendamentos WHERE id = $1 AND clinica_id = $2",
      [id, clinica_id],
    );
    if (!check.length) return res.status(404).json({ error: "Não encontrado" });

    if (
      ["dentista", "esteticista"].includes(cargo) &&
      check[0].profissional_id !== userId
    ) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const profId = check[0].profissional_id;
    const duracaoAtual = check[0].data_hora_fim
      ? new Date(check[0].data_hora_fim) - new Date(check[0].data_hora)
      : 60 * 60000;
    const novoFim =
      data_hora_fim ||
      new Date(new Date(data_hora).getTime() + duracaoAtual).toISOString();

    const { rows: conflito } = await database.query(
      `SELECT id FROM agendamentos
       WHERE profissional_id = $1 AND id != $2
         AND status NOT IN ('cancelado','finalizado')
         AND data_hora < $4 AND data_hora_fim > $3`,
      [profId, id, data_hora, novoFim],
    );
    if (conflito.length) {
      return res.status(409).json({
        error: "Conflito de horário",
        detail: "Profissional já possui atendimento neste horário",
      });
    }

    const { rows } = await database.query(
      `UPDATE agendamentos
       SET data_hora = $1, data_hora_fim = $2, updated_at = NOW()
       WHERE id = $3 AND clinica_id = $4 RETURNING *`,
      [data_hora, novoFim, id, clinica_id],
    );
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Erro ao reagendar" });
  }
};

const atualizarProgresso = async (req, res) => {
  const { clinica_id, cargo, id: userId } = req.user;
  const { id } = req.params;
  const { progress } = req.body;

  const n = Number(progress);
  if (!Number.isFinite(n) || n < 0) {
    return res.status(400).json({ error: "Progresso inválido" });
  }

  try {
    const { rows: check } = await database.query(
      "SELECT profissional_id FROM agendamentos WHERE id = $1 AND clinica_id = $2",
      [id, clinica_id],
    );
    if (!check.length) return res.status(404).json({ error: "Não encontrado" });

    if (
      ["dentista", "esteticista"].includes(cargo) &&
      check[0].profissional_id !== userId
    ) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const { rows } = await database.query(
      `UPDATE agendamentos SET procedure_progress = $1, updated_at = NOW()
       WHERE id = $2 AND clinica_id = $3 RETURNING *`,
      [n, id, clinica_id],
    );
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Erro ao atualizar progresso" });
  }
};

const marcarPago = async (req, res) => {
  const { clinica_id } = req.user;
  const { id } = req.params;
  const { pago = true } = req.body;

  try {
    const { rows } = await database.query(
      `UPDATE agendamentos SET pago = $1, updated_at = NOW()
       WHERE id = $2 AND clinica_id = $3 RETURNING *`,
      [!!pago, id, clinica_id],
    );
    if (!rows.length) return res.status(404).json({ error: "Não encontrado" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Erro ao atualizar pagamento" });
  }
};

module.exports = {
  listarAgendamentos,
  getAgendamento,
  criarAgendamento,
  atualizarStatus,
  atualizarData,
  atualizarProgresso,
  marcarPago,
};
