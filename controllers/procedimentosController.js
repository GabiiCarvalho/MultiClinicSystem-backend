const { Procedimento } = require('../models');

module.exports = {

  async listar(req, res) {
    const procedimentos = await Procedimento.findAll({
      where: { loja_id: req.lojaId }
    });

    return res.json(procedimentos);
  },

  async criar(req, res) {
    const procedimento = await Procedimento.create({
      ...req.body,
      loja_id: req.lojaId
    });

    return res.status(201).json(procedimento);
  }

};