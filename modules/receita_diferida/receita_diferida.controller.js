const database = require("../../config/database");

const resumo = async (req, res) => {
  const { clinica_id } = req.user;
  try {
    const { rows: vendidos } = await database.query(
      `SELECT COALESCE(SUM(valor_total), 0) AS total
       FROM pacotes_paciente WHERE clinica_id = $1`,
      [clinica_id],
    );
    const { rows: reconhecidos } = await database.query(
      `SELECT COALESCE(SUM(valor_reconhecido), 0) AS total
       FROM receita_reconhecida WHERE clinica_id = $1`,
      [clinica_id],
    );
    const totalVendido = Number(vendidos[0].total) || 0;
    const totalReconhecido = Number(reconhecidos[0].total) || 0;
    res.json({
      total_vendido: totalVendido,
      total_reconhecido: totalReconhecido,
      receita_diferida: Math.max(0, totalVendido - totalReconhecido),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao calcular resumo" });
  }
};

const porPaciente = async (req, res) => {
  const { clinica_id } = req.user;
  const { paciente_id } = req.params;
  try {
    const { rows } = await database.query(
      `SELECT p.id, p.nome, p.total_sessoes, p.sessoes_usadas,
              p.valor_total, p.valor_sessao_avulsa, p.status,
              proc.nome AS procedimento_nome,
              COALESCE(
                (SELECT SUM(valor_reconhecido) FROM receita_reconhecida r WHERE r.pacote_id = p.id),
                0
              ) AS valor_reconhecido
       FROM pacotes_paciente p
       JOIN procedimentos proc ON proc.id = p.procedimento_id
       WHERE p.paciente_id = $1 AND p.clinica_id = $2
       ORDER BY p.created_at DESC`,
      [paciente_id, clinica_id],
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao listar por paciente" });
  }
};

module.exports = { resumo, porPaciente };
