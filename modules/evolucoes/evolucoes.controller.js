const database = require("../../config/database");

const listarEvolucoes = async (req, res) => {
  const { clinica_id } = req.user;
  const { paciente_id } = req.params;

  try {
    const { rows } = await database.query(
      `SELECT e.*, u.nome AS profissional_nome
       FROM evolucoes e
       JOIN usuarios u ON u.id = e.profissional_id
       WHERE e.paciente_id = $1 AND e.clinica_id = $2
       ORDER BY e.created_at DESC`,
      [paciente_id, clinica_id],
    );
    res.json(rows);
  } catch (error) {
    console.error("Erro listar evoluções:", error);
    res.status(500).json({ error: "Erro ao listar evoluções" });
  }
};

const criarEvolucao = async (req, res) => {
  const { clinica_id, id: profissional_id } = req.user;
  const {
    paciente_id,
    agendamento_id,
    descricao,
    procedimentos_realizados,
    anexos,
  } = req.body;

  if (!paciente_id || !descricao || !String(descricao).trim()) {
    return res
      .status(400)
      .json({ error: "paciente_id e descrição são obrigatórios" });
  }

  try {
    const { rows } = await database.query(
      `INSERT INTO evolucoes
       (clinica_id, paciente_id, agendamento_id, profissional_id,
        descricao, procedimentos_realizados, anexos)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        clinica_id,
        paciente_id,
        agendamento_id || null,
        profissional_id,
        String(descricao).trim(),
        JSON.stringify(procedimentos_realizados || []),
        JSON.stringify(anexos || []),
      ],
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Erro criar evolução:", error);
    res.status(500).json({ error: "Erro ao criar evolução" });
  }
};

module.exports = { listarEvolucoes, criarEvolucao };
