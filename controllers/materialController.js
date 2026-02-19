const { Material, MaterialMovimentacao, Pessoa, sequelize } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async criar(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { lojaId, userId } = req;
      const { 
        nome, descricao, quantidade, unidade, quantidade_minima,
        preco_unitario, fornecedor, categoria, localizacao,
        data_validade, lote, observacoes
      } = req.body;

      const material = await Material.create({
        nome,
        descricao,
        quantidade: quantidade || 0,
        unidade: unidade || 'un',
        quantidade_minima: quantidade_minima || 10,
        preco_unitario: preco_unitario || 0,
        fornecedor,
        categoria,
        localizacao,
        data_validade,
        lote,
        observacoes,
        loja_id: lojaId
      }, { transaction });

      if (quantidade > 0) {
        await MaterialMovimentacao.create({
          material_id: material.id,
          tipo: 'entrada',
          quantidade,
          quantidade_anterior: 0,
          quantidade_nova: quantidade,
          motivo: 'Cadastro inicial',
          usuario_id: userId,
          loja_id: lojaId
        }, { transaction });
      }

      await transaction.commit();
      return res.status(201).json(material);
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao criar material:', error);
      return res.status(500).json({ error: 'Erro ao criar material' });
    }
  },

  async listar(req, res) {
    try {
      const { lojaId } = req;
      const { 
        categoria, 
        estoque_baixo, 
        search,
        pagina = 1, 
        limite = 20 
      } = req.query;

      const where = { loja_id: lojaId, ativo: true };

      if (categoria) where.categoria = categoria;
      if (estoque_baixo === 'true') {
        where.quantidade = { [Op.lte]: sequelize.col('quantidade_minima') };
      }
      if (search) {
        where[Op.or] = [
          { nome: { [Op.iLike]: `%${search}%` } },
          { descricao: { [Op.iLike]: `%${search}%` } },
          { fornecedor: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const materiais = await Material.findAndCountAll({
        where,
        order: [['categoria', 'ASC'], ['nome', 'ASC']],
        limit: parseInt(limite),
        offset: (pagina - 1) * parseInt(limite)
      });

      const materiaisComStatus = materiais.rows.map(m => {
        const mJson = m.toJSON();
        mJson.estoque_status = m.quantidade <= 0 ? 'esgotado' :
                               m.quantidade <= m.quantidade_minima ? 'baixo' : 'normal';
        mJson.valor_total = parseFloat(m.quantidade) * parseFloat(m.preco_unitario);
        return mJson;
      });

      return res.json({
        total: materiais.count,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(materiais.count / limite),
        materiais: materiaisComStatus
      });
    } catch (error) {
      console.error('Erro ao listar materiais:', error);
      return res.status(500).json({ error: 'Erro ao listar materiais' });
    }
  },

  async obterPorId(req, res) {
    try {
      const { lojaId } = req;
      const { id } = req.params;

      const material = await Material.findOne({
        where: { id, loja_id: lojaId, ativo: true },
        include: [
          { 
            model: MaterialMovimentacao, 
            as: 'movimentacoes',
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [{ model: Pessoa, as: 'usuario', attributes: ['id', 'nome'] }]
          }
        ]
      });

      if (!material) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }

      const materialJson = material.toJSON();
      materialJson.estoque_status = material.quantidade <= 0 ? 'esgotado' :
                                    material.quantidade <= material.quantidade_minima ? 'baixo' : 'normal';
      materialJson.valor_total = parseFloat(material.quantidade) * parseFloat(material.preco_unitario);

      return res.json(materialJson);
    } catch (error) {
      console.error('Erro ao obter material:', error);
      return res.status(500).json({ error: 'Erro ao obter material' });
    }
  },

  async atualizar(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { lojaId, userId } = req;
      const { id } = req.params;
      const updateData = req.body;

      const material = await Material.findOne({
        where: { id, loja_id: lojaId }
      });

      if (!material) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }

      const quantidadeAnterior = parseFloat(material.quantidade);
      const quantidadeNova = parseFloat(updateData.quantidade) !== undefined ? 
                            parseFloat(updateData.quantidade) : quantidadeAnterior;

      await material.update(updateData, { transaction });

      if (quantidadeNova !== quantidadeAnterior) {
        const tipo = quantidadeNova > quantidadeAnterior ? 'entrada' : 'saida';
        
        await MaterialMovimentacao.create({
          material_id: material.id,
          tipo,
          quantidade: Math.abs(quantidadeNova - quantidadeAnterior),
          quantidade_anterior: quantidadeAnterior,
          quantidade_nova: quantidadeNova,
          motivo: 'Atualização manual',
          usuario_id: userId,
          loja_id: lojaId,
          observacoes: updateData.observacoes
        }, { transaction });
      }

      await transaction.commit();
      return res.json(material);
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao atualizar material:', error);
      return res.status(500).json({ error: 'Erro ao atualizar material' });
    }
  },

  async deletar(req, res) {
    try {
      const { lojaId } = req;
      const { id } = req.params;

      const material = await Material.findOne({
        where: { id, loja_id: lojaId }
      });

      if (!material) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }

      await material.update({ ativo: false });

      return res.json({ message: 'Material removido com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar material:', error);
      return res.status(500).json({ error: 'Erro ao deletar material' });
    }
  },

  async registrarMovimentacao(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { lojaId, userId } = req;
      const { id } = req.params;
      const { tipo, quantidade, motivo, agendamento_id, observacoes } = req.body;

      const material = await Material.findOne({
        where: { id, loja_id: lojaId }
      });

      if (!material) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }

      if (quantidade <= 0) {
        return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
      }

      const quantidadeAnterior = parseFloat(material.quantidade);
      let quantidadeNova = quantidadeAnterior;

      if (tipo === 'entrada') {
        quantidadeNova = quantidadeAnterior + quantidade;
      } else if (tipo === 'saida') {
        if (quantidadeAnterior < quantidade) {
          return res.status(400).json({ error: 'Quantidade insuficiente em estoque' });
        }
        quantidadeNova = quantidadeAnterior - quantidade;
      } else if (tipo === 'ajuste') {
        quantidadeNova = quantidade;
      }

      await material.update({ quantidade: quantidadeNova }, { transaction });

      const movimentacao = await MaterialMovimentacao.create({
        material_id: material.id,
        tipo,
        quantidade,
        quantidade_anterior: quantidadeAnterior,
        quantidade_nova: quantidadeNova,
        motivo,
        usuario_id: userId,
        agendamento_id,
        observacoes,
        loja_id: lojaId
      }, { transaction });

      await transaction.commit();

      return res.json({ material, movimentacao });
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao registrar movimentação:', error);
      return res.status(500).json({ error: 'Erro ao registrar movimentação' });
    }
  },

  async estatisticas(req, res) {
    try {
      const { lojaId } = req;

      const [
        totalMateriais,
        totalValor,
        materiaisBaixo,
        materiaisEsgotados
      ] = await Promise.all([
        Material.count({ where: { loja_id: lojaId, ativo: true } }),
        Material.findAll({
          where: { loja_id: lojaId, ativo: true },
          attributes: [
            [sequelize.fn('SUM', sequelize.literal('quantidade * preco_unitario')), 'total_valor']
          ],
          raw: true
        }),
        Material.count({
          where: {
            loja_id: lojaId,
            ativo: true,
            quantidade: { [Op.lte]: sequelize.col('quantidade_minima') },
            quantidade: { [Op.gt]: 0 }
          }
        }),
        Material.count({
          where: {
            loja_id: lojaId,
            ativo: true,
            quantidade: { [Op.lte]: 0 }
          }
        })
      ]);

      return res.json({
        total_materiais: totalMateriais,
        valor_total_estoque: parseFloat(totalValor[0]?.total_valor || 0),
        materiais_estoque_baixo: materiaisBaixo,
        materiais_esgotados: materiaisEsgotados
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return res.status(500).json({ error: 'Erro ao obter estatísticas' });
    }
  }
};