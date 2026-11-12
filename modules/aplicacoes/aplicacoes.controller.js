const database = require("../../config/database");

const UNIDADES = ["un", "ml", "ui", "mg", "g"];

const listarPorPaciente = async (req, res) => {
  const { clinica_id } = req.user;
  const { paciente_id } = req.params;
  try {
    const { rows } = await database.query(
      `SELECT a.*, l.numero_lote, l.data_validade,
              p.nome AS produto_nome, p.fabricante, p.tipo,
              u.nome AS profissional_nome
       FROM aplicacoes_produtos a
       JOIN lotes_produto l ON l.id = a.lote_id
       JOIN produtos_estetica p ON p.id = l.produto_id
       JOIN usuarios u ON u.id = a.profissional_id
       WHERE a.paciente_id = $1 AND a.clinica_id = $2
       ORDER BY a.aplicado_em DESC`,
      [paciente_id, clinica_id],
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao listar aplicações" });
  }
};

const criar = async (req, res) => {
  const { clinica_id, id: profissional_id } = req.user;
  const {
    paciente_id,
    agendamento_id,
    evolucao_id,
    lote_id,
    quantidade,
    unidade,
    regiao_aplicada,
    observacoes,
  } = req.body;

  if (!paciente_id || !lote_id) {
    return res
      .status(400)
      .json({ error: "paciente_id e lote_id são obrigatórios" });
  }
  if (unidade && !UNIDADES.includes(unidade)) {
    return res
      .status(400)
      .json({ error: "Unidade inválida", unidades: UNIDADES });
  }

  const client = await database.connect();
  try {
    await client.query("BEGIN");

    const { rows: lotes } = await client.query(
      `SELECT quantidade_atual, data_validade FROM lotes_produto
       WHERE id = $1 AND clinica_id = $2 FOR UPDATE`,
      [lote_id, clinica_id],
    );
    if (!lotes.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Lote não encontrado" });
    }
    if (new Date(lotes[0].data_validade) < new Date()) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Lote vencido — não pode ser aplicado" });
    }

    const qtd = Number(quantidade) || 1;
    if (lotes[0].quantidade_atual < qtd) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: `Estoque insuficiente. Disponível: ${lotes[0].quantidade_atual}`,
      });
    }

    const { rows } = await client.query(
      `INSERT INTO aplicacoes_produtos
       (clinica_id, paciente_id, agendamento_id, evolucao_id, lote_id,
        profissional_id, quantidade, unidade, regiao_aplicada, observacoes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        clinica_id,
        paciente_id,
        agendamento_id || null,
        evolucao_id || null,
        lote_id,
        profissional_id,
        qtd,
        unidade || "un",
        regiao_aplicada || null,
        observacoes || null,
      ],
    );

    await client.query(
      `UPDATE lotes_produto SET quantidade_atual = quantidade_atual - $1 WHERE id = $2`,
      [qtd, lote_id],
    );

    await client.query("COMMIT");
    res.status(201).json(rows[0]);
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(e);
    res.status(500).json({ error: "Erro ao registrar aplicação" });
  } finally {
    client.release();
  }
};

const rastrearLote = async (req, res) => {
  const { clinica_id } = req.user;
  const { lote_id } = req.params;
  try {
    const { rows } = await database.query(
      `SELECT a.aplicado_em, a.quantidade, a.unidade, a.regiao_aplicada,
              pac.nome AS paciente_nome, pac.telefone,
              u.nome AS profissional_nome,
              l.numero_lote, p.nome AS produto_nome
       FROM aplicacoes_produtos a
       JOIN pacientes pac ON pac.id = a.paciente_id
       JOIN usuarios u ON u.id = a.profissional_id
       JOIN lotes_produto l ON l.id = a.lote_id
       JOIN produtos_estetica p ON p.id = l.produto_id
       WHERE a.lote_id = $1 AND a.clinica_id = $2
       ORDER BY a.aplicado_em DESC`,
      [lote_id, clinica_id],
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao rastrear lote" });
  }
};

module.exports = { listarPorPaciente, criar, rastrearLote };
