const { Dentista } = require('../models');

module.exports = {

  async listar(req, res) {
    const dentistas = await Dentista.findAll({
      where: { loja_id: req.lojaId }
    });

    return res.json(dentistas);
  },

  async criar(req, res) {
    const dentista = await Dentista.create({
      ...req.body,
      loja_id: req.lojaId
    });

    return res.status(201).json(dentista);
  }

};