const database = require("../../config/database");

const TIPOS = [
  "toxina",
  "preenchedor",
  "bioestimulador",
  "fio",
  "peeling",
  "outro",
];

const listar = async (req, res) => {
  const { clinica_id } = req.user;
  try {
    const { rows } = await database.query(
      `SELECT * FROM produtos_estetica WHERE clinica_id = $1 AND ativo = true ORDER BY nome`,
      [clinica_id],
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao listar produtos" });
  }
};

const criar = async (req, res) => {
  const { clinica_id } = req.user;
  const { nome, fabricante, principio_ativo, registro_anvisa, tipo } = req.body;
  if (!nome || !fabricante || !tipo) {
    return res
      .status(400)
      .json({ error: "nome, fabricante e tipo são obrigatórios" });
  }
  if (!TIPOS.includes(tipo)) {
    return res.status(400).json({ error: "Tipo inválido", tipos: TIPOS });
  }
  try {
    const { rows } = await database.query(
      `INSERT INTO produtos_estetica (clinica_id, nome, fabricante, principio_ativo, registro_anvisa, tipo)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        clinica_id,
        nome,
        fabricante,
        principio_ativo || null,
        registro_anvisa || null,
        tipo,
      ],
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao criar produto" });
  }
};

module.exports = { listar, criar };
