const database = require("../../config/database");

/**
 * POST /consumo
 * Body: {
 *   paciente_id, agendamento_id,
 *   tipo: 'material' | 'injetavel',
 *   item_id,           // material_id OU produto_estetica_id
 *   lote_id,           // obrigatório se tipo='injetavel'
 *   quantidade,
 *   unidade,           // 'un'|'ml'|'ui'|'mg'|'g'
 *   regiao_aplicada,   // só injetável
 *   observacoes
 * }
 *
 * Lógica inteligente:
 * - Se tipo='material': busca em `materiais`, valida estoque, desconta, grava em `movimentacoes_estoque`
 * - Se tipo='injetavel': busca `lotes_produto`, aplica FIFO se lote_id não vier, valida estoque, desconta, grava em `aplicacoes_produtos`
 */
const consumir = async (req, res) => {
  const { clinica_id, id: profissional_id } = req.user;
  const {
    paciente_id,
    agendamento_id,
    tipo,
    item_id,
    lote_id,
    quantidade,
    unidade = "un",
    regiao_aplicada,
    observacoes,
  } = req.body;

  // Validações
  if (!paciente_id || !tipo || !item_id) {
    return res
      .status(400)
      .json({ error: "paciente_id, tipo e item_id são obrigatórios" });
  }
  if (!["material", "injetavel"].includes(tipo)) {
    return res
      .status(400)
      .json({ error: "tipo deve ser 'material' ou 'injetavel'" });
  }
  const qtd = Number(quantidade);
  if (!qtd || qtd <= 0) {
    return res
      .status(400)
      .json({ error: "quantidade deve ser maior que zero" });
  }

  const client = await database.connect();
  try {
    await client.query("BEGIN");

    // Verifica paciente pertence à clínica
    const { rows: pac } = await client.query(
      "SELECT id FROM pacientes WHERE id = $1 AND clinica_id = $2",
      [paciente_id, clinica_id],
    );
    if (!pac.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Paciente não encontrado" });
    }

    let resultado;

    // ═══════════════════════════════════════════════════════
    // CASO 1: MATERIAL COMUM (luvas, seringas, anestésico...)
    // ═══════════════════════════════════════════════════════
    if (tipo === "material") {
      const { rows: mat } = await client.query(
        `SELECT id, nome, quantidade, preco_unitario, unidade
         FROM materiais
         WHERE id = $1 AND clinica_id = $2
         FOR UPDATE`,
        [item_id, clinica_id],
      );
      if (!mat.length) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Material não encontrado" });
      }
      if (mat[0].quantidade < qtd) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Estoque insuficiente de "${mat[0].nome}". Disponível: ${mat[0].quantidade} ${mat[0].unidade}`,
        });
      }

      // Desconta
      const novoEstoque = Number(mat[0].quantidade) - qtd;
      await client.query(`UPDATE materiais SET quantidade = $1 WHERE id = $2`, [
        novoEstoque,
        item_id,
      ]);

      // Registra histórico
      const { rows: mov } = await client.query(
        `INSERT INTO movimentacoes_estoque
         (clinica_id, material_id, tipo, quantidade, valor_unitario,
          motivo, paciente_id, agendamento_id, usuario_id, observacoes)
         VALUES ($1,$2,'saida',$3,$4,'Consumo em procedimento',$5,$6,$7,$8)
         RETURNING *`,
        [
          clinica_id,
          item_id,
          qtd,
          mat[0].preco_unitario,
          paciente_id,
          agendamento_id || null,
          profissional_id,
          observacoes || null,
        ],
      );

      resultado = {
        tipo: "material",
        material_nome: mat[0].nome,
        quantidade_consumida: qtd,
        estoque_restante: novoEstoque,
        movimentacao: mov[0],
      };
    }

    // ═══════════════════════════════════════════════════════
    // CASO 2: INJETÁVEL (toxina, preenchedor, bioestimulador)
    // ═══════════════════════════════════════════════════════
    if (tipo === "injetavel") {
      // Busca o produto estético
      const { rows: prod } = await client.query(
        `SELECT id, nome, fabricante FROM produtos_estetica
         WHERE id = $1 AND clinica_id = $2 AND ativo = true`,
        [item_id, clinica_id],
      );
      if (!prod.length) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      let loteEscolhido = null;

      // Se lote_id foi informado, valida ele
      if (lote_id) {
        const { rows: lote } = await client.query(
          `SELECT id, numero_lote, data_validade, quantidade_atual
           FROM lotes_produto
           WHERE id = $1 AND clinica_id = $2 AND produto_id = $3
           FOR UPDATE`,
          [lote_id, clinica_id, item_id],
        );
        if (!lote.length) {
          await client.query("ROLLBACK");
          return res.status(404).json({ error: "Lote não encontrado" });
        }
        if (new Date(lote[0].data_validade) < new Date()) {
          await client.query("ROLLBACK");
          return res
            .status(400)
            .json({ error: `Lote ${lote[0].numero_lote} está VENCIDO` });
        }
        if (Number(lote[0].quantidade_atual) < qtd) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            error: `Estoque insuficiente no lote ${lote[0].numero_lote}. Disponível: ${lote[0].quantidade_atual}`,
          });
        }
        loteEscolhido = lote[0];
      } else {
        // FIFO: escolhe o lote mais próximo de vencer que tenha estoque suficiente
        const { rows: lotes } = await client.query(
          `SELECT id, numero_lote, data_validade, quantidade_atual
           FROM lotes_produto
           WHERE produto_id = $1 AND clinica_id = $2
             AND quantidade_atual >= $3
             AND data_validade > NOW()
           ORDER BY data_validade ASC
           LIMIT 1
           FOR UPDATE`,
          [item_id, clinica_id, qtd],
        );
        if (!lotes.length) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            error: `Nenhum lote disponível de "${prod[0].nome}" com estoque de ${qtd} ${unidade}.`,
          });
        }
        loteEscolhido = lotes[0];
      }

      // Desconta do lote
      const novoLoteEstoque = Number(loteEscolhido.quantidade_atual) - qtd;
      await client.query(
        `UPDATE lotes_produto SET quantidade_atual = $1 WHERE id = $2`,
        [novoLoteEstoque, loteEscolhido.id],
      );

      // Registra aplicação
      const { rows: aplic } = await client.query(
        `INSERT INTO aplicacoes_produtos
         (clinica_id, paciente_id, agendamento_id, lote_id,
          profissional_id, quantidade, unidade, regiao_aplicada, observacoes,
          quantidade_estoque_momento)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING *`,
        [
          clinica_id,
          paciente_id,
          agendamento_id || null,
          loteEscolhido.id,
          profissional_id,
          qtd,
          unidade,
          regiao_aplicada || null,
          observacoes || null,
          novoLoteEstoque,
        ],
      );

      resultado = {
        tipo: "injetavel",
        produto_nome: prod[0].nome,
        lote: loteEscolhido.numero_lote,
        data_validade: loteEscolhido.data_validade,
        quantidade_consumida: qtd,
        unidade,
        estoque_restante_lote: novoLoteEstoque,
        aplicacao: aplic[0],
      };
    }

    await client.query("COMMIT");
    res.status(201).json(resultado);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Erro ao consumir estoque:", error);
    res.status(500).json({ error: "Erro ao registrar consumo" });
  } finally {
    client.release();
  }
};

/**
 * GET /consumo/paciente/:paciente_id
 * Histórico de todos os consumos do paciente (materiais + injetáveis)
 */
const historicoPaciente = async (req, res) => {
  const { clinica_id } = req.user;
  const { paciente_id } = req.params;

  try {
    // Materiais consumidos
    const { rows: materiais } = await database.query(
      `SELECT
         'material' AS tipo,
         m.id AS item_id,
         m.nome AS item_nome,
         mov.quantidade,
         m.unidade,
         NULL AS lote,
         NULL AS regiao,
         mov.created_at AS data_uso,
         u.nome AS profissional_nome,
         mov.observacoes
       FROM movimentacoes_estoque mov
       JOIN materiais m ON m.id = mov.material_id
       JOIN usuarios u ON u.id = mov.usuario_id
       WHERE mov.clinica_id = $1 AND mov.paciente_id = $2 AND mov.tipo = 'saida'`,
      [clinica_id, paciente_id],
    );

    // Injetáveis aplicados
    const { rows: injetaveis } = await database.query(
      `SELECT
         'injetavel' AS tipo,
         p.id AS item_id,
         p.nome AS item_nome,
         a.quantidade,
         a.unidade,
         l.numero_lote AS lote,
         a.regiao_aplicada AS regiao,
         a.aplicado_em AS data_uso,
         u.nome AS profissional_nome,
         a.observacoes
       FROM aplicacoes_produtos a
       JOIN lotes_produto l ON l.id = a.lote_id
       JOIN produtos_estetica p ON p.id = l.produto_id
       JOIN usuarios u ON u.id = a.profissional_id
       WHERE a.clinica_id = $1 AND a.paciente_id = $2`,
      [clinica_id, paciente_id],
    );

    const todos = [...materiais, ...injetaveis].sort(
      (a, b) => new Date(b.data_uso) - new Date(a.data_uso),
    );

    res.json(todos);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
};

module.exports = { consumir, historicoPaciente };
