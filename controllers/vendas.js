const { Venda, VendaItem, Paciente, Procedimento, Agendamento } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async criar(req, res) {
    const { lojaId, userId } = req;
    const { paciente_id, itens, forma_pagamento, observacoes } = req.body;

    // Verifica se paciente pertence à loja
    if (paciente_id) {
      const paciente = await Paciente.findOne({ 
        where: { id: paciente_id, loja_id: lojaId } 
      });
      if (!paciente) {
        return res.status(400).json({ error: 'Paciente não encontrado' });
      }
    }

    let subtotal = 0;
    const itensVenda = [];

    // Valida e calcula os itens
    for (const item of itens) {
      if (item.procedimento_id) {
        const procedimento = await Procedimento.findOne({ 
          where: { id: item.procedimento_id, loja_id: lojaId } 
        });
        if (!procedimento) {
          return res.status(400).json({ error: `Procedimento ID ${item.procedimento_id} não encontrado` });
        }

        const totalItem = procedimento.preco * (item.quantidade || 1);
        subtotal += totalItem;

        itensVenda.push({
          procedimento_id: procedimento.id,
          item_nome: procedimento.nome,
          item_descricao: procedimento.descricao,
          quantidade: item.quantidade || 1,
          preco_unitario: procedimento.preco,
          total: totalItem
        });

        // Se houver agendamento associado
        if (item.agendamento_id) {
          const agendamento = await Agendamento.findOne({
            where: { 
              id: item.agendamento_id,
              loja_id: lojaId
            }
          });
          if (!agendamento) {
            return res.status(400).json({ error: `Agendamento ID ${item.agendamento_id} não encontrado` });
          }
          itensVenda[itensVenda.length - 1].agendamento_id = agendamento.id;
        }
      } else {
        return res.status(400).json({ error: 'Item deve conter procedimento_id' });
      }
    }

    // Cria a venda
    const venda = await Venda.create({
      loja_id: lojaId,
      paciente_id: paciente_id || null,
      usuario_id: userId,
      subtotal,
      total: subtotal,
      forma_pagamento,
      observacoes
    });

    // Cria os itens da venda
    const itensCriados = await Promise.all(
      itensVenda.map(item => VendaItem.create({
        venda_id: venda.id,
        ...item
      }))
    );

    return res.status(201).json({
      venda,
      itens: itensCriados
    });
  },

  async listar(req, res) {
    const { lojaId } = req;
    const { data_inicio, data_fim, pagina = 1, limite = 20 } = req.query;

    const where = { loja_id: lojaId };

    if (data_inicio && data_fim) {
      where.data_hora = {
        [Op.between]: [new Date(data_inicio), new Date(data_fim)]
      };
    }

    const vendas = await Venda.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: (pagina - 1) * limite,
      include: [
        { model: Paciente, as: 'paciente', attributes: ['id', 'nome', 'telefone'] },
        { model: VendaItem, as: 'itens' }
      ],
      order: [['data_hora', 'DESC']]
    });

    return res.json({
      total: vendas.count,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(vendas.count / limite),
      vendas: vendas.rows
    });
  },

  async obterPorId(req, res) {
    const { lojaId } = req;
    const { vendaId } = req.params;

    const venda = await Venda.findOne({
      where: { id: vendaId, loja_id: lojaId },
      include: [
        { model: Paciente, as: 'paciente' },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome'] },
        { model: VendaItem, as: 'itens' }
      ]
    });

    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    return res.json(venda);
  },

  async relatorioPeriodo(req, res) {
    const { lojaId } = req;
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Datas de início e fim são obrigatórias' });
    }

    const vendas = await Venda.findAll({
      where: {
        loja_id: lojaId,
        data_hora: {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        }
      },
      include: [
        { model: Paciente, attributes: ['id', 'nome'] },
        { model: VendaItem, include: [
          { model: Procedimento, attributes: ['id', 'nome'] }
        ]}
      ],
      order: [['data_hora', 'DESC']]
    });

    const totalVendas = vendas.reduce((sum, venda) => sum + parseFloat(venda.total), 0);
    const totalItens = vendas.reduce((sum, venda) => sum + venda.VendaItems.length, 0);

    // Agrupar por forma de pagamento
    const pagamentos = {};
    vendas.forEach(venda => {
      if (!pagamentos[venda.forma_pagamento]) {
        pagamentos[venda.forma_pagamento] = 0;
      }
      pagamentos[venda.forma_pagamento] += parseFloat(venda.total);
    });

    return res.json({
      periodo: `${data_inicio} até ${data_fim}`,
      total_vendas: vendas.length,
      valor_total: totalVendas,
      total_itens: totalItens,
      pagamentos,
      vendas
    });
  },

  async cancelar(req, res) {
    const { lojaId } = req;
    const { vendaId } = req.params;
    const { motivo } = req.body;

    const venda = await Venda.findOne({
      where: { id: vendaId, loja_id: lojaId }
    });

    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    await venda.update({ status: 'cancelado', observacoes: motivo });
    return res.json({ message: 'Venda cancelada com sucesso' });
  }
};