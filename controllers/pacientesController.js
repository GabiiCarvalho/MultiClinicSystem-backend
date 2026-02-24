const { Paciente } = require('../models');

module.exports = {

  async listar(req, res) {
    const pacientes = await Paciente.findAll({
      where: { loja_id: req.lojaId }
    });

    return res.json(pacientes);
  },

  async criar(req, res) {
    const paciente = await Paciente.create({
      ...req.body,
      loja_id: req.lojaId
    });

    return res.status(201).json(paciente);
  },

  async atualizar(req, res) {
    const { id } = req.params;

    const paciente = await Paciente.findOne({
      where: { id, loja_id: req.lojaId }
    });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    await paciente.update(req.body);

    return res.json(paciente);
  },

  async deletar(req, res) {
    const { id } = req.params;

    const paciente = await Paciente.findOne({
      where: { id, loja_id: req.lojaId }
    });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    await paciente.destroy();

    return res.json({ message: 'Paciente removido' });
  }

};