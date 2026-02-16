const { Agendamento, Paciente, Dentista, Categoria, Procedimento, Usuario, AgendamentoItem } = require('../models');

module.exports = {
  async criar(req, res) {
    const { loja_id, paciente_id, dentista_id, data_hora, procedimentos, observacoes } = req.body;

    // Verifica se o paciente pertence à loja
    const paciente = await Paciente.findOne({ where: { id: paciente_id, loja_id } });
    if (!paciente) {
      return res.status(400).json({ error: 'Paciente não encontrado nesta loja' });
    }

    // Verifica se o dentista pertence à loja
    const dentista = await Dentista.findOne({ where: { id: dentista_id, loja_id } });
    if (!dentista) {
      return res.status(400).json({ error: 'Dentista não encontrado nesta loja' });
    }

    // Calcula a data/hora final baseada nos procedimentos
    let data_hora_fim = new Date(data_hora);
    let totalProcedimentos = 0;

    // Verifica cada procedimento
    for (const procedimentoReq of procedimentos) {
      const procedimento = await Procedimento.findOne({
        where: { id: procedimentoReq.procedimento_id, loja_id }
      });

      if (!procedimento) {
        return res.status(400).json({
          error: `Procedimento ID ${procedimentoReq.procedimento_id} não encontrado`
        });
      }

      data_hora_fim = new Date(data_hora_fim.getTime() + procedimento.duracao_minutos * 60000);
      totalProcedimentos += procedimento.preco;
    }

    // Cria o agendamento
    const agendamento = await Agendamento.create({
      loja_id,
      paciente_id,
      dentista_id,
      usuario_id: req.userId,
      data_hora,
      data_hora_fim,
      status: 'agendado',
      observacoes
    });

    // Cria os itens do agendamento
    const itens = [];
    for (const procedimentoReq of procedimentos) {
      const procedimento = await Procedimento.findByPk(procedimentoReq.procedimento_id);

      const item = await AgendamentoItem.create({
        agendamento_id: agendamento.id,
        procedimento_id: procedimento.id,
        nome_procedimento: procedimento.nome,
        descricao_procedimento: procedimento.descricao,
        preco: procedimento.preco,
        observacoes: procedimentoReq.observacoes
      });

      itens.push(item);
    }

    return res.status(201).json({
      agendamento,
      procedimentos: itens,
      total: totalProcedimentos
    });
  },

  async listarPorLoja(req, res) {
    const { lojaId } = req.params;
    const { data_inicio, data_fim, status } = req.query;

    const where = { loja_id: lojaId };

    if (status) {
      where.status = status;
    }

    if (data_inicio && data_fim) {
      where.data_hora = {
        [Op.between]: [new Date(data_inicio), new Date(data_fim)]
      };
    }

    const agendamentos = await Agendamento.findAll({
      where,
      include: [
        { model: Paciente, as: 'Paciente' },
        { model: Dentista, as: 'Dentista' },
        { model: Usuario, as: 'Usuario', attributes: ['id', 'nome'] },
        { model: AgendamentoItem, as: 'Itens' }
      ],
      order: [['data_hora', 'ASC']]
    });

    return res.json(agendamentos);
  },

  async atualizarStatus(req, res) {
    const { agendamentoId } = req.params;
    const { status } = req.body;

    const agendamento = await Agendamento.findByPk(agendamentoId);

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    await agendamento.update({ status });
    return res.json(agendamento);
  }
};