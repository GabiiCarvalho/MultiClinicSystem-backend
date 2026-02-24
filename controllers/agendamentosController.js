const { Agendamento } = require('../models');

module.exports = {

  async listar(req, res) {
    const agendamentos = await Agendamento.findAll({
      where: { loja_id: req.lojaId }
    });

    return res.json(agendamentos);
  },

  async criar(req, res) {
    const agendamento = await Agendamento.create({
      ...req.body,
      loja_id: req.lojaId,
      usuario_id: req.userId
    });

    return res.status(201).json(agendamento);
  }

};