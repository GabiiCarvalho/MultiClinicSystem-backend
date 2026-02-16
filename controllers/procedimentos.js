const { Procedimento, Categoria, AgendamentoItem } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async listar(req, res) {
    try {
      const { lojaId } = req;
      const { ativo, categoria_id, pagina = 1, limite = 20 } = req.query;

      const where = { loja_id: lojaId };
      if (ativo) where.ativo = ativo === 'true';
      if (categoria_id) where.categoria_id = categoria_id;

      const procedimentos = await Procedimento.findAndCountAll({
        where,
        include: [{ model: Categoria, as: 'categoria' }],
        limit: parseInt(limite),
        offset: (pagina - 1) * limite,
        order: [['nome', 'ASC']]
      });

      res.json({
        total: procedimentos.count,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(procedimentos.count / limite),
        procedimentos: procedimentos.rows
      });
    } catch (error) {
      console.error('Erro ao listar procedimentos:', error);
      res.status(500).json({ error: 'Erro ao listar procedimentos' });
    }
  },

  async cadastrar(req, res) {
    try {
      const { lojaId } = req;
      const { nome, descricao, preco, duracao_minutos, categoria_id } = req.body;

      const procedimento = await Procedimento.create({
        nome,
        descricao,
        preco,
        duracao_minutos,
        categoria_id,
        loja_id: lojaId,
        ativo: true
      });

      res.status(201).json(procedimento);
    } catch (error) {
      console.error('Erro ao cadastrar procedimento:', error);
      res.status(500).json({ error: 'Erro ao cadastrar procedimento' });
    }
  },

  async obterPorId(req, res) {
    try {
      const { lojaId } = req;
      const { id } = req.params;

      const procedimento = await Procedimento.findOne({
        where: { id, loja_id: lojaId },
        include: [
          { model: Categoria, as: 'categoria' },
          { model: AgendamentoItem, as: 'agendamentoItens', limit: 10, order: [['createdAt', 'DESC']] }
        ]
      });

      if (!procedimento) {
        return res.status(404).json({ error: 'Procedimento não encontrado' });
      }

      res.json(procedimento);
    } catch (error) {
      console.error('Erro ao obter procedimento:', error);
      res.status(500).json({ error: 'Erro ao obter procedimento' });
    }
  },

  async atualizar(req, res) {
    try {
      const { lojaId } = req;
      const { id } = req.params;

      const procedimento = await Procedimento.findOne({ where: { id, loja_id: lojaId } });
      if (!procedimento) {
        return res.status(404).json({ error: 'Procedimento não encontrado' });
      }

      await procedimento.update(req.body);
      res.json(procedimento);
    } catch (error) {
      console.error('Erro ao atualizar procedimento:', error);
      res.status(500).json({ error: 'Erro ao atualizar procedimento' });
    }
  },

  async atualizarStatus(req, res) {
    try {
      const { lojaId } = req;
      const { id } = req.params;
      const { ativo } = req.body;

      const procedimento = await Procedimento.findOne({ where: { id, loja_id: lojaId } });
      if (!procedimento) {
        return res.status(404).json({ error: 'Procedimento não encontrado' });
      }

      await procedimento.update({ ativo });
      res.json(procedimento);
    } catch (error) {
      console.error('Erro ao atualizar status do procedimento:', error);
      res.status(500).json({ error: 'Erro ao atualizar status do procedimento' });
    }
  }
};