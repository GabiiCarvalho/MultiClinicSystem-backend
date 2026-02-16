const { Categoria, Procedimento } = require('../models');

module.exports = {
  async listar(req, res) {
    const { lojaId } = req;

    const categorias = await Categoria.findAll({
      where: { loja_id: lojaId },
      include: [{ model: Procedimento, as: 'procedimentos' }],
      order: [['nome', 'ASC']]
    });

    return res.json(categorias);
  },

  async criar(req, res) {
    const { lojaId } = req;
    const { nome, descricao } = req.body;

    const categoria = await Categoria.create({
      nome,
      descricao,
      loja_id: lojaId
    });

    return res.status(201).json(categoria);
  },

  async obterPorId(req, res) {
    const { lojaId } = req;
    const { categoriaId } = req.params;

    const categoria = await Categoria.findOne({
      where: { id: categoriaId, loja_id: lojaId },
      include: [{ model: Procedimento, as: 'procedimentos' }]
    });

    if (!categoria) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    return res.json(categoria);
  },

  async atualizar(req, res) {
    const { lojaId } = req;
    const { categoriaId } = req.params;

    const categoria = await Categoria.findOne({ 
      where: { id: categoriaId, loja_id: lojaId } 
    });

    if (!categoria) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    await categoria.update(req.body);
    return res.json(categoria);
  },

  async listarProcedimentos(req, res) {
    const { lojaId } = req;
    const { categoriaId } = req.params;

    const procedimentos = await Procedimento.findAll({
      where: { 
        categoria_id: categoriaId,
        loja_id: lojaId 
      },
      order: [['nome', 'ASC']]
    });

    return res.json(procedimentos);
  }
};