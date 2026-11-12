const database = require("../../config/database");

const DENTES_VALIDOS = [
  "18",
  "17",
  "16",
  "15",
  "14",
  "13",
  "12",
  "11",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "48",
  "47",
  "46",
  "45",
  "44",
  "43",
  "42",
  "41",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "55",
  "54",
  "53",
  "52",
  "51",
  "61",
  "62",
  "63",
  "64",
  "65",
  "85",
  "84",
  "83",
  "82",
  "81",
  "71",
  "72",
  "73",
  "74",
  "75",
];

const CONDICOES_VALIDAS = [
  "higido",
  "cariado",
  "restaurado",
  "coroa",
  "extracao_indicada",
  "extruido",
  "ausente",
  "implante",
  "protese",
  "fratura",
  "tratamento_canal",
];

const listarOdontogramas = async (req, res) => {
  const { clinica_id } = req.user;
  const { paciente_id } = req.params;
  try {
    const { rows } = await database.query(
      `SELECT o.*, u.nome AS profissional_nome
       FROM odontogramas o
       JOIN usuarios u ON u.id = o.profissional_id
       WHERE o.paciente_id = $1 AND o.clinica_id = $2
       ORDER BY o.created_at DESC`,
      [paciente_id, clinica_id],
    );
    res.json(rows);
  } catch (error) {
    console.error("Erro listar odontogramas:", error);
    res.status(500).json({ error: "Erro ao listar odontogramas" });
  }
};

const getOdontogramaAtual = async (req, res) => {
  const { clinica_id } = req.user;
  const { paciente_id } = req.params;
  try {
    const { rows } = await database.query(
      `SELECT o.*, u.nome AS profissional_nome
       FROM odontogramas o
       JOIN usuarios u ON u.id = o.profissional_id
       WHERE o.paciente_id = $1 AND o.clinica_id = $2
       ORDER BY o.created_at DESC LIMIT 1`,
      [paciente_id, clinica_id],
    );
    res.json(rows[0] || null);
  } catch (error) {
    console.error("Erro getOdontogramaAtual:", error);
    res.status(500).json({ error: "Erro ao buscar odontograma" });
  }
};

const criarOdontograma = async (req, res) => {
  const { clinica_id, id: profissional_id } = req.user;
  const { paciente_id, agendamento_id, dentes, observacoes } = req.body;

  if (!paciente_id || !dentes || typeof dentes !== "object") {
    return res
      .status(400)
      .json({ error: "paciente_id e dentes são obrigatórios" });
  }

  for (const [dente, info] of Object.entries(dentes)) {
    if (!DENTES_VALIDOS.includes(dente)) {
      return res.status(400).json({ error: `Dente inválido: ${dente}` });
    }
    if (info && info.condicao && !CONDICOES_VALIDAS.includes(info.condicao)) {
      return res.status(400).json({
        error: `Condição inválida para dente ${dente}: ${info.condicao}`,
      });
    }
  }

  try {
    const { rows: pac } = await database.query(
      "SELECT id FROM pacientes WHERE id = $1 AND clinica_id = $2",
      [paciente_id, clinica_id],
    );
    if (!pac.length) {
      return res.status(404).json({ error: "Paciente não encontrado" });
    }

    const { rows } = await database.query(
      `INSERT INTO odontogramas
       (clinica_id, paciente_id, profissional_id, agendamento_id, dentes, observacoes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        clinica_id,
        paciente_id,
        profissional_id,
        agendamento_id || null,
        dentes,
        observacoes || null,
      ],
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Erro criar odontograma:", error);
    res.status(500).json({ error: "Erro ao criar odontograma" });
  }
};

module.exports = { listarOdontogramas, getOdontogramaAtual, criarOdontograma };
