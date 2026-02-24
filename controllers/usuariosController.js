const bcrypt = require('bcryptjs');
const { Pessoa } = require('../models');

module.exports = {

  async listar(req, res) {
    const usuarios = await Pessoa.findAll({
      where: { loja_id: req.lojaId }
    });

    return res.json(usuarios);
  },

  async criar(req, res) {
    const { senha } = req.body;

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await Pessoa.create({
      ...req.body,
      senha: senhaHash,
      loja_id: req.lojaId
    });

    return res.status(201).json(usuario);
  }

};