const { Dentista, Agendamento } = require('../models');

module.exports = {
  async listar(req, res) {
    const { lojaId } = req;
    const { ativo, pagina = 1, limite = 20 } = req.query;

    const where = { loja_id: lojaId };
    if (ativo !== undefined) where.ativo = ativo === 'true';

    const dentistas = await Dentista.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: (pagina - 1) * limite,
      order: [['nome', 'ASC']]
    });

    return res.json({
      total: dentistas.count,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(dentistas.count / limite),
      dentistas: dentistas.rows
    });
  },

  async criar(req, res) {
    const { lojaId } = req;
    const { nome, cro, especialidade, telefone, email, horario_inicio, horario_fim, dias_atendimento } = req.body;

    const dentistaExistente = await Dentista.findOne({ 
      where: { cro, loja_id: lojaId } 
    });

    if (dentistaExistente) {
      return res.status(400).json({ error: 'Dentista já cadastrado com este CRO' });
    }

    const dentista = await Dentista.create({
      nome,
      cro,
      especialidade,
      telefone,
      email,
      horario_inicio,
      horario_fim,
      dias_atendimento,
      loja_id: lojaId,
      ativo: true
    });

    return res.status(201).json(dentista);
  },

  async obterPorId(req, res) {
    const { lojaId } = req;
    const { dentistaId } = req.params;

    const dentista = await Dentista.findOne({
      where: { id: dentistaId, loja_id: lojaId },
      include: [
        { model: Agendamento, limit: 10, order: [['data_hora', 'DESC']] }
      ]
    });

    if (!dentista) {
      return res.status(404).json({ error: 'Dentista não encontrado' });
    }

    return res.json(dentista);
  },

  async atualizar(req, res) {
    const { lojaId } = req;
    const { dentistaId } = req.params;

    const dentista = await Dentista.findOne({ 
      where: { id: dentistaId, loja_id: lojaId } 
    });

    if (!dentista) {
      return res.status(404).json({ error: 'Dentista não encontrado' });
    }

    await dentista.update(req.body);
    return res.json(dentista);
  },

  async listarAgendamentos(req, res) {
    const { lojaId } = req;
    const { dentistaId } = req.params;
    const { data_inicio, data_fim } = req.query;

    const where = { 
      dentista_id: dentistaId,
      loja_id: lojaId 
    };

    if (data_inicio && data_fim) {
      where.data_hora = {
        [Op.between]: [new Date(data_inicio), new Date(data_fim)]
      };
    }

    const agendamentos = await Agendamento.findAll({
      where,
      include: [
        { model: Paciente, attributes: ['id', 'nome', 'telefone'] }
      ],
      order: [['data_hora', 'ASC']]
    });

    return res.json(agendamentos);
  }
};