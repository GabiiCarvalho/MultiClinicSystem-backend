const { Financeiro } = require('../models');

module.exports = {

  async listar(req, res) {
    const registros = await Financeiro.findAll({
      where: { loja_id: req.lojaId }
    });

    return res.json(registros);
  },

  async criar(req, res) {
    const registro = await Financeiro.create({
      ...req.body,
      loja_id: req.lojaId
    });

    return res.status(201).json(registro);
  }

};