const database = require("../../config/database");

const listar = async (req, res) => {
  const { clinica_id } = req.user;
  const { produto_id, vencendo } = req.query;
  try {
    const cond = ["l.clinica_id = $1"];
    const values = [clinica_id];
    let p = 2;
    if (produto_id) {
      cond.push(`l.produto_id = $${p++}`);
      values.push(produto_id);
    }
    if (vencendo === "true") {
      cond.push(`l.data_validade <= NOW() + INTERVAL '90 days'`);
    }

    const { rows } = await database.query(
      `SELECT l.*, pe.nome AS produto_nome, pe.fabricante,
              (l.quantidade_atual > 0) AS disponivel
       FROM lotes_produto l
       JOIN produtos_estetica pe ON pe.id = l.produto_id
       WHERE ${cond.join(" AND ")}
       ORDER BY l.data_validade ASC`,
      values,
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao listar lotes" });
  }
};

const criar = async (req, res) => {
  const { clinica_id } = req.user;
  const {
    produto_id,
    numero_lote,
    data_validade,
    quantidade_inicial,
    fornecedor,
    nota_fiscal,
  } = req.body;
  if (!produto_id || !numero_lote || !data_validade) {
    return res
      .status(400)
      .json({
        error: "produto_id, numero_lote e data_validade são obrigatórios",
      });
  }
  try {
    const qtd = Number(quantidade_inicial) || 1;
    const { rows } = await database.query(
      `INSERT INTO lotes_produto
       (clinica_id, produto_id, numero_lote, data_validade, quantidade_inicial, quantidade_atual, fornecedor, nota_fiscal)
       VALUES ($1,$2,$3,$4,$5,$5,$6,$7) RETURNING *`,
      [
        clinica_id,
        produto_id,
        numero_lote,
        data_validade,
        qtd,
        fornecedor || null,
        nota_fiscal || null,
      ],
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === "23505") {
      return res
        .status(409)
        .json({ error: "Lote já cadastrado para este produto" });
    }
    console.error(e);
    res.status(500).json({ error: "Erro ao criar lote" });
  }
};

module.exports = { listar, criar };
