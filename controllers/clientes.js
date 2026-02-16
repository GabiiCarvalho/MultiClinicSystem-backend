const { Paciente, Agendamento } = require('../models');

module.exports = {
  async listar(req, res) {
    const { lojaId } = req;
    const { pagina = 1, limite = 20 } = req.query;

    const pacientes = await Paciente.findAndCountAll({
      where: { loja_id: lojaId },
      limit: parseInt(limite),
      offset: (pagina - 1) * limite,
      order: [['nome', 'ASC']]
    });

    return res.json({
      total: pacientes.count,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(pacientes.count / limite),
      pacientes: pacientes.rows
    });
  },

  async criar(req, res) {
    const { lojaId } = req;
    const { nome, telefone, email, cpf, data_nascimento, endereco, observacoes } = req.body;

    // Verifica se paciente já existe pelo telefone ou CPF
    const pacienteExistente = await Paciente.findOne({ 
      where: { 
        [Op.or]: [
          { telefone, loja_id: lojaId },
          { cpf, loja_id: lojaId }
        ]
      } 
    });

    if (pacienteExistente) {
      return res.status(400).json({ error: 'Paciente já cadastrado com este telefone ou CPF' });
    }

    const paciente = await Paciente.create({
      nome,
      telefone,
      email,
      cpf,
      data_nascimento,
      endereco,
      observacoes,
      loja_id: lojaId
    });

    return res.status(201).json(paciente);
  },

  async buscar(req, res) {
    const { lojaId } = req;
    const { termo } = req.params;

    const pacientes = await Paciente.findAll({
      where: {
        loja_id: lojaId,
        [Op.or]: [
          { nome: { [Op.iLike]: `%${termo}%` } },
          { telefone: { [Op.iLike]: `%${termo}%` } },
          { cpf: { [Op.iLike]: `%${termo}%` } }
        ]
      },
      limit: 10
    });

    return res.json(pacientes);
  },

  async obterPorId(req, res) {
    const { lojaId } = req;
    const { pacienteId } = req.params;

    const paciente = await Paciente.findOne({
      where: { id: pacienteId, loja_id: lojaId },
      include: [
        { model: Agendamento, limit: 10, order: [['data_hora', 'DESC']] }
      ]
    });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    return res.json(paciente);
  },

  async atualizar(req, res) {
    const { lojaId } = req;
    const { pacienteId } = req.params;

    const paciente = await Paciente.findOne({ 
      where: { id: pacienteId, loja_id: lojaId } 
    });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    await paciente.update(req.body);
    return res.json(paciente);
  },

  async listarAgendamentos(req, res) {
    const { lojaId } = req;
    const { pacienteId } = req.params;

    const agendamentos = await Agendamento.findAll({
      where: { 
        paciente_id: pacienteId,
        loja_id: lojaId
      },
      include: [
        { model: Dentista, attributes: ['id', 'nome', 'especialidade'] }
      ],
      order: [['data_hora', 'DESC']]
    });

    return res.json(agendamentos);
  }
};