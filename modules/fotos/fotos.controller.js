const database = require("../../config/database");

const TIPOS_VALIDOS = ["antes", "depois", "evolucao", "documentacao"];

const listarFotos = async (req, res) => {
  const { clinica_id } = req.user;
  const { paciente_id } = req.params;
  const { tipo, agendamento_id } = req.query;

  try {
    const conditions = ["clinica_id = $1", "paciente_id = $2"];
    const values = [clinica_id, paciente_id];
    let p = 3;

    if (tipo) {
      conditions.push(`tipo = $${p++}`);
      values.push(tipo);
    }
    if (agendamento_id) {
      conditions.push(`agendamento_id = $${p++}`);
      values.push(agendamento_id);
    }

    const { rows } = await database.query(
      `SELECT * FROM fotos_paciente
       WHERE ${conditions.join(" AND ")}
       ORDER BY data_captura DESC`,
      values,
    );
    res.json(rows);
  } catch (error) {
    console.error("Erro listar fotos:", error);
    res.status(500).json({ error: "Erro ao listar fotos" });
  }
};

const criarFoto = async (req, res) => {
  const { clinica_id, id: profissional_id } = req.user;
  const {
    paciente_id,
    agendamento_id,
    tipo,
    categoria,
    url,
    storage_key,
    descricao,
  } = req.body;

  if (!paciente_id || !tipo || !url) {
    return res
      .status(400)
      .json({ error: "paciente_id, tipo e url são obrigatórios" });
  }
  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res
      .status(400)
      .json({ error: "Tipo inválido", tiposValidos: TIPOS_VALIDOS });
  }

  try {
    const { rows: pac } = await database.query(
      "SELECT id FROM pacientes WHERE id = $1 AND clinica_id = $2",
      [paciente_id, clinica_id],
    );
    if (!pac.length)
      return res.status(404).json({ error: "Paciente não encontrado" });

    const { rows } = await database.query(
      `INSERT INTO fotos_paciente
       (clinica_id, paciente_id, agendamento_id, profissional_id,
        tipo, categoria, url, storage_key, descricao)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        clinica_id,
        paciente_id,
        agendamento_id || null,
        profissional_id,
        tipo,
        categoria || null,
        url,
        storage_key || null,
        descricao || null,
      ],
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Erro criar foto:", error);
    res.status(500).json({ error: "Erro ao criar foto" });
  }
};

const deletarFoto = async (req, res) => {
  const { clinica_id } = req.user;
  const { id } = req.params;

  try {
    const { rows } = await database.query(
      `DELETE FROM fotos_paciente WHERE id = $1 AND clinica_id = $2 RETURNING id`,
      [id, clinica_id],
    );
    if (!rows.length)
      return res.status(404).json({ error: "Foto não encontrada" });
    res.json({ message: "Foto removida" });
  } catch (error) {
    console.error("Erro deletar foto:", error);
    res.status(500).json({ error: "Erro ao deletar foto" });
  }
};

module.exports = { listarFotos, criarFoto, deletarFoto };
