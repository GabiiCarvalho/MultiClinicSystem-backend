const database = require("../../config/database");

const listarMateriais = async (req, res) => {
  const { clinica_id } = req.user;
  const { search, categoria, estoque_baixo } = req.query;

  try {
    const conditions = ["clinica_id = $1"];
    const values = [clinica_id];
    let p = 2;

    if (search) {
      conditions.push(`nome ILIKE $${p++}`);
      values.push(`%${search}%`);
    }
    if (categoria) {
      conditions.push(`categoria = $${p++}`);
      values.push(categoria);
    }
    if (estoque_baixo === "true") {
      conditions.push(`quantidade <= quantidade_minima`);
    }

    const query = `
      SELECT *, (quantidade * preco_unitario) AS valor_total 
      FROM materiais 
      WHERE ${conditions.join(" AND ")}
      ORDER BY nome ASC
    `;

    const { rows } = await database.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar materiais:", error);
    res.status(500).json({ error: "Erro ao listar materiais" });
  }
};

const criarMaterial = async (req, res) => {
  const { clinica_id } = req.user;
  const {
    nome,
    descricao,
    quantidade,
    unidade,
    quantidade_minima,
    preco_unitario,
    fornecedor,
    categoria,
    localizacao,
    data_validade,
    lote,
    observacoes,
  } = req.body;

  if (!nome) return res.status(400).json({ error: "Nome é obrigatório" });

  try {
    const { rows } = await database.query(
      `INSERT INTO materiais 
       (clinica_id, nome, descricao, quantidade, unidade, quantidade_minima,
        preco_unitario, fornecedor, categoria, localizacao, data_validade, lote, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        clinica_id,
        nome,
        descricao || null,
        quantidade || 0,
        unidade || "un",
        quantidade_minima || 10,
        preco_unitario || 0,
        fornecedor || null,
        categoria || "consumivel",
        localizacao || null,
        data_validade || null,
        lote || null,
        observacoes || null,
      ],
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Erro ao criar material:", error);
    res.status(500).json({ error: "Erro ao criar material" });
  }
};

const atualizarMaterial = async (req, res) => {
  const { clinica_id } = req.user;
  const { id } = req.params;
  const fields = req.body;

  try {
    const updates = [];
    const values = [];
    let p = 1;

    Object.keys(fields).forEach((key) => {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${p++}`);
        values.push(fields[key]);
      }
    });

    if (!updates.length)
      return res.status(400).json({ error: "Nada para atualizar" });

    values.push(id, clinica_id);
    const { rows } = await database.query(
      `UPDATE materiais SET ${updates.join(", ")} WHERE id = $${p++} AND clinica_id = $${p} RETURNING *`,
      values,
    );
    if (!rows.length)
      return res.status(404).json({ error: "Material não encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar material:", error);
    res.status(500).json({ error: "Erro ao atualizar material" });
  }
};

const deletarMaterial = async (req, res) => {
  const { clinica_id } = req.user;
  const { id } = req.params;
  try {
    const { rows } = await database.query(
      `DELETE FROM materiais WHERE id = $1 AND clinica_id = $2 RETURNING id`,
      [id, clinica_id],
    );
    if (!rows.length)
      return res.status(404).json({ error: "Material não encontrado" });
    res.json({ message: "Material removido com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar material:", error);
    res.status(500).json({ error: "Erro ao deletar material" });
  }
};

const getEstatisticas = async (req, res) => {
  const { clinica_id } = req.user;
  try {
    const { rows } = await database.query(
      `SELECT 
         COUNT(*) as total_materiais,
         COALESCE(SUM(quantidade * preco_unitario), 0) as valor_total_estoque,
         COUNT(*) FILTER (WHERE quantidade <= quantidade_minima AND quantidade > 0) as materiais_estoque_baixo,
         COUNT(*) FILTER (WHERE quantidade <= 0) as materiais_esgotados
       FROM materiais WHERE clinica_id = $1`,
      [clinica_id],
    );
    res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
};

// ✅ Rota de movimentação de estoque (entrada/saída)
const movimentarEstoque = async (req, res) => {
  const { clinica_id } = req.user;
  const { id } = req.params;
  const { tipo, quantidade, motivo } = req.body;

  if (!quantidade || quantidade <= 0) {
    return res
      .status(400)
      .json({ error: "Quantidade deve ser maior que zero" });
  }

  try {
    const { rows: mat } = await database.query(
      `SELECT quantidade FROM materiais WHERE id = $1 AND clinica_id = $2`,
      [id, clinica_id],
    );
    if (!mat.length)
      return res.status(404).json({ error: "Material não encontrado" });

    let novaQtd = Number(mat[0].quantidade);
    if (tipo === "entrada") novaQtd += Number(quantidade);
    else if (tipo === "saida") novaQtd -= Number(quantidade);
    else if (tipo === "ajuste") novaQtd = Number(quantidade);

    if (novaQtd < 0) novaQtd = 0;

    await database.query(
      `UPDATE materiais SET quantidade = $1 WHERE id = $2 AND clinica_id = $3`,
      [novaQtd, id, clinica_id],
    );

    res.json({
      message: "Estoque atualizado com sucesso",
      novaQuantidade: novaQtd,
    });
  } catch (error) {
    console.error("Erro ao movimentar estoque:", error);
    res.status(500).json({ error: "Erro ao movimentar estoque" });
  }
};

module.exports = {
  listarMateriais,
  criarMaterial,
  atualizarMaterial,
  deletarMaterial,
  getEstatisticas,
  movimentarEstoque,
};
